import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/api";
import {
  getReceiptPdfRequest,
  getReceiptRequest,
  getSubscriptionsRequest,
  getTransactionRequest,
  getTransactionsRequest,
} from "./api/billing.api";
import { toTransactionRow } from "./mappers/billing.mapper";
import { InvoicesPage, SubscriptionsPage } from "./pages/billing-pages";
import type { TransactionPageResponse, TransactionSummaryResponse } from "./types/billing.types";

vi.mock("./api/billing.api", () => ({
  getTransactionsRequest: vi.fn(),
  getTransactionRequest: vi.fn(),
  getReceiptRequest: vi.fn(),
  getReceiptPdfRequest: vi.fn(),
  getSubscriptionsRequest: vi.fn(),
}));

const list = vi.mocked(getTransactionsRequest);
const detail = vi.mocked(getTransactionRequest);
const receipt = vi.mocked(getReceiptRequest);
const pdf = vi.mocked(getReceiptPdfRequest);
const subscriptions = vi.mocked(getSubscriptionsRequest);

const ok = <T,>(data: T) => ({ data: { status: "success", data } }) as never;

const ROW: TransactionSummaryResponse = {
  reference: "5b2c1f0e-1d2a-4f6b-9c11-2f0f8a7d6e11",
  purpose: "PURCHASE",
  course: { id: 7, title: "مقدمة في البرمجة", imageUrl: null, instructorName: null },
  description: "مقدمة في البرمجة",
  amount: 450,
  currency: "EGP",
  status: "PAID",
  provenance: "SIMULATED",
  createdAt: "2026-09-27T12:00:00",
  paidAt: "2026-09-27T12:00:00",
  receiptNumber: "DEMO-2026-000042",
  courseAccess: "ACTIVE",
};

function page(overrides: Partial<TransactionPageResponse> = {}): TransactionPageResponse {
  return {
    items: [ROW], page: 0, size: 10, totalItems: 1, totalPages: 1,
    confirmedTotals: [], provenanceCounts: { LIVE: 0, SIMULATED: 1, LEGACY: 0 }, ...overrides,
  };
}

function Where() {
  const location = useLocation();
  return <p data-testid="where">{location.pathname + location.search}</p>;
}

function openAt(path: string, element: React.ReactNode) {
  const router = createMemoryRouter(
    [{ path: "/settings/billing/*", element: <>{element}<Where /></> }],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

beforeEach(() => vi.clearAllMocks());

describe("invoices and payments", () => {
  it("never counts a simulated payment as money paid, and says what it left out", async () => {
    list.mockResolvedValue(ok(page()));
    openAt("/settings/billing/invoices", <InvoicesPage />);

    const summary = await screen.findByRole("region", { name: "ملخص المدفوعات" });
    expect(within(summary).getByText("لا توجد مدفوعات مؤكدة")).toBeInTheDocument();
    expect(within(summary).getByText(/لا يشمل ١ عملية تجريبية أو سابقة/)).toBeInTheDocument();
    expect(screen.getAllByText("محاكاة — لا أموال فعلية").length).toBeGreaterThan(0);
  });

  it("shows confirmed totals per currency, never added together", async () => {
    list.mockResolvedValue(ok(page({ confirmedTotals: [{ currency: "EGP", amount: 150, count: 2 }, { currency: "USD", amount: 20, count: 1 }] })));
    openAt("/settings/billing/invoices", <InvoicesPage />);
    const summary = await screen.findByRole("region", { name: "ملخص المدفوعات" });
    expect(within(summary).getByText("١٥٠ ج.م")).toBeInTheDocument();
    expect(within(summary).getByText("٢٠ USD")).toBeInTheDocument();
  });

  it("keeps filters in the address and sends them to the server", async () => {
    const user = userEvent.setup();
    list.mockResolvedValue(ok(page()));
    openAt("/settings/billing/invoices?status=PAID&range=30d", <InvoicesPage />);

    await waitFor(() => expect(list).toHaveBeenCalled());
    expect(list.mock.calls[0][0]).toMatchObject({ status: "PAID", page: 0, size: 10 });
    expect(list.mock.calls[0][0].from).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    await user.type(screen.getByLabelText(/ابحث برقم الإيصال/), "DEMO-2026");
    await user.click(screen.getByRole("button", { name: "بحث" }));
    await waitFor(() => expect(screen.getByTestId("where").textContent).toContain("q=DEMO-2026"));
    expect(list.mock.calls[list.mock.calls.length - 1]?.[0]).toMatchObject({ q: "DEMO-2026", status: "PAID" });

    await user.click(screen.getByRole("button", { name: "مسح الكل" }));
    await waitFor(() => expect(screen.getByTestId("where").textContent).toBe("/settings/billing/invoices"));
  });

  it("opens a transaction from ?tx= with its receipt, and downloads the PDF", async () => {
    const user = userEvent.setup();
    list.mockResolvedValue(ok(page()));
    detail.mockResolvedValue(ok({
      summary: ROW, lines: [{ description: "مقدمة في البرمجة", amount: 450 }], subtotal: 450, discount: 0, total: 450,
      refundedAmount: 0, gatewayReference: "sim_1", subscriptionTerm: null,
    }));
    receipt.mockResolvedValue(ok({
      number: "DEMO-2026-000042", issuedAt: "2026-09-27T12:00:00", simulated: true, fiscal: false, customerName: "سارة",
      customerEmail: "s@example.com", lineDescription: "مقدمة في البرمجة", amount: 450, currency: "EGP",
      transactionReference: ROW.reference, gatewayReference: "sim_1",
    }));
    pdf.mockResolvedValue({ data: new Blob(["%PDF-"], { type: "application/pdf" }) } as never);
    const createUrl = vi.fn(() => "blob:receipt");
    Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: vi.fn() });

    openAt(`/settings/billing/invoices?tx=${ROW.reference}`, <InvoicesPage />);
    const drawer = await screen.findByRole("dialog", { name: "تفاصيل العملية" });
    expect(await within(drawer).findByText("إيصال تجريبي")).toBeInTheDocument();
    expect(within(drawer).getByText(/محاكاة دفع — لم تُحصَّل أي أموال فعلية/)).toBeInTheDocument();

    await user.click(within(drawer).getByRole("button", { name: "تحميل الإيصال PDF" }));
    await waitFor(() => expect(pdf).toHaveBeenCalledWith("DEMO-2026-000042"));
    expect(createUrl).toHaveBeenCalled();
  });

  it("says a transaction is not found rather than showing someone else's", async () => {
    list.mockResolvedValue(ok(page()));
    detail.mockRejectedValue(new ApiError(404, ["not found"]));
    openAt("/settings/billing/invoices?tx=unknown", <InvoicesPage />);
    expect(await screen.findByText("لم يتم العثور على هذه العملية.")).toBeInTheDocument();
  });

  it("keeps an unknown amount unknown", () => {
    expect(toTransactionRow({ ...ROW, amount: null }).amountLabel).toBeNull();
    expect(toTransactionRow({ ...ROW, currency: null }).amountLabel).toBeNull();
  });
});

describe("subscriptions", () => {
  it("splits current from previous and presents every term as fixed", async () => {
    const base = {
      course: { id: 1, title: "الجبر", imageUrl: null, instructorName: "هالة" },
      plan: { id: 2, name: "فصلي", duration: 3, unit: "MONTH" },
      pricePaid: 400, currency: "EGP", status: "ACTIVE", renewalMode: "FIXED" as const,
      courseAccess: "ACTIVE" as const, transactionReference: ROW.reference, provenance: "SIMULATED" as const,
    };
    subscriptions.mockResolvedValue(ok({
      items: [
        { ...base, id: 1, startsAt: "2026-09-01T00:00:00", expiresAt: "2026-12-01T00:00:00", displayStatus: "FIXED_ACCESS" },
        { ...base, id: 2, startsAt: "2026-01-01T00:00:00", expiresAt: "2026-02-01T00:00:00", displayStatus: "EXPIRED", courseAccess: "NONE" },
      ],
      page: 0, size: 20, totalItems: 2, totalPages: 1, activeCount: 1,
    }));
    openAt("/settings/billing/subscriptions", <SubscriptionsPage />);

    const current = await screen.findByRole("region", { name: "الاشتراكات الحالية" });
    expect(within(current).getByText(/لا يتجدد تلقائيًا/)).toBeInTheDocument();
    expect(within(current).getByRole("link", { name: "عرض العملية" })).toHaveAttribute(
      "href", `/settings/billing/invoices?tx=${ROW.reference}`);
    expect(within(screen.getByRole("region", { name: "الاشتراكات السابقة" })).getByText("منتهٍ")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /إلغاء التجديد|تغيير البطاقة/ })).toBeNull();
    expect(screen.queryByText(/شهريًا/)).toBeNull();
  });
});

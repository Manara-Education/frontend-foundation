import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/api";
import {
  createRefundRequestRequest,
  getRefundRequestsRequest,
  getTransactionRequest,
  getTransactionsRequest,
} from "./api/billing.api";
import { InvoicesPage } from "./pages/billing-pages";
import type { RefundEligibility, RefundRequestResponse, TransactionSummaryResponse } from "./types/billing.types";

vi.mock("./api/billing.api", () => ({
  getTransactionsRequest: vi.fn(),
  getTransactionRequest: vi.fn(),
  getReceiptRequest: vi.fn(),
  getReceiptPdfRequest: vi.fn(),
  getRefundRequestsRequest: vi.fn(),
  createRefundRequestRequest: vi.fn(),
}));

const ok = <T,>(data: T) => ({ data: { status: "success", data } }) as never;

const ROW: TransactionSummaryResponse = {
  reference: "9d1c2a4e-7b3f-4f0a-8c21-5a6b7c8d9e01",
  purpose: "PURCHASE",
  course: { id: 7, title: "مقدمة في البرمجة", imageUrl: null, instructorName: null },
  description: "مقدمة في البرمجة",
  amount: 450,
  currency: "EGP",
  status: "PAID",
  provenance: "LIVE",
  createdAt: "2026-09-25T12:00:00",
  paidAt: "2026-09-25T12:00:00",
  receiptNumber: null,
  courseAccess: "ACTIVE",
};

const OPEN_REQUEST: RefundRequestResponse = {
  reference: "r-1", transactionReference: ROW.reference, reason: "ACCESS_PROBLEM", note: null, amount: 450, currency: "EGP",
  status: "SUBMITTED", createdAt: "2026-09-27T10:00:00", decidedAt: null, decisionNote: null,
};

function openDrawer(eligibility: RefundEligibility, summary: TransactionSummaryResponse = ROW) {
  vi.mocked(getTransactionsRequest).mockResolvedValue(ok({
    items: [summary], page: 0, size: 10, totalItems: 1, totalPages: 1, confirmedTotals: [],
    provenanceCounts: { LIVE: 1, SIMULATED: 0, LEGACY: 0 },
  }));
  vi.mocked(getTransactionRequest).mockResolvedValue(ok({
    summary, lines: [{ description: summary.description, amount: 450 }], subtotal: 450, discount: 0, total: 450,
    refundedAmount: 0, gatewayReference: null, subscriptionTerm: null, refundEligibility: eligibility,
  }));
  const router = createMemoryRouter([{ path: "/settings/billing/*", element: <InvoicesPage /> }], {
    initialEntries: [`/settings/billing/invoices?tx=${summary.reference}`],
  });
  render(<RouterProvider router={router} />);
  return screen.findByRole("dialog", { name: "تفاصيل العملية" });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getRefundRequestsRequest).mockResolvedValue(ok([]));
});

describe("refund requests", () => {
  it("submits a reason and a trimmed note, names no amount, and shows the request as under review only", async () => {
    const user = userEvent.setup();
    vi.mocked(createRefundRequestRequest).mockResolvedValue(ok({ ...OPEN_REQUEST, note: "لا تعمل الدروس" }));
    const drawer = await openDrawer("ELIGIBLE");

    await user.click(await within(drawer).findByRole("button", { name: "طلب استرداد" }));
    const send = within(drawer).getByRole("button", { name: "إرسال الطلب" });
    await user.click(within(drawer).getByLabelText("لا أستطيع الوصول إلى الدورة"));
    await user.type(within(drawer).getByLabelText(/تفاصيل إضافية/), "  لا تعمل الدروس  ");
    await user.click(send);

    await waitFor(() => expect(createRefundRequestRequest).toHaveBeenCalledTimes(1));
    expect(vi.mocked(createRefundRequestRequest).mock.calls[0]).toEqual([ROW.reference, { reason: "ACCESS_PROBLEM", note: "لا تعمل الدروس" }]);
    expect(await within(drawer).findByText("قيد المراجعة")).toBeInTheDocument();
    expect(within(drawer).getByText(/لا يعني الطلب إعادة المبلغ/)).toBeInTheDocument();
    expect(within(drawer).queryByRole("button", { name: "طلب استرداد" })).toBeNull();
    expect(within(drawer).queryByText(/تم الاسترداد|أُعيد المبلغ/)).toBeNull();
  });

  it("needs no reason, as the Terms grant the refund without one", async () => {
    const user = userEvent.setup();
    vi.mocked(createRefundRequestRequest).mockResolvedValue(ok({ ...OPEN_REQUEST, reason: null }));
    const drawer = await openDrawer("ELIGIBLE");
    await user.click(await within(drawer).findByRole("button", { name: "طلب استرداد" }));
    await user.click(within(drawer).getByRole("button", { name: "إرسال الطلب" }));
    await waitFor(() => expect(createRefundRequestRequest).toHaveBeenCalledWith(ROW.reference, {}));
    expect(await within(drawer).findByText("قيد المراجعة")).toBeInTheDocument();
  });

  it("points to the policy and the contact page when requests are not accepted online", async () => {
    const drawer = await openDrawer("UNAVAILABLE");
    const section = await within(drawer).findByRole("region", { name: "طلب استرداد" });
    expect(within(section).getByRole("link", { name: "سياسة الإلغاء والاسترداد" })).toHaveAttribute("href", "/terms#section-6");
    expect(within(section).getByRole("link", { name: "تواصل معنا" })).toHaveAttribute("href", "/contact");
    expect(within(section).queryByRole("button")).toBeNull();
  });

  it("offers nothing for a simulated payment", async () => {
    const drawer = await openDrawer("NOT_LIVE", { ...ROW, provenance: "SIMULATED" });
    await within(drawer).findByText(/محاكاة دفع/);
    expect(within(drawer).queryByRole("region", { name: "طلب استرداد" })).toBeNull();
    expect(getRefundRequestsRequest).not.toHaveBeenCalled();
  });

  it("never reports a submission that got no answer as sent", async () => {
    const user = userEvent.setup();
    vi.mocked(createRefundRequestRequest).mockRejectedValue(new ApiError(0, ["Network Error"]));
    const drawer = await openDrawer("ELIGIBLE");
    await user.click(await within(drawer).findByRole("button", { name: "طلب استرداد" }));
    await user.click(within(drawer).getByLabelText("سبب آخر"));
    await user.click(within(drawer).getByRole("button", { name: "إرسال الطلب" }));
    expect(await within(drawer).findByRole("alert")).toHaveTextContent(/لم نتأكد من وصول طلبك/);
    expect(within(drawer).queryByText("قيد المراجعة")).toBeNull();
  });

  it("shows the request that is already open instead of an error", async () => {
    const user = userEvent.setup();
    vi.mocked(createRefundRequestRequest).mockRejectedValue(new ApiError(409, ["open"], "REFUND_REQUEST_OPEN"));
    const drawer = await openDrawer("ELIGIBLE");
    await user.click(await within(drawer).findByRole("button", { name: "طلب استرداد" }));
    vi.mocked(getRefundRequestsRequest).mockResolvedValue(ok([OPEN_REQUEST]));
    await user.click(within(drawer).getByLabelText("سبب آخر"));
    await user.click(within(drawer).getByRole("button", { name: "إرسال الطلب" }));
    expect(await within(drawer).findByText("قيد المراجعة")).toBeInTheDocument();
    expect(within(drawer).queryByRole("alert")).toBeNull();
  });
});

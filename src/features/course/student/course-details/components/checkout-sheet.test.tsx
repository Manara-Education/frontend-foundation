import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/api";
import { MemoryRouter } from "react-router";
import { downloadReceiptPdf } from "@/features/settings/billing/services/billing.service";
import { getCheckoutQuote, loadCourseDetail, purchaseCourse, subscribeToCourse } from "../services/course-details.service";
import type { CourseDetailData } from "../types/course-details.types";
import { CheckoutSheet } from "./checkout-sheet";
import { PaymentCTASection } from "./payment-cta-section";

/*
  The checkout sheet against a stubbed checkout endpoint. What matters here is what the learner is
  told about each outcome — and that nothing is claimed that the server did not say.
*/
vi.mock("../services/course-details.service", () => ({
  purchaseCourse: vi.fn(),
  subscribeToCourse: vi.fn(),
  enrollFree: vi.fn(),
  loadCourseDetail: vi.fn(),
  getCheckoutQuote: vi.fn(),
}));
vi.mock("@/features/settings/billing/services/billing.service", () => ({ downloadReceiptPdf: vi.fn() }));
vi.mock("@/shared/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/auth")>();
  return {
    ...actual,
    useAuth: () => ({ status: "authenticated", user: { fullName: "سارة أحمد", email: "sara@example.com", role: "STUDENT", requiresPasswordReset: false } }),
  };
});

const purchase = vi.mocked(purchaseCourse);
const subscribe = vi.mocked(subscribeToCourse);
const reload = vi.mocked(loadCourseDetail);
const quote = vi.mocked(getCheckoutQuote);
const QUOTE = {
  courseId: 42, planId: null, accessType: "PURCHASE" as const, subtotal: 450, discount: 0, amount: 450, currency: "EGP",
  accessKind: "PERPETUAL" as const, accessDuration: null, accessUnit: null, renewalMode: null,
  payable: true, unavailableReason: null, simulated: false,
};

const COURSE = { id: 42, title: "أساسيات الجبر", image: "", accessType: "PURCHASE", purchasePriceLabel: "٤٥٠ ج.م" } as unknown as CourseDetailData;

function open(overrides: Partial<Parameters<typeof CheckoutSheet>[0]> = {}) {
  const onClose = vi.fn();
  const onGoToCourse = vi.fn();
  render(
    <MemoryRouter>
    <CheckoutSheet course={COURSE} kind="purchase" mode="browse" amountLabel="٤٥٠ ج.م" termsLabel="شراء مرة واحدة · وصول دائم" onClose={onClose} onGoToCourse={onGoToCourse} {...overrides} />
    </MemoryRouter>,
  );
  return { onClose, onGoToCourse };
}

const confirm = () => screen.getByRole("button", { name: /تأكيد ودفع ٤٥٠ ج.م/ });

beforeEach(() => {
  vi.clearAllMocks();
  // An older server has no quote; the sheet falls back to the page's offer.
  quote.mockRejectedValue(new ApiError(404, ["not found"]));
});

describe("checkout sheet", () => {
  it("prefills the contact details and summarises the order without inventing a method picker", () => {
    open();
    expect(screen.getByRole("dialog", { name: "إتمام الشراء" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("سارة أحمد")).toBeInTheDocument();
    expect(screen.getByDisplayValue("sara@example.com")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "ملخص الطلب" })).toHaveTextContent("شراء مرة واحدة · وصول دائم");
    expect(screen.queryByText(/بطاقة|CVV|رقم البطاقة/)).toBeNull();
  });

  it("labels a simulated success as a simulation and opens the course only when asked", async () => {
    const user = userEvent.setup();
    purchase.mockResolvedValue({ enrollmentId: 1, courseId: 42, accessType: "PURCHASE", access: null, paymentReference: "sim_abc123", simulated: true });
    const { onGoToCourse } = open();

    await user.click(confirm());
    expect(await screen.findByText("تمّت محاكاة الدفع بنجاح")).toBeInTheDocument();
    expect(screen.getByText("محاكاة دفع — لا تُجرى أي عملية خصم فعلية")).toBeInTheDocument();
    expect(screen.getByText("sim_abc123")).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 1500));
    expect(onGoToCourse).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "الانتقال إلى الدورة" }));
    expect(onGoToCourse).toHaveBeenCalledTimes(1);
  });

  it("never calls an unknown environment simulated", async () => {
    const user = userEvent.setup();
    purchase.mockResolvedValue({ enrollmentId: 1, courseId: 42, accessType: "PURCHASE", access: null, paymentReference: null });
    open();
    await user.click(confirm());
    expect(await screen.findByText("تمّت العملية بنجاح")).toBeInTheDocument();
    expect(screen.queryByText(/محاكاة/)).toBeNull();
  });

  it("keeps a refusal inside the sheet, without claiming nothing was charged", async () => {
    const user = userEvent.setup();
    purchase.mockRejectedValue(new ApiError(400, ["الدفع غير متاح حاليًا"], "PAYMENTS_UNAVAILABLE"));
    const { onClose } = open();

    await user.click(confirm());
    expect(await screen.findByText(/الدفع غير متاح حاليًا/)).toBeInTheDocument();
    expect(screen.queryByText(/لم يتم خصم/)).toBeNull();
    await user.click(screen.getByRole("button", { name: "إغلاق" }));
    expect(onClose).toHaveBeenCalledWith("confirmed-failure");
  });

  it("treats a lost response as uncertain, and a status check that finds access as success", async () => {
    const user = userEvent.setup();
    purchase.mockRejectedValue(new ApiError(0, ["Network Error"]));
    reload.mockResolvedValue({ access: { entitled: true } } as unknown as CourseDetailData);
    open();

    await user.click(confirm());
    expect(await screen.findByText("نتيجة غير مؤكدة")).toBeInTheDocument();
    expect(screen.queryByText("لم تكتمل العملية")).toBeNull();

    await user.click(screen.getByRole("button", { name: "التحقق من الحالة" }));
    expect(await screen.findByText("تم تفعيل وصولك إلى الدورة")).toBeInTheDocument();
    expect(reload).toHaveBeenCalledWith(42, "browse");
    expect(purchase).toHaveBeenCalledTimes(1);
  });

  it("offers a retry of the same checkout only after the status check finds no access", async () => {
    const user = userEvent.setup();
    subscribe.mockRejectedValueOnce(new ApiError(504, ["Gateway Timeout"])).mockResolvedValueOnce({
      enrollmentId: 1, courseId: 42, accessType: "SUBSCRIPTION", access: null, paymentReference: "sim_x", simulated: true,
    });
    reload.mockResolvedValue({ access: { entitled: false } } as unknown as CourseDetailData);
    open({ kind: "subscription", planId: 8 });

    await user.click(confirm());
    expect(await screen.findByText("نتيجة غير مؤكدة")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "المحاولة مرة أخرى" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "التحقق من الحالة" }));
    await user.click(await screen.findByRole("button", { name: "المحاولة مرة أخرى" }));
    expect(await screen.findByText("تمّت محاكاة الدفع بنجاح")).toBeInTheDocument();
    expect(subscribe).toHaveBeenCalledTimes(2);
    expect(subscribe.mock.calls.every(([courseId, planId]) => courseId === 42 && planId === 8)).toBe(true);
  });

  it("sends one request for a double click or Enter while submitting, and cannot be closed while it is in flight", async () => {
    const user = userEvent.setup();
    type Answer = Awaited<ReturnType<typeof purchaseCourse>>;
    let release: (value: Answer) => void = () => {};
    purchase.mockReturnValue(new Promise<Answer>((resolve) => { release = resolve; }));
    const { onClose } = open();

    await user.dblClick(confirm());
    // Enter in a field submits the form even while the button is disabled.
    await user.type(screen.getByDisplayValue("سارة أحمد"), "{Enter}");
    expect(purchase).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "إغلاق نافذة الشراء" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(onClose).not.toHaveBeenCalled();

    release({ enrollmentId: 1, courseId: 42, accessType: "PURCHASE", access: null, paymentReference: null });
    await waitFor(() => expect(screen.getByText("تمّت العملية بنجاح")).toBeInTheDocument());
  });

  it("closing before submitting is not a failure", async () => {
    const user = userEvent.setup();
    const { onClose } = open();
    await user.click(screen.getByRole("button", { name: "إغلاق نافذة الشراء" }));
    expect(onClose).toHaveBeenCalledWith("none");
  });
});

describe("purchase card", () => {
  it("makes no refund promise of its own, and links to the published policy", () => {
    render(<MemoryRouter><PaymentCTASection course={COURSE} mode="browse" onPay={vi.fn()} onRefresh={vi.fn()} /></MemoryRouter>);
    // No promise of its own — only a link to the published terms (14-day policy, terms §7).
    expect(screen.queryByText(/ضمان|خلال ٧ أيام/)).toBeNull();
    expect(screen.getByRole("link", { name: "سياسة الإلغاء والاسترداد" })).toHaveAttribute("href", "/terms#section-6");
  });
});

describe("with the server's quote", () => {
  it("prices from the quote and says it is a simulation before anything is sent", async () => {
    quote.mockResolvedValue({ ...QUOTE, amount: 400, simulated: true });
    open();
    expect(await screen.findByRole("button", { name: /تأكيد ودفع ٤٠٠ ج.م/ })).toBeEnabled();
    expect(screen.getByText("محاكاة دفع — لا تُجرى أي عملية خصم فعلية")).toBeInTheDocument();
    expect(purchase).not.toHaveBeenCalled();
  });

  it("does not offer to pay when the server says payments are unavailable", async () => {
    quote.mockResolvedValue({ ...QUOTE, payable: false, unavailableReason: "PAYMENTS_UNAVAILABLE" });
    open();
    expect(await screen.findByText(/الدفع غير متاح حاليًا على منارة/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /تأكيد ودفع/ })).toBeDisabled();
  });

  it("shows the recorded amount and receipt, and downloads it through the shared path", async () => {
    const user = userEvent.setup();
    quote.mockResolvedValue(QUOTE);
    purchase.mockResolvedValue({
      enrollmentId: 1, courseId: 42, accessType: "PURCHASE", access: null, paymentReference: "sim_1", simulated: true,
      transactionId: "5b2c1f0e-1d2a-4f6b-9c11-2f0f8a7d6e11", transactionStatus: "PAID", amount: 450, currency: "EGP",
      paidAt: "2026-09-27T12:00:00", receiptNumber: "DEMO-2026-000042",
    });
    vi.mocked(downloadReceiptPdf).mockResolvedValue();
    open();
    await user.click(await screen.findByRole("button", { name: /تأكيد ودفع ٤٥٠ ج.م/ }));

    expect(await screen.findByText("DEMO-2026-000042")).toBeInTheDocument();
    expect(screen.getByText("٤٥٠ ج.م", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "عرض الإيصال" })).toHaveAttribute(
      "href", "/settings/billing/invoices?tx=5b2c1f0e-1d2a-4f6b-9c11-2f0f8a7d6e11");
    await user.click(screen.getByRole("button", { name: "تحميل الإيصال" }));
    expect(downloadReceiptPdf).toHaveBeenCalledWith("DEMO-2026-000042");
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBillingCapabilitiesRequest } from "./api/billing.api";
import { PaymentMethodsPage } from "./pages/billing-pages";
import type { BillingCapabilitiesResponse } from "./types/billing.types";

vi.mock("./api/billing.api", () => ({ getBillingCapabilitiesRequest: vi.fn() }));

const capabilities = vi.mocked(getBillingCapabilitiesRequest);
const ok = (data: BillingCapabilitiesResponse) => ({ data: { status: "success", data } }) as never;

const NONE: BillingCapabilitiesResponse = {
  commerceMode: "DEMONSTRATION", provider: null, oneTimeCheckout: true, simulated: true, methodTypes: [],
  savedMethods: false, recurringCharges: false, statusRefresh: false, refunds: false,
};

beforeEach(() => vi.clearAllMocks());

describe("payment methods", () => {
  it("explains a demonstration deployment and offers nothing to add", async () => {
    capabilities.mockResolvedValue(ok(NONE));
    render(<PaymentMethodsPage />);
    expect(await screen.findByText(/بيئة تجريبية تُحاكي الدفع/)).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("textbox")).toBeNull();
  });

  it("says payments are off when the platform is free-only", async () => {
    capabilities.mockResolvedValue(ok({ ...NONE, commerceMode: "FREE_ONLY", oneTimeCheckout: false, simulated: false }));
    render(<PaymentMethodsPage />);
    expect(await screen.findByText(/الدفع الإلكتروني غير مفعّل/)).toBeInTheDocument();
  });

  it("retries after a failed load instead of guessing", async () => {
    const user = userEvent.setup();
    capabilities.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(ok(NONE));
    render(<PaymentMethodsPage />);
    await user.click(await screen.findByRole("button", { name: /إعادة المحاولة/ }));
    expect(await screen.findByText(/بيئة تجريبية/)).toBeInTheDocument();
    expect(capabilities).toHaveBeenCalledTimes(2);
  });
});

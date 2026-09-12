import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it, vi } from "vitest";
import { OtpPage } from "../pages/otp-page";

/*
  Registration answers an address that already has an account exactly as it answers a new
  one, and emails the owner instructions instead of a code. The code screen is where that
  person lands, so it has to tell them what to do if no code arrives — without itself
  saying whether the address had an account, which would hand back what the server withheld.
*/
vi.mock("@/shared/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/auth")>()),
  useAuth: () => ({ setUser: vi.fn() }),
}));

vi.mock("../services/otp.service", () => ({
  verifyOtp: vi.fn(),
  verifyResetOtp: vi.fn(),
  resendOtp: vi.fn(),
}));

/** The approved wording, written out so a reword in the source fails a test. */
const NOTE =
  "إذا كان لهذا البريد حساب لدينا من قبل، فلن يصلك رمز، بل رسالة بما يمكنك فعله: سجّل الدخول، أو أعد تعيين كلمة المرور إن نسيتها.";
const REGISTRATION_SUBTITLE =
  "إذا كان هذا البريد جديداً لدينا فقد أرسلنا إليه رمزاً مكوّناً من 6 أرقام. أدخله هنا لتأكيد حسابك.";
const SENT_FOR_CERTAIN = "أدخل الرمز المكوّن من 6 أرقام الذي أرسلناه إلى بريدك الإلكتروني";

function renderOtp(state: Record<string, unknown>) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/otp", state }]}>
      <Routes>
        <Route path="/otp" element={<OtpPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("arriving from registration", () => {
  const fromRegistration = { email: "sara@manara.com", context: "email-verification", origin: "registration" };

  it("explains what an existing account receives instead, and where to go", () => {
    renderOtp(fromRegistration);

    expect(screen.getByText(NOTE)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "تسجيل الدخول" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "نسيت كلمة المرور؟" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });

  it("does not claim a code was sent", () => {
    renderOtp(fromRegistration);

    expect(screen.getByText(REGISTRATION_SUBTITLE)).toBeInTheDocument();
    expect(screen.queryByText(SENT_FOR_CERTAIN)).not.toBeInTheDocument();
  });
});

describe("arriving from anywhere else", () => {
  it("keeps the ordinary wording and shows no registration note", () => {
    // Sign-in sends an unverified account here; that person knows the account exists.
    renderOtp({ email: "sara@manara.com", context: "email-verification" });

    expect(screen.getByText(SENT_FOR_CERTAIN)).toBeInTheDocument();
    expect(screen.queryByText(NOTE)).not.toBeInTheDocument();
  });
});

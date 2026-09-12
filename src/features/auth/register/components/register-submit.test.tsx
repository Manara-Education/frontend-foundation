import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentTerms } from "@/features/legal/terms/services/terms.service";
import { ApiError } from "@/shared/api";
import { RegisterPage } from "../pages/register-page";
import { registerUser } from "../services/register.service";

/*
  What happens once the form is sent. Registration now answers every accepted request the
  same way, whether or not the address already had an account, so the client must not
  branch on that answer — it always goes on to the code screen, and says it came from here.
*/
vi.mock("@/features/legal/terms/services/terms.service", () => ({
  getCurrentTerms: vi.fn(),
}));

vi.mock("../services/register.service", () => ({
  registerUser: vi.fn(),
}));

const getCurrentTermsMock = vi.mocked(getCurrentTerms);
const registerUserMock = vi.mocked(registerUser);

/** Fifteen characters or more, so the form's own length rule is never what these tests hit. */
const PASSWORD = "amber meadow river 58";

beforeEach(() => {
  getCurrentTermsMock.mockResolvedValue({
    version: "1.0",
    effectiveDate: "2026-09-07",
    effectiveDateLabel: "٧ سبتمبر ٢٠٢٦",
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

/** Stands in for the code screen and shows what it was handed. */
function OtpScreenProbe() {
  const location = useLocation();
  return <pre data-testid="otp-state">{JSON.stringify(location.state)}</pre>;
}

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/otp" element={<OtpScreenProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function fillAndSubmit(container: HTMLElement) {
  await waitFor(() => expect(getCurrentTermsMock).toHaveBeenCalled());
  await userEvent.type(screen.getByPlaceholderText("أدخل اسمك الكامل"), "سارة");
  await userEvent.type(screen.getByPlaceholderText("example@manara.com"), "sara@manara.com");
  // By type rather than placeholder: the password field's placeholder states the length rule,
  // which is not what these tests are about.
  const [password, confirm] = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="password"]'));
  await userEvent.type(password, PASSWORD);
  await userEvent.type(confirm, PASSWORD);
  await userEvent.click(screen.getByRole("checkbox"));
  await userEvent.click(screen.getByRole("button", { name: "إنشاء الحساب" }));
}

describe("after the form is accepted", () => {
  it("goes to the code screen with the address, and says it came from registration", async () => {
    registerUserMock.mockResolvedValue({ message: "accepted" });
    const { container } = renderRegister();

    await fillAndSubmit(container);

    const state = JSON.parse((await screen.findByTestId("otp-state")).textContent ?? "null");
    expect(state).toEqual({
      email: "sara@manara.com",
      context: "email-verification",
      origin: "registration",
    });
  });
});

describe("when the server refuses the form", () => {
  it("shows a field error without the field's name in front of it", async () => {
    registerUserMock.mockRejectedValue(
      new ApiError(400, ["password: Password must be at least 15 characters."]),
    );
    const { container } = renderRegister();

    await fillAndSubmit(container);

    expect(await screen.findByText(/Password must be at least 15 characters\./)).toBeInTheDocument();
    expect(screen.queryByText(/password:/)).not.toBeInTheDocument();
  });

  it.each([
    "Too many requests. Please try again later.",
    "تعذر الإرسال: حاول لاحقاً",
  ])("shows any other message exactly as it came: %s", async (message) => {
    registerUserMock.mockRejectedValue(new ApiError(429, [message]));
    const { container } = renderRegister();

    await fillAndSubmit(container);

    expect(await screen.findByText(message, { exact: false })).toBeInTheDocument();
  });
});

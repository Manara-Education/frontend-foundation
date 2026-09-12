import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentTerms } from "@/features/legal/terms/services/terms.service";
import { ApiError } from "@/shared/api";
import { RegisterPage } from "../pages/register-page";
import { registerUser } from "../services/register.service";

/*
  The client mirrors the server's length rules so a person learns about them while typing, not
  after a round trip. The server stays the authority — the common-password list lives only
  there — so its refusal has to reach the screen as well.
*/
vi.mock("@/features/legal/terms/services/terms.service", () => ({
  getCurrentTerms: vi.fn(),
}));

vi.mock("../services/register.service", () => ({
  registerUser: vi.fn(),
}));

const getCurrentTermsMock = vi.mocked(getCurrentTerms);
const registerUserMock = vi.mocked(registerUser);

const SUBMIT = "إنشاء الحساب";

/** 14 code points, but 16 UTF-16 units: a `.length` check would wrongly let it through. */
const FOURTEEN_CODE_POINTS = "river stone 😀😀";
/** 37 Arabic letters are 74 UTF-8 bytes, two more than bcrypt can use. */
const ARABIC_74_BYTES = "ب".repeat(37);
const ARABIC_PASSPHRASE = "نخيل البحر يغني للقمر كل مساء";

beforeEach(() => {
  getCurrentTermsMock.mockResolvedValue({
    version: "1.0",
    effectiveDate: "2026-09-07",
    effectiveDateLabel: "٧ سبتمبر ٢٠٢٦",
  });
  registerUserMock.mockResolvedValue({ message: "تم" });
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <RegisterPage />
    </MemoryRouter>,
  );
}

/** Password and confirmation, found by type so a change of placeholder copy does not matter. */
function passwordInputs(container: HTMLElement): HTMLInputElement[] {
  return Array.from(container.querySelectorAll<HTMLInputElement>('input[type="password"]'));
}

async function fillForm(container: HTMLElement, password: string) {
  await waitFor(() => expect(getCurrentTermsMock).toHaveBeenCalled());
  await userEvent.type(screen.getByPlaceholderText("أدخل اسمك الكامل"), "سارة");
  await userEvent.type(screen.getByPlaceholderText("example@manara.com"), "sara@manara.com");
  const [pwd, confirm] = passwordInputs(container);
  // fireEvent rather than userEvent.type: the strings carry emoji and 37-letter runs, and what is
  // under test is the rule applied to the value, not keystroke simulation.
  fireEvent.change(pwd, { target: { value: password } });
  fireEvent.change(confirm, { target: { value: password } });
  await userEvent.click(screen.getByRole("checkbox"));
}

describe("registration password rules", () => {
  it("refuses fewer than 15 code points, counting an emoji as one character", async () => {
    const { container } = renderRegister();
    await fillForm(container, FOURTEEN_CODE_POINTS);

    fireEvent.submit(screen.getByRole("button", { name: SUBMIT }).closest("form")!);

    expect(await screen.findByText(/يجب أن تتكون كلمة المرور من 15/)).toBeInTheDocument();
    expect(registerUserMock).not.toHaveBeenCalled();
  });

  it("refuses a password longer than 72 UTF-8 bytes and says why", async () => {
    const { container } = renderRegister();
    await fillForm(container, ARABIC_74_BYTES);

    fireEvent.submit(screen.getByRole("button", { name: SUBMIT }).closest("form")!);

    expect(await screen.findByText(/الحد الأقصى 72 بايت/)).toBeInTheDocument();
    expect(registerUserMock).not.toHaveBeenCalled();
  });

  it("sends an Arabic passphrase with spaces exactly as typed", async () => {
    const { container } = renderRegister();
    await fillForm(container, ARABIC_PASSPHRASE);

    await userEvent.click(screen.getByRole("button", { name: SUBMIT }));

    await waitFor(() =>
      expect(registerUserMock).toHaveBeenCalledWith(
        expect.objectContaining({ password: ARABIC_PASSPHRASE }),
      ),
    );
  });

  it("shows the server's refusal, which is where the common-password check lives", async () => {
    registerUserMock.mockRejectedValue(
      new ApiError(400, ["password: كلمة المرور هذه موجودة في قوائم كلمات المرور الشائعة أو المسرّبة."]),
    );
    const { container } = renderRegister();
    await fillForm(container, "correcthorsebatterystaple");

    await userEvent.click(screen.getByRole("button", { name: SUBMIT }));

    expect(await screen.findByText(/الشائعة أو المسرّبة/)).toBeInTheDocument();
  });
});

describe("the password meter", () => {
  it("measures length rather than rewarding upper case, digits and symbols", async () => {
    const { container } = renderRegister();
    await waitFor(() => expect(getCurrentTermsMock).toHaveBeenCalled());

    fireEvent.change(passwordInputs(container)[0], { target: { value: "Aa1!Aa1!Aa1!" } });

    expect(screen.queryByText(/قوية/)).not.toBeInTheDocument();
    expect(screen.getByText(/12 من 15/)).toBeInTheDocument();
  });

  it("does not call a long lower-case passphrase weak", async () => {
    const { container } = renderRegister();
    await waitFor(() => expect(getCurrentTermsMock).toHaveBeenCalled());

    fireEvent.change(passwordInputs(container)[0], { target: { value: "harbour lights at dusk" } });

    expect(screen.queryByText(/ضعيفة|قصيرة/)).not.toBeInTheDocument();
  });
});

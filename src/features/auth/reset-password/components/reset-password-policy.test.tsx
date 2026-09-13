import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/api";
import type { AuthUser } from "@/shared/auth";
import { ResetPasswordPage } from "../pages/reset-password-page";
import { changePassword, resetPassword } from "../services/reset-password.service";

/*
  One screen serves both the emailed-code reset and the forced change-password flow, so the
  rules are asserted in both. The services are stubbed; the hook and form are real.
*/
const auth = vi.hoisted(() => ({ user: null as AuthUser | null }));

vi.mock("@/shared/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/auth")>()),
  useAuth: () => ({ user: auth.user, refreshUser: vi.fn().mockResolvedValue(null), setUser: vi.fn() }),
}));

vi.mock("../services/reset-password.service", () => ({
  resetPassword: vi.fn(),
  changePassword: vi.fn(),
}));

const resetPasswordMock = vi.mocked(resetPassword);
const changePasswordMock = vi.mocked(changePassword);

const SUBMIT = "حفظ كلمة المرور الجديدة";

/** The approved wording, the same four lines registration shows. */
const LABELS = {
  minimumLength: "15 حرفًا على الأقل",
  hasUppercase: "حرف كبير واحد على الأقل",
  hasNumber: "رقم واحد على الأقل",
  hasSymbol: "رمز خاص واحد على الأقل",
};

const MEETS_ALL_FOUR = "Lanterns drift past the quiet harbour wall every evening, 7!";

afterEach(() => {
  auth.user = null;
  vi.clearAllMocks();
});

function renderReset() {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: "/reset-password", state: { email: "sara@manara.com", code: "123456" } }]}
    >
      <ResetPasswordPage />
    </MemoryRouter>,
  );
}

function passwordInputs(container: HTMLElement): HTMLInputElement[] {
  return Array.from(container.querySelectorAll<HTMLInputElement>('input[type="password"]'));
}

function submitWith(container: HTMLElement, password: string, currentPassword?: string) {
  const inputs = passwordInputs(container);
  // In the forced flow the current password comes first; the new one and its confirmation follow.
  const [newField, confirmField] = currentPassword === undefined ? inputs : inputs.slice(1);
  if (currentPassword !== undefined) fireEvent.change(inputs[0], { target: { value: currentPassword } });
  fireEvent.change(newField, { target: { value: password } });
  fireEvent.change(confirmField, { target: { value: password } });
  fireEvent.submit(screen.getByRole("button", { name: SUBMIT }).closest("form")!);
}

/** Whether the checklist shows a requirement as met — said, for screen readers, beside its tick. */
function isMet(label: string): boolean {
  const line = screen.getByText(label).closest("li");
  if (!line) throw new Error(`no checklist line reads "${label}"`);
  return within(line).queryByText("مستوفى") !== null;
}

describe("the password requirements checklist", () => {
  it("lists the four requirements and nothing about how the password is stored", () => {
    const { container } = renderReset();

    expect(screen.getByText("متطلبات كلمة المرور:")).toBeInTheDocument();
    for (const label of Object.values(LABELS)) expect(screen.getByText(label)).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/بايت|byte|UTF-8|bcrypt/i);
  });

  it("ticks off a requirement once the new password meets it", () => {
    const { container } = renderReset();

    fireEvent.change(passwordInputs(container)[0], { target: { value: "A1" } });

    expect(isMet(LABELS.hasUppercase)).toBe(true);
    expect(isMet(LABELS.hasNumber)).toBe(true);
    expect(isMet(LABELS.minimumLength)).toBe(false);
    expect(isMet(LABELS.hasSymbol)).toBe(false);
  });
});

describe("resetting with an emailed code", () => {
  it.each([
    ["fewer than 15 characters", "River stone 1😀", "يجب أن تتكون كلمة المرور من 15 حرفًا على الأقل."],
    ["no upper-case English letter", "abcdefghijklmno!", "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل."],
    ["no number", "Harbour lights at dusk!", "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل."],
    ["no special symbol", "PASSWORD123456789", "يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل."],
  ])("refuses a password with %s", async (_, password, message) => {
    const { container } = renderReset();

    submitWith(container, password);

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it("refuses a password too long to store, in plain words", async () => {
    const { container } = renderReset();

    submitWith(container, "ب".repeat(35) + "A1!?");

    expect(await screen.findByText("كلمة المرور طويلة جدًا. يرجى اختيار كلمة مرور أقصر.")).toBeInTheDocument();
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it("sends a password that meets all four untouched", async () => {
    resetPasswordMock.mockResolvedValue({ message: "تم" } as never);
    const { container } = renderReset();

    submitWith(container, MEETS_ALL_FOUR);

    await waitFor(() =>
      expect(resetPasswordMock).toHaveBeenCalledWith({
        email: "sara@manara.com",
        code: "123456",
        newPassword: MEETS_ALL_FOUR,
      }),
    );
  });

  it("shows the server's refusal of the new password without the field name", async () => {
    resetPasswordMock.mockRejectedValue(
      new ApiError(400, ["newPassword: كلمة المرور هذه شائعة وسهلة التخمين. يرجى اختيار كلمة مرور أخرى."]),
    );
    const { container } = renderReset();

    submitWith(container, MEETS_ALL_FOUR);

    expect(await screen.findByText("كلمة المرور هذه شائعة وسهلة التخمين. يرجى اختيار كلمة مرور أخرى.")).toBeInTheDocument();
    expect(screen.queryByText(/newPassword:/)).not.toBeInTheDocument();
  });
});

describe("the forced change-password flow", () => {
  it("shows the same checklist and applies the same rules before calling change-password", async () => {
    auth.user = { requiresPasswordReset: true } as AuthUser;
    const { container } = renderReset();

    expect(screen.getByText(LABELS.hasSymbol)).toBeInTheDocument();
    submitWith(container, "PasswordPassword1", "old-short");

    expect(await screen.findByText("يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل.")).toBeInTheDocument();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it("calls change-password with a password that meets all four", async () => {
    auth.user = { requiresPasswordReset: true } as AuthUser;
    changePasswordMock.mockResolvedValue({ message: "تم" } as never);
    const { container } = renderReset();

    submitWith(container, MEETS_ALL_FOUR, "old-short");

    await waitFor(() =>
      expect(changePasswordMock).toHaveBeenCalledWith({ currentPassword: "old-short", newPassword: MEETS_ALL_FOUR }),
    );
  });
});

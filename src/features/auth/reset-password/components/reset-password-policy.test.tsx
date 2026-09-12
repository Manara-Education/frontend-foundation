import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
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
const FOURTEEN_CODE_POINTS = "river stone 😀😀";
const ARABIC_74_BYTES = "ب".repeat(37);
const ASCII_PASSPHRASE_60 = "lanterns drift past the quiet harbour wall every evening now";

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

describe("the password requirements checklist", () => {
  it("states the length rule and no composition rules", () => {
    renderReset();

    expect(screen.getByText(/15 حرفاً على الأقل/)).toBeInTheDocument();
    expect(screen.queryByText(/حرف كبير/)).not.toBeInTheDocument();
    expect(screen.queryByText(/رقم واحد/)).not.toBeInTheDocument();
    expect(screen.queryByText(/رمز خاص/)).not.toBeInTheDocument();
  });
});

describe("resetting with an emailed code", () => {
  it("refuses fewer than 15 code points", async () => {
    const { container } = renderReset();

    submitWith(container, FOURTEEN_CODE_POINTS);

    expect(await screen.findByText(/يجب أن تتكون كلمة المرور من 15/)).toBeInTheDocument();
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it("refuses more than 72 UTF-8 bytes", async () => {
    const { container } = renderReset();

    submitWith(container, ARABIC_74_BYTES);

    expect(await screen.findByText(/الحد الأقصى 72 بايت/)).toBeInTheDocument();
    expect(resetPasswordMock).not.toHaveBeenCalled();
  });

  it("sends a long passphrase with spaces untouched", async () => {
    resetPasswordMock.mockResolvedValue({ message: "تم" } as never);
    const { container } = renderReset();

    submitWith(container, ASCII_PASSPHRASE_60);

    await waitFor(() =>
      expect(resetPasswordMock).toHaveBeenCalledWith({
        email: "sara@manara.com",
        code: "123456",
        newPassword: ASCII_PASSPHRASE_60,
      }),
    );
  });
});

describe("the forced change-password flow", () => {
  it("applies the same length rule before calling change-password", async () => {
    auth.user = { requiresPasswordReset: true } as AuthUser;
    const { container } = renderReset();

    submitWith(container, FOURTEEN_CODE_POINTS, "old-short");

    expect(await screen.findByText(/يجب أن تتكون كلمة المرور من 15/)).toBeInTheDocument();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });
});

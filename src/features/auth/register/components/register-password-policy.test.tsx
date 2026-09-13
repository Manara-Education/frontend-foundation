import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentTerms } from "@/features/legal/terms/services/terms.service";
import { ApiError } from "@/shared/api";
import { RegisterPage } from "../pages/register-page";
import { registerUser } from "../services/register.service";

/*
  The requirements are on the page before anything is sent, tick off while the person types, and
  are checked again on submit. The server stays the authority — it also refuses common passwords,
  which only it can check — so its refusal has to reach the password field as well.
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

/** The approved wording. Written out here so a reword in the source fails a test. */
const LABELS = {
  minimumLength: "15 حرفًا على الأقل",
  hasUppercase: "حرف كبير واحد على الأقل",
  hasNumber: "رقم واحد على الأقل",
  hasSymbol: "رمز خاص واحد على الأقل",
};

const MEETS_ALL_FOUR = "Sunlit harbour lantern 42!";

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
  // fireEvent rather than userEvent.type: what is under test is the rule applied to the value, not
  // keystroke simulation, and some of these strings carry emoji and long Arabic runs.
  fireEvent.change(pwd, { target: { value: password } });
  fireEvent.change(confirm, { target: { value: password } });
  await userEvent.click(screen.getByRole("checkbox"));
}

/** Whether the checklist shows a requirement as met — said, for screen readers, beside its tick. */
function isMet(label: string): boolean {
  const line = screen.getByText(label).closest("li");
  if (!line) throw new Error(`no checklist line reads "${label}"`);
  return within(line).queryByText("مستوفى") !== null;
}

describe("the password requirements on the registration page", () => {
  it("are shown before anything is typed, none of them met", async () => {
    renderRegister();
    await waitFor(() => expect(getCurrentTermsMock).toHaveBeenCalled());

    expect(screen.getByText("متطلبات كلمة المرور:")).toBeInTheDocument();
    for (const label of Object.values(LABELS)) expect(isMet(label)).toBe(false);
  });

  it("tick off one at a time as the password meets them", async () => {
    const { container } = renderRegister();
    await waitFor(() => expect(getCurrentTermsMock).toHaveBeenCalled());
    const [password] = passwordInputs(container);

    fireEvent.change(password, { target: { value: "harbour lights at dusk" } });
    expect(isMet(LABELS.minimumLength)).toBe(true);
    expect(isMet(LABELS.hasUppercase)).toBe(false);

    fireEvent.change(password, { target: { value: "Harbour lights at dusk" } });
    expect(isMet(LABELS.hasUppercase)).toBe(true);
    expect(isMet(LABELS.hasNumber)).toBe(false);

    fireEvent.change(password, { target: { value: "Harbour lights at dusk 7" } });
    expect(isMet(LABELS.hasNumber)).toBe(true);
    expect(isMet(LABELS.hasSymbol)).toBe(false);

    fireEvent.change(password, { target: { value: "Harbour lights at dusk 7!" } });
    expect(Object.values(LABELS).every(isMet)).toBe(true);
  });

  it("describe the password field, so a screen reader reads them with it", async () => {
    const { container } = renderRegister();
    await waitFor(() => expect(getCurrentTermsMock).toHaveBeenCalled());

    const describedBy = passwordInputs(container)[0].getAttribute("aria-describedby");
    expect(document.getElementById(describedBy ?? "")).toHaveTextContent("متطلبات كلمة المرور:");
  });
});

describe("registration password rules", () => {
  it.each([
    ["fewer than 15 characters", "River stone 1😀", "يجب أن تتكون كلمة المرور من 15 حرفًا على الأقل."],
    ["no upper-case English letter", "password123456789", "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل."],
    ["no number", "Harbour lights at dusk!", "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل."],
    ["no special symbol", "PasswordPassword1", "يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل."],
  ])("refuses a password with %s and sends nothing", async (_, password, message) => {
    const { container } = renderRegister();
    await fillForm(container, password);

    fireEvent.submit(screen.getByRole("button", { name: SUBMIT }).closest("form")!);

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(registerUserMock).not.toHaveBeenCalled();
  });

  it("refuses a password too long to store, in plain words", async () => {
    const { container } = renderRegister();
    await fillForm(container, "ب".repeat(35) + "A1!?");

    fireEvent.submit(screen.getByRole("button", { name: SUBMIT }).closest("form")!);

    expect(await screen.findByText("كلمة المرور طويلة جدًا. يرجى اختيار كلمة مرور أقصر.")).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/بايت|byte|UTF-8|bcrypt/i);
    expect(registerUserMock).not.toHaveBeenCalled();
  });

  it("sends a password that meets all four, Arabic letters included, exactly as typed", async () => {
    const password = "نخيل البحر يغني للقمر كل مساء Q7!";
    const { container } = renderRegister();
    await fillForm(container, password);

    await userEvent.click(screen.getByRole("button", { name: SUBMIT }));

    await waitFor(() => expect(registerUserMock).toHaveBeenCalledWith(expect.objectContaining({ password })));
  });

  it("shows the server's refusal, which is where the common-password check lives, without the field name", async () => {
    registerUserMock.mockRejectedValue(
      new ApiError(400, ["password: كلمة المرور هذه شائعة وسهلة التخمين. يرجى اختيار كلمة مرور أخرى."]),
    );
    const { container } = renderRegister();
    await fillForm(container, MEETS_ALL_FOUR);

    await userEvent.click(screen.getByRole("button", { name: SUBMIT }));

    expect(await screen.findByText("كلمة المرور هذه شائعة وسهلة التخمين. يرجى اختيار كلمة مرور أخرى.")).toBeInTheDocument();
    expect(screen.queryByText(/password:/)).not.toBeInTheDocument();
  });
});

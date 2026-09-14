import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider, useLocation } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentTerms } from "@/features/legal/terms/services/terms.service";
import { LoginPage } from "@/features/auth/login/pages/login-page";
import { RegisterPage } from "../pages/register-page";
import { registerUser } from "../services/register.service";

/*
  A visitor who meets a sign-in step on the way to something — a public course's "buy" button,
  say — has a destination remembered in history state. It has to survive choosing to create an
  account instead of signing in, switching back, and the code screen that finishes
  registration, which is where the account is signed in and the destination resumed.
*/
vi.mock("@/features/legal/terms/services/terms.service", () => ({
  getCurrentTerms: vi.fn(),
}));

vi.mock("../services/register.service", () => ({
  registerUser: vi.fn(),
}));

vi.mock("@/shared/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/auth")>();
  return { ...actual, useAuth: () => ({ status: "anonymous", user: null, setUser: vi.fn() }) };
});

const getCurrentTermsMock = vi.mocked(getCurrentTerms);
const registerUserMock = vi.mocked(registerUser);

const DESTINATION = "/student/explore/42";
const PASSWORD = "Amber meadow river 58!";

function Probe({ name }: { name: string }) {
  const location = useLocation();
  return <pre data-testid={name}>{JSON.stringify(location.state)}</pre>;
}

function renderAt(path: "/login" | "/register") {
  const router = createMemoryRouter(
    [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/otp", element: <Probe name="otp" /> },
    ],
    { initialEntries: [{ pathname: path, state: { from: DESTINATION } }] },
  );
  const view = render(<RouterProvider router={router} />);
  return { router, ...view };
}

beforeEach(() => {
  getCurrentTermsMock.mockResolvedValue({ version: "1.0", effectiveDate: "2026-09-07", effectiveDateLabel: "٧ سبتمبر ٢٠٢٦" });
  registerUserMock.mockResolvedValue(undefined as never);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("the remembered destination", () => {
  it("rides from registration into the code screen, which resumes it once signed in", async () => {
    const { container } = renderAt("/register");
    await waitFor(() => expect(getCurrentTermsMock).toHaveBeenCalled());

    await userEvent.type(screen.getByPlaceholderText("أدخل اسمك الكامل"), "سارة");
    // By type, not placeholder: the placeholder is copy and is not what this test is about.
    await userEvent.type(container.querySelector<HTMLInputElement>('input[type="email"]')!, "sara@example.com");
    const [password, confirm] = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="password"]'));
    await userEvent.type(password, PASSWORD);
    await userEvent.type(confirm, PASSWORD);
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "إنشاء الحساب" }));

    const state = JSON.parse((await screen.findByTestId("otp")).textContent ?? "null");
    expect(state).toMatchObject({ email: "sara@example.com", origin: "registration", from: DESTINATION });
  });

  it("survives switching from sign-in to registration", async () => {
    const { router } = renderAt("/login");

    await userEvent.click(await screen.findByRole("button", { name: "إنشاء حساب جديد" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/register"));
    expect(router.state.location.state).toEqual({ from: DESTINATION });
  });

  it("survives switching from registration back to sign-in", async () => {
    const { router } = renderAt("/register");

    await userEvent.click(await screen.findByRole("button", { name: "تسجيل الدخول" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/login"));
    expect(router.state.location.state).toEqual({ from: DESTINATION });
  });

  it("is not invented when there was none", async () => {
    const router = createMemoryRouter(
      [
        { path: "/login", element: <LoginPage /> },
        { path: "/register", element: <RegisterPage /> },
      ],
      { initialEntries: ["/login"] },
    );
    render(<RouterProvider router={router} />);

    await userEvent.click(await screen.findByRole("button", { name: "إنشاء حساب جديد" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/register"));
    expect(router.state.location.state).toBeNull();
  });
});

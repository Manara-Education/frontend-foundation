import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, Outlet, RouterProvider, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/api";
import type { AuthUser } from "@/shared/auth";
import { getProfile, updateProfile } from "@/features/profile/services/profile.service";
import { changePasswordRequest } from "./account/api/account.api";
import { accountRoutes } from "./settings.routes";

/*
  Settings driven through its real route table: an address, a signed-in role, and the profile and
  password endpoints stubbed at the service/API boundary. Every account here is synthetic.
*/
vi.mock("@/features/profile/services/profile.service", () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}));
vi.mock("./account/api/account.api", () => ({ changePasswordRequest: vi.fn() }));
vi.mock("@/features/profile/pages/profile-view", () => ({
  ProfileView: () => <p>instructor profile screen</p>,
}));

const session = vi.hoisted(() => ({
  user: null as AuthUser | null,
  refreshUser: vi.fn(async () => null),
}));

vi.mock("@/shared/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/auth")>();
  return {
    ...actual,
    useAuth: () => ({ status: "authenticated", user: session.user, refreshUser: session.refreshUser }),
  };
});

const profile = vi.mocked(getProfile);
const rename = vi.mocked(updateProfile);
const changePassword = vi.mocked(changePasswordRequest);

function signIn(role: string) {
  session.user = { fullName: "سارة أحمد", email: "sara@example.com", role, requiresPasswordReset: false };
}

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>;
}

function openAt(path: string) {
  const router = createMemoryRouter(
    [
      {
        element: (
          <>
            <Outlet />
            <Where />
          </>
        ),
        children: [...accountRoutes, { path: "student/courses", element: <p>my courses</p> }],
      },
    ],
    { initialEntries: [path] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

const where = () => screen.getByTestId("where").textContent;

beforeEach(() => {
  vi.clearAllMocks();
  signIn("STUDENT");
  profile.mockResolvedValue({
    fullName: "سارة أحمد",
    email: "sara@example.com",
    roleLabel: "طالب نشط",
    memberSince: "سبتمبر 2026",
  });
});

describe("addresses", () => {
  it.each([
    ["/settings", "/settings/account"],
    ["/settings/billing", "/settings/billing/subscriptions"],
    ["/settings/overview", "/settings/account"],
    ["/profile", "/settings/account"],
  ])("a student opening %s lands on %s", async (from, to) => {
    openAt(from);
    await waitFor(() => expect(where()).toBe(to));
  });

  it("keeps the instructor's profile, and sends an instructor away from Settings", async () => {
    signIn("INSTRUCTOR");
    openAt("/profile");
    expect(await screen.findByText("instructor profile screen")).toBeInTheDocument();

    openAt("/settings/billing/invoices");
    await waitFor(() => expect(screen.getAllByTestId("where").slice(-1)[0]?.textContent).toBe("/profile"));
  });

  it("marks the open section from the URL, and has no billing overview", async () => {
    openAt("/settings/billing/payment-methods");
    const current = await screen.findAllByRole("link", { current: "page" });
    expect(current.map((link) => link.textContent)).toEqual(
      expect.arrayContaining(["طرق الدفع"]),
    );
    expect(screen.queryByText("نظرة عامة")).not.toBeInTheDocument();
    // An unavailable section says so and offers nothing to act on.
    expect(screen.getAllByText("قريبًا").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /إضافة/ })).not.toBeInTheDocument();
  });
});

describe("account overview", () => {
  it("shows the real identity and two-letter initials, and no badge it cannot back", async () => {
    openAt("/settings/account");
    const card = await screen.findByRole("region", { name: "بطاقة الحساب" });
    expect(within(card).getByText("سارة أحمد")).toBeInTheDocument();
    expect(within(card).getByText("سأ")).toBeInTheDocument();
    expect(screen.queryByText("موثّق")).not.toBeInTheDocument();
    expect(screen.queryByText(/آخر تحديث/)).not.toBeInTheDocument();
  });

  it("offers a retry when the profile cannot be loaded", async () => {
    profile.mockRejectedValueOnce(new Error("offline"));
    openAt("/settings/account");
    await userEvent.click(await screen.findByRole("button", { name: "إعادة المحاولة" }));
    expect(await screen.findByRole("region", { name: "بطاقة الحساب" })).toBeInTheDocument();
  });
});

describe("name editor", () => {
  it("cannot save an unchanged, blank or over-long name, and saves a trimmed one", async () => {
    const user = userEvent.setup();
    rename.mockResolvedValue("ok");
    openAt("/settings/account/name");

    const field = await screen.findByLabelText("الاسم الكامل");
    const save = screen.getByRole("button", { name: "حفظ" });
    expect(save).toBeDisabled();

    await user.clear(field);
    expect(save).toBeDisabled();
    expect(screen.getByText("الاسم الكامل مطلوب.")).toBeInTheDocument();

    await user.type(field, "ا".repeat(71));
    expect(save).toBeDisabled();
    expect(screen.getByText(/لا يزيد الاسم الكامل على 70/)).toBeInTheDocument();

    await user.clear(field);
    await user.type(field, "  سارة محمود  ");
    await user.click(save);

    await waitFor(() => expect(where()).toBe("/settings/account"));
    expect(rename).toHaveBeenCalledWith({ fullName: "سارة محمود" });
    expect(session.refreshUser).toHaveBeenCalled();
    expect(await screen.findByText("تم حفظ الاسم بنجاح.")).toBeInTheDocument();
  });

  it("keeps the typed name after a failed save, and lets the person retry", async () => {
    const user = userEvent.setup();
    rename.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce("ok");
    openAt("/settings/account/name");

    const field = await screen.findByLabelText("الاسم الكامل");
    await user.clear(field);
    await user.type(field, "سارة محمود");
    await user.click(screen.getByRole("button", { name: "حفظ" }));

    expect(await screen.findByText(/تعذّر حفظ الاسم/)).toBeInTheDocument();
    expect(field).toHaveValue("سارة محمود");
    expect(where()).toBe("/settings/account/name");

    await user.click(screen.getByRole("button", { name: "حفظ" }));
    await waitFor(() => expect(where()).toBe("/settings/account"));
  });

  it("asks before leaving with unsaved changes, and stays when asked to", async () => {
    const user = userEvent.setup();
    const router = openAt("/settings/account/name");

    const field = await screen.findByLabelText("الاسم الكامل");
    await user.type(field, " جديد");
    await router.navigate("/settings/billing/invoices");

    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "متابعة التعديل" }));
    expect(where()).toBe("/settings/account/name");
    expect(field).toHaveValue("سارة أحمد جديد");

    await router.navigate("/settings/billing/invoices");
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "تجاهل التغييرات" }));
    await waitFor(() => expect(where()).toBe("/settings/billing/invoices"));
  });
});

describe("password editor", () => {
  async function fill(current: string, next: string, confirm: string) {
    const user = userEvent.setup();
    openAt("/settings/account/password");
    await user.type(await screen.findByLabelText("كلمة المرور الحالية"), current);
    await user.type(screen.getByLabelText("كلمة المرور الجديدة"), next);
    await user.type(screen.getByLabelText("تأكيد كلمة المرور الجديدة"), confirm);
    await user.click(screen.getByRole("button", { name: "تغيير كلمة المرور" }));
    return user;
  }

  const STRONG = "Quiet orchard kettle 97!";

  it("applies the shared policy and the confirmation before calling the server", async () => {
    await fill("old password", "short", "other");
    expect(screen.getByText(/15 حرفًا على الأقل\./)).toBeInTheDocument();
    expect(screen.getByText("كلمتا المرور غير متطابقتين.")).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it("shows the server's refusal of the current password without leaving the screen", async () => {
    changePassword.mockRejectedValueOnce(new ApiError(400, ["كلمة المرور الحالية غير صحيحة"]));
    await fill("wrong", STRONG, STRONG);
    expect(await screen.findByText("كلمة المرور الحالية غير صحيحة")).toBeInTheDocument();
    expect(where()).toBe("/settings/account/password");
  });

  it("puts a policy refusal from the server on the new-password field", async () => {
    changePassword.mockRejectedValueOnce(new ApiError(400, ["newPassword: لا تستخدم اسمك في كلمة المرور."]));
    await fill("current", STRONG, STRONG);
    const field = screen.getByLabelText("كلمة المرور الجديدة");
    await waitFor(() => expect(field).toHaveAccessibleDescription(/لا تستخدم اسمك/));
  });

  it("changes the password in place and returns to the account with a notice", async () => {
    changePassword.mockResolvedValueOnce({} as Awaited<ReturnType<typeof changePasswordRequest>>);
    await fill("current password", STRONG, STRONG);
    await waitFor(() => expect(where()).toBe("/settings/account"));
    expect(changePassword).toHaveBeenCalledWith({ currentPassword: "current password", newPassword: STRONG });
    expect(await screen.findByText(/تم تغيير كلمة المرور/)).toBeInTheDocument();
  });
});

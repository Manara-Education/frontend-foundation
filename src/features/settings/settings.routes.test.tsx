import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, Outlet, RouterProvider, useLocation } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/api";
import type { AuthUser } from "@/shared/auth";
import { getProfile, removeAvatar, updateProfile, uploadAvatar } from "@/features/profile/services/profile.service";
import type { Profile } from "@/features/profile/types/profile.types";
import { loadPhoto, renderCrop } from "./account/services/photo.service";
import { changePasswordRequest } from "./account/api/account.api";
import {
  resendEmailChangeRequest,
  startEmailChangeRequest,
  verifyEmailChangeRequest,
} from "./account/api/email-change.api";
import { accountRoutes } from "./settings.routes";

/*
  Settings driven through its real route table: an address, a signed-in role, and the profile and
  password endpoints stubbed at the service/API boundary. Every account here is synthetic.
*/
vi.mock("@/features/profile/services/profile.service", () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  uploadAvatar: vi.fn(),
  removeAvatar: vi.fn(),
}));
// jsdom decodes no images, so the file checks and the canvas render are stubbed at their seam.
vi.mock("./account/services/photo.service", () => ({ loadPhoto: vi.fn(), renderCrop: vi.fn() }));
vi.mock("./billing/api/billing.api", () => ({
  getBillingCapabilitiesRequest: vi.fn().mockResolvedValue({ data: { status: "success", data: {
    commerceMode: "FREE_ONLY", provider: null, oneTimeCheckout: false, simulated: false, methodTypes: [],
    savedMethods: false, recurringCharges: false, statusRefresh: false, refunds: false,
  } } }),
}));
vi.mock("./account/api/account.api", () => ({ changePasswordRequest: vi.fn() }));
vi.mock("./account/api/email-change.api", () => ({
  startEmailChangeRequest: vi.fn(),
  resendEmailChangeRequest: vi.fn(),
  verifyEmailChangeRequest: vi.fn(),
}));
vi.mock("@/features/profile/pages/profile-view", () => ({
  ProfileView: () => <p>instructor profile screen</p>,
}));

const session = vi.hoisted(() => ({
  user: null as AuthUser | null,
  refreshUser: vi.fn(async () => null),
  setUser: vi.fn(),
}));

vi.mock("@/shared/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/auth")>();
  return {
    ...actual,
    useAuth: () => ({
      status: "authenticated",
      user: session.user,
      refreshUser: session.refreshUser,
      setUser: session.setUser,
    }),
  };
});

const profile = vi.mocked(getProfile);
const rename = vi.mocked(updateProfile);
const changePassword = vi.mocked(changePasswordRequest);
const upload = vi.mocked(uploadAvatar);
const removePhoto = vi.mocked(removeAvatar);

const SARA: Profile = {
  fullName: "سارة أحمد",
  email: "sara@example.com",
  roleLabel: "طالب نشط",
  memberSince: "سبتمبر 2026",
  avatarUrl: null,
  emailVerified: false,
  passwordChangedOn: null,
};

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
  profile.mockResolvedValue(SARA);
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
    // An unavailable section says why, in the server's terms, and offers nothing to act on.
    expect(await screen.findByText(/الدفع الإلكتروني غير مفعّل/)).toBeInTheDocument();
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

  it("shows the verified badge and password date only when the server reports them", async () => {
    profile.mockResolvedValue({ ...SARA, emailVerified: true, passwordChangedOn: "١ سبتمبر ٢٠٢٦" });
    openAt("/settings/account");
    expect(await screen.findByText("موثّق")).toBeInTheDocument();
    expect(screen.getByText("آخر تحديث: ١ سبتمبر ٢٠٢٦")).toBeInTheDocument();
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
    rename.mockResolvedValue({ ...SARA, fullName: "سارة محمود" });
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
    expect(session.setUser).toHaveBeenCalledWith(expect.objectContaining({ fullName: "سارة محمود" }));
    expect(await screen.findByText("تم حفظ الاسم بنجاح.")).toBeInTheDocument();
  });

  it("keeps the typed name after a failed save, and lets the person retry", async () => {
    const user = userEvent.setup();
    rename.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce({ ...SARA, fullName: "سارة محمود" });
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

describe("profile photo", () => {
  const PHOTO = { url: "blob:photo", width: 800, height: 600 };

  it("refuses an unsupported file with the reason, and uploads nothing", async () => {
    const user = userEvent.setup({ applyAccept: false });
    vi.mocked(loadPhoto).mockResolvedValue({ error: "صيغة الملف غير مدعومة. استخدم صورة JPG أو PNG أو WebP." });
    openAt("/settings/account");
    await user.click(await screen.findByRole("button", { name: "إضافة صورة" }));
    await user.upload(screen.getByLabelText("اختيار صورة"), new File(["x"], "a.gif", { type: "image/gif" }));
    expect(await screen.findByText(/صيغة الملف غير مدعومة/)).toBeInTheDocument();
    expect(upload).not.toHaveBeenCalled();
  });

  it("uploads the cropped photo and shows it everywhere without a reload", async () => {
    const user = userEvent.setup();
    vi.mocked(loadPhoto).mockResolvedValue(PHOTO);
    vi.mocked(renderCrop).mockResolvedValue(new Blob(["jpeg"], { type: "image/jpeg" }));
    upload.mockResolvedValue({ ...SARA, avatarUrl: "/uploads/new.jpg" });
    openAt("/settings/account");

    await user.click(await screen.findByRole("button", { name: "إضافة صورة" }));
    await user.upload(screen.getByLabelText("اختيار صورة"), new File(["x"], "me.png", { type: "image/png" }));
    await user.click(await screen.findByRole("button", { name: "تكبير" }));
    await user.click(screen.getByRole("button", { name: "حفظ الصورة" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    const [, crop] = vi.mocked(renderCrop).mock.calls[0];
    expect(crop.zoom).toBeGreaterThan(1);
    expect(session.setUser).toHaveBeenCalledWith(expect.objectContaining({ avatarUrl: "/uploads/new.jpg" }));
    expect(screen.getByRole("button", { name: "تغيير الصورة" })).toBeInTheDocument();
  });

  it("keeps the dialog and the chosen photo when the server refuses it", async () => {
    const user = userEvent.setup();
    vi.mocked(loadPhoto).mockResolvedValue(PHOTO);
    vi.mocked(renderCrop).mockResolvedValue(new Blob(["jpeg"], { type: "image/jpeg" }));
    upload.mockRejectedValueOnce(new ApiError(400, ["الصورة صغيرة جدًا"]));
    openAt("/settings/account");

    await user.click(await screen.findByRole("button", { name: "إضافة صورة" }));
    await user.upload(screen.getByLabelText("اختيار صورة"), new File(["x"], "me.png", { type: "image/png" }));
    await user.click(await screen.findByRole("button", { name: "حفظ الصورة" }));

    expect(await screen.findByText("الصورة صغيرة جدًا")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "حفظ الصورة" })).toBeEnabled();
    expect(session.setUser).not.toHaveBeenCalled();
  });

  it("removes the photo only after confirmation", async () => {
    const user = userEvent.setup();
    profile.mockResolvedValue({ ...SARA, avatarUrl: "/uploads/old.jpg" });
    removePhoto.mockResolvedValue(SARA);
    openAt("/settings/account");

    await user.click(await screen.findByRole("button", { name: "تغيير الصورة" }));
    await user.click(screen.getByRole("button", { name: "حذف الصورة" }));
    expect(removePhoto).not.toHaveBeenCalled();
    await user.click(within(screen.getByRole("alertdialog", { name: "تأكيد حذف الصورة" })).getByRole("button", { name: "حذف" }));

    await waitFor(() => expect(removePhoto).toHaveBeenCalledTimes(1));
    expect(session.setUser).toHaveBeenCalledWith(expect.objectContaining({ avatarUrl: null }));
    expect(await screen.findByRole("button", { name: "إضافة صورة" })).toBeInTheDocument();
  });
});

describe("email change", () => {
  const start = vi.mocked(startEmailChangeRequest);
  const resendCode = vi.mocked(resendEmailChangeRequest);
  const verifyCode = vi.mocked(verifyEmailChangeRequest);
  type Answer = Awaited<ReturnType<typeof startEmailChangeRequest>>;

  const CHALLENGE = {
    requestId: "8d0f1c1e-6a0b-4a9f-9a53-0e8f0c3b2a11",
    maskedEmail: "ne***@example.com",
    codeLength: 6,
    expiresAt: "2026-09-26T22:10:00",
    resendAvailableAt: "2026-09-26T22:01:00",
    expiresInSeconds: 600,
    resendAvailableInSeconds: 60,
  };
  const answer = (data: unknown) => ({ status: 200, data: { status: "success", data } }) as Answer;

  async function reachCodeStep(user: ReturnType<typeof userEvent.setup>) {
    openAt("/settings/account/email");
    await user.type(await screen.findByLabelText("كلمة المرور الحالية"), "Current password 1!");
    await user.click(screen.getByRole("button", { name: "متابعة" }));
    await user.type(screen.getByLabelText("البريد الإلكتروني الجديد"), "new@example.com");
    await user.click(screen.getByRole("button", { name: /إرسال رمز التحقق/ }));
  }

  it("sends the password with the new address once, then forgets it", async () => {
    const user = userEvent.setup();
    start.mockResolvedValue(answer(CHALLENGE));
    await reachCodeStep(user);

    expect(await screen.findByText("ne***@example.com")).toBeInTheDocument();
    expect(start).toHaveBeenCalledWith({ currentPassword: "Current password 1!", newEmail: "new@example.com" });
    expect(screen.getByText(/ينتهي الرمز خلال 10:00|ينتهي الرمز خلال 9:5\d/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /إعادة الإرسال بعد/ })).toBeDisabled();
  });

  it("returns to the password step, cleared, when the server rejects the password", async () => {
    const user = userEvent.setup();
    start.mockRejectedValue(new ApiError(400, ["كلمة المرور الحالية غير صحيحة"], "EMAIL_CHANGE_PASSWORD_INVALID"));
    await reachCodeStep(user);

    const field = await screen.findByLabelText("كلمة المرور الحالية");
    expect(field).toHaveValue("");
    expect(screen.getByText("كلمة المرور الحالية غير صحيحة")).toBeInTheDocument();
  });

  it("accepts a pasted code, and clears the boxes after a wrong one", async () => {
    const user = userEvent.setup();
    start.mockResolvedValue(answer(CHALLENGE));
    verifyCode.mockRejectedValueOnce(new ApiError(400, ["الرمز غير صحيح"], "EMAIL_CHANGE_CODE_INVALID"));
    await reachCodeStep(user);

    await user.click(await screen.findByLabelText("الرقم 1"));
    await user.paste("12 34-56");
    const boxes = screen.getAllByLabelText(/^الرقم \d$/);
    expect(boxes.map((box) => (box as HTMLInputElement).value).join("")).toBe("123456");

    await user.click(screen.getByRole("button", { name: "تأكيد" }));
    expect(await screen.findByText("الرمز غير صحيح")).toBeInTheDocument();
    expect(verifyCode).toHaveBeenCalledWith(CHALLENGE.requestId, "123456");
    expect(boxes.map((box) => (box as HTMLInputElement).value).join("")).toBe("");
  });

  it("stops accepting codes once the request is locked", async () => {
    const user = userEvent.setup();
    start.mockResolvedValue(answer(CHALLENGE));
    verifyCode.mockRejectedValueOnce(new ApiError(429, ["أدخلت رموزًا غير صحيحة مرات كثيرة"], "EMAIL_CHANGE_LOCKED"));
    await reachCodeStep(user);

    await user.click(await screen.findByLabelText("الرقم 1"));
    await user.paste("654321");
    await user.click(screen.getByRole("button", { name: "تأكيد" }));

    expect(await screen.findByRole("button", { name: "البدء من جديد" })).toBeInTheDocument();
    expect(screen.getByLabelText("الرقم 1")).toBeDisabled();
    expect(resendCode).not.toHaveBeenCalled();
  });

  it("updates the signed-in identity only after the server confirms the change", async () => {
    const user = userEvent.setup();
    start.mockResolvedValue(answer(CHALLENGE));
    verifyCode.mockResolvedValue(answer({
      fullName: "سارة أحمد", email: "new@example.com", role: "STUDENT", createdAt: "2026-09-01T10:00:00",
      avatarUrl: null, emailVerified: true, passwordChangedAt: null,
    }) as unknown as Awaited<ReturnType<typeof verifyEmailChangeRequest>>);
    await reachCodeStep(user);
    expect(session.setUser).not.toHaveBeenCalled();

    await user.click(await screen.findByLabelText("الرقم 1"));
    await user.paste("123456");
    await user.click(screen.getByRole("button", { name: "تأكيد" }));

    expect(await screen.findByText("تم تغيير بريدك الإلكتروني")).toBeInTheDocument();
    expect(session.setUser).toHaveBeenCalledWith(expect.objectContaining({ email: "new@example.com" }));
    await user.click(screen.getByRole("button", { name: "العودة إلى الحساب" }));
    await waitFor(() => expect(where()).toBe("/settings/account"));
  });
});

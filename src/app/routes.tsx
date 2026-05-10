import { createBrowserRouter, useMatches, Outlet } from "react-router";
import { useEffect } from "react";
import { LoginPage } from "../features/auth/login/pages/login-page";
import { RegisterPage } from "../features/auth/register/pages/register-page";
import { ForgotPasswordPage } from "../features/auth/forgot-password/pages/forgot-password-page";
import { OtpPage } from "../features/auth/otp/pages/otp-page";
import { ResetPasswordPage } from "../features/auth/reset-password/pages/reset-password-page";
import { MainPage } from "@/features/main/pages/main-page";
import { AccessDeniedPage } from "@/features/session/access-denied/pages/access-denied-page";
import { ProtectedRoute, PublicOnlyRoute } from "@/shared/auth";

function TitleUpdater() {
  const matches = useMatches();
  const leaf = matches[matches.length - 1];
  const title = (leaf?.handle as { title?: string })?.title;

  useEffect(() => {
    document.title = title ? `${title} | منارة` : "منارة";
  }, [title]);

  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    Component: TitleUpdater,
    children: [
      {
        Component: PublicOnlyRoute,
        children: [
          {
            path: "/",
            Component: LoginPage,
            handle: { title: "تسجيل الدخول" },
          },
          {
            path: "/register",
            Component: RegisterPage,
            handle: { title: "إنشاء حساب" },
          },
          {
            path: "/forgot-password",
            Component: ForgotPasswordPage,
            handle: { title: "نسيت كلمة المرور" },
          },
          {
            path: "/reset-password",
            Component: ResetPasswordPage,
            handle: { title: "إعادة تعيين كلمة المرور" },
          },
        ],
      },
      {
        path: "/otp",
        Component: OtpPage,
        handle: { title: "التحقق من الرمز" },
      },
      {
        Component: ProtectedRoute,
        children: [
          {
            path: "/main",
            Component: MainPage,
            handle: { title: "الرئيسية" },
          },
          {
            path: "/access-denied",
            Component: AccessDeniedPage,
            handle: { title: "وصول مرفوض" },
          },
        ],
      },
    ],
  },
]);

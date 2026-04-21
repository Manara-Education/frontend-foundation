import { createBrowserRouter, useMatches, Outlet } from "react-router";
import { useEffect } from "react";
import { LoginPage } from "../features/auth/login/pages/login-page";
import { RegisterPage } from "./components/auth/RegisterPage";
import { ForgotPasswordPage } from "./components/auth/ForgotPasswordPage";
import { OTPPage } from "./components/auth/OTPPage";
import { ResetPasswordPage } from "./components/auth/ResetPasswordPage";

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
        path: "/otp",
        Component: OTPPage,
        handle: { title: "التحقق من الرمز" },
      },
      {
        path: "/reset-password",
        Component: ResetPasswordPage,
        handle: { title: "إعادة تعيين كلمة المرور" },
      },
    ],
  },
]);

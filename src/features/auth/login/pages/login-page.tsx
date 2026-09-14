import { useLocation, useNavigate } from "react-router";
import type { FromLocationState } from "@/shared/auth";
import { paths } from "@/shared/navigation";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { LoginForm } from "../components/login-form";
import { useLogin } from "../hooks/use-login";

export function LoginPage() {
  const navigate = useNavigate();
  // A remembered destination survives switching to the sign-up form.
  const from = (useLocation().state as FromLocationState | null)?.from;
  const {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    loading,
    errors,
    handleSubmit,
  } = useLogin();

  return (
    <AuthLayout>
      <LoginForm
        email={email}
        password={password}
        rememberMe={rememberMe}
        loading={loading}
        errors={errors}
        onEmailChange={(e) => setEmail(e.target.value)}
        onPasswordChange={(e) => setPassword(e.target.value)}
        onRememberMeToggle={() => setRememberMe(!rememberMe)}
        onSubmit={handleSubmit}
        onForgotPassword={() => navigate(paths.forgotPassword)}
        onRegister={() => navigate(paths.register, { state: from ? { from } : undefined })}
      />
    </AuthLayout>
  );
}

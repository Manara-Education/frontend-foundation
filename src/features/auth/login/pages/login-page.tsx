import { useNavigate } from "react-router";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { LoginForm } from "../components/login-form";
import { useLogin } from "../hooks/use-login";

export function LoginPage() {
  const navigate = useNavigate();
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
        onForgotPassword={() => navigate("/forgot-password")}
        onRegister={() => navigate("/register")}
      />
    </AuthLayout>
  );
}

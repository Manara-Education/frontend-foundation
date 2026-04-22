import { useNavigate } from "react-router";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { RegisterForm } from "../components/register-form";
import { useRegister } from "../hooks/use-register";

export function RegisterPage() {
  const navigate = useNavigate();
  const {
    form,
    strength,
    agreed,
    setAgreed,
    loading,
    errors,
    setField,
    handleSubmit,
  } = useRegister();

  return (
    <AuthLayout>
      <RegisterForm
        form={form}
        strength={strength}
        agreed={agreed}
        loading={loading}
        errors={errors}
        onChange={setField}
        onAgreedToggle={() => setAgreed(!agreed)}
        onSubmit={handleSubmit}
        onLoginClick={() => navigate("/")}
      />
    </AuthLayout>
  );
}

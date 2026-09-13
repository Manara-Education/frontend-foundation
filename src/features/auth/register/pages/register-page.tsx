import { useNavigate } from "react-router";
import { paths } from "@/shared/navigation";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { RegisterForm } from "../components/register-form";
import { useRegister } from "../hooks/use-register";

export function RegisterPage() {
  const navigate = useNavigate();
  const {
    form,
    loading,
    errors,
    setField,
    setTermsAccepted,
    handleSubmit,
    termsOutdated,
    termsLoadFailed,
    retryTerms,
    canSubmit,
  } = useRegister();

  return (
    <AuthLayout>
      <RegisterForm
        form={form}
        loading={loading}
        errors={errors}
        onChange={setField}
        onTermsAcceptedChange={setTermsAccepted}
        onSubmit={handleSubmit}
        onLoginClick={() => navigate(paths.login)}
        termsOutdated={termsOutdated}
        termsLoadFailed={termsLoadFailed}
        onRetryTerms={retryTerms}
        canSubmit={canSubmit}
      />
    </AuthLayout>
  );
}

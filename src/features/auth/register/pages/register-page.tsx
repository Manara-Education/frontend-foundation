import { useLocation, useNavigate } from "react-router";
import type { FromLocationState } from "@/shared/auth";
import { paths } from "@/shared/navigation";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { RegisterForm } from "../components/register-form";
import { useRegister } from "../hooks/use-register";

export function RegisterPage() {
  const navigate = useNavigate();
  // A remembered destination survives switching back to the sign-in form.
  const from = (useLocation().state as FromLocationState | null)?.from;
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
        onLoginClick={() => navigate(paths.login, { state: from ? { from } : undefined })}
        termsOutdated={termsOutdated}
        termsLoadFailed={termsLoadFailed}
        onRetryTerms={retryTerms}
        canSubmit={canSubmit}
      />
    </AuthLayout>
  );
}

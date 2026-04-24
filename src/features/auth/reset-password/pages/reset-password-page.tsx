import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { ResetPasswordForm } from "../components/reset-password-form";
import { useResetPassword } from "../hooks/use-reset-password";

export function ResetPasswordPage() {
  const { form, errors, loading, done, setField, handleSubmit, evaluatedRules } = useResetPassword();

  return (
    <AuthLayout>
      <ResetPasswordForm
        form={form}
        errors={errors}
        loading={loading}
        done={done}
        evaluatedRules={evaluatedRules}
        onChange={setField}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}

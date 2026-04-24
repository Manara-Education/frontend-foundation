import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { ForgotPasswordForm } from "../components/forgot-password-form";
import { useForgotPassword } from "../hooks/use-forgot-password";

export function ForgotPasswordPage() {
  const { form, loading, errors, setField, handleSubmit } = useForgotPassword();

  return (
    <AuthLayout>
      <ForgotPasswordForm
        form={form}
        loading={loading}
        errors={errors}
        onChange={setField}
        onSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}

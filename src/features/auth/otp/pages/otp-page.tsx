import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { OtpForm } from "../components/otp-form";
import { useOtp } from "../hooks/use-otp";

export function OtpPage() {
  const otpState = useOtp();

  return (
    <AuthLayout>
      <OtpForm
        otp={otpState.otp}
        error={otpState.error}
        success={otpState.success}
        loading={otpState.loading}
        countdown={otpState.countdown}
        canResend={otpState.canResend}
        inputsRef={otpState.inputsRef}
        context={otpState.context}
        onChange={otpState.handleChange}
        onKeyDown={otpState.handleKeyDown}
        onPaste={otpState.handlePaste}
        onVerify={otpState.handleVerify}
        onResend={otpState.handleResend}
        formatCountdown={otpState.formatCountdown}
      />
    </AuthLayout>
  );
}

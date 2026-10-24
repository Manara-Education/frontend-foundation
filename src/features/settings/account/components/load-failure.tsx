import { ActionButton } from "../../components/action-button";
import { FONT, MUTED, cardStyle } from "../../components/settings-tokens";

export function LoadFailure({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-10 text-center" style={{ ...cardStyle, fontFamily: FONT }}>
      <p style={{ fontSize: 14, color: MUTED }}>تعذّر تحميل بيانات حسابك.</p>
      <ActionButton onClick={onRetry}>إعادة المحاولة</ActionButton>
    </div>
  );
}

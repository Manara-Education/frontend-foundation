import { KeyRound, ShieldAlert } from "lucide-react";
import { FAINT, FONT, INK, PRIMARY } from "../../components/settings-tokens";

/** The password entry and the anti-phishing reminder. No "last changed" date is shown unless known. */
export function SecurityCard({
  onChangePassword,
  passwordChangedOn,
}: {
  onChangePassword: () => void;
  passwordChangedOn: string | null;
}) {
  return (
    <section
      aria-labelledby="security-title"
      className="flex flex-col gap-3 rounded-[20px] p-5"
      style={{ background: "rgba(78,91,146,0.05)", border: "1.5px solid rgba(78,91,146,0.1)", fontFamily: FONT }}
    >
      <h3 id="security-title" style={{ fontWeight: 700, fontSize: 15, color: INK }}>الأمان والخصوصية</h3>
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5" style={{ border: "1.5px solid rgba(78,91,146,0.08)" }}>
        <span className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 38, height: 38, background: "rgba(78,91,146,0.08)", color: PRIMARY }}>
          <KeyRound size={17} aria-hidden />
        </span>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 14, fontWeight: 700, color: INK }}>كلمة المرور</p>
          <p style={{ fontSize: 12, color: FAINT }}>
            {passwordChangedOn ? `آخر تحديث: ${passwordChangedOn}` : "استخدم كلمة مرور قوية لا تستعملها في أي موقع آخر."}
          </p>
        </div>
        <button
          type="button"
          onClick={onChangePassword}
          className="rounded-xl px-3.5 py-2 flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
          style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: "#fff", background: PRIMARY, border: "none", cursor: "pointer" }}
        >
          تغيير كلمة المرور
        </button>
      </div>
      <p className="flex items-start gap-2" style={{ fontSize: 12.5, color: FAINT, lineHeight: 1.8 }}>
        <ShieldAlert size={15} aria-hidden style={{ flexShrink: 0, marginTop: 3, color: PRIMARY }} />
        لن تطلب منك منارة أبدًا كلمة المرور أو رمز التحقق عبر رسالة أو مكالمة. لا تشاركهما مع أي أحد.
      </p>
    </section>
  );
}

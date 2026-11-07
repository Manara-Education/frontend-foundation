import { ManaraLogoIcon } from "@/shared/components/ManaraLogo";
import type { AccountOverview } from "../../account/types/account.types";
import { FAINT, INK, PRIMARY, SURFACE_TINT, cardStyle } from "../../components/settings-tokens";

/** Who is signed in: initials, name, role, address and membership, all from the profile. */
export function IdentityCard({ account }: { account: AccountOverview }) {
  return (
    <section aria-label="بطاقة الحساب" className="overflow-hidden" style={cardStyle}>
      <div className="relative overflow-hidden" style={{ height: 64 }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2D3563 0%, #4E5B92 55%, #7080B8 100%)" }} />
        <div className="absolute pointer-events-none" style={{ left: 12, bottom: -28, opacity: 0.08 }}>
          <ManaraLogoIcon size={90} color="#ffffff" />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 px-5 sm:px-6 pb-5">
        <div
          aria-hidden
          // Only the avatar rises into the banner; positioned so it paints above the banner.
          className="relative rounded-full flex items-center justify-center flex-shrink-0 self-center sm:self-auto"
          style={{
            marginTop: -46,
            width: 92,
            height: 92,
            background: "linear-gradient(135deg, #3A4880 0%, #6B7AB8 100%)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 30,
            border: "4px solid #ffffff",
            boxShadow: "0 4px 18px rgba(78,91,146,0.2)",
          }}
        >
          {account.initials}
        </div>
        <div className="flex flex-col gap-1 min-w-0 text-center sm:text-start pb-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 style={{ fontWeight: 700, fontSize: 20, color: INK, overflowWrap: "anywhere" }}>{account.fullName}</h2>
            <span className="rounded-full px-3 py-0.5" style={{ fontSize: 11, fontWeight: 700, color: PRIMARY, background: SURFACE_TINT }}>
              {account.roleLabel}
            </span>
          </div>
          <p style={{ fontSize: 13, color: FAINT }}>
            <span dir="ltr" style={{ unicodeBidi: "isolate", overflowWrap: "anywhere" }}>{account.email}</span>
            {account.memberSince ? <span> · عضو منذ {account.memberSince}</span> : null}
          </p>
        </div>
      </div>
    </section>
  );
}

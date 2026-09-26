import { Camera } from "lucide-react";
import { ManaraLogoIcon } from "@/shared/components/ManaraLogo";
import { UserAvatar } from "@/shared/identity";
import type { AccountOverview } from "../types/account.types";
import { FAINT, FONT, INK, PRIMARY, SURFACE_TINT, cardStyle } from "../../components/settings-tokens";

/** Who is signed in: photo or initials, name, role, address and membership, all from the profile. */
export function IdentityCard({ account, onEditPhoto }: { account: AccountOverview; onEditPhoto: () => void }) {
  const photoLabel = account.avatarUrl ? "تغيير الصورة" : "إضافة صورة";
  return (
    <section aria-label="بطاقة الحساب" className="overflow-hidden" style={{ ...cardStyle, fontFamily: FONT }}>
      <div className="relative overflow-hidden" style={{ height: 64 }}>
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #2D3563 0%, #4E5B92 55%, #7080B8 100%)" }} />
        <div className="absolute pointer-events-none" style={{ left: 12, bottom: -28, opacity: 0.08 }}>
          <ManaraLogoIcon size={90} color="#ffffff" />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 px-5 sm:px-6 pb-5">
        {/*
          Only the avatar rises into the banner; positioned so it paints above the banner.
          A pointer shortcut to the photo editor: the labelled button beside the name is the one
          control keyboard and screen-reader users meet, so this one is kept out of both.
        */}
        <button
          type="button"
          onClick={onEditPhoto}
          tabIndex={-1}
          aria-hidden
          className="group relative rounded-full flex-shrink-0 self-center sm:self-auto outline-none"
          style={{ marginTop: -46, padding: 0, border: "none", background: "transparent", cursor: "pointer" }}
        >
          <UserAvatar fullName={account.fullName} avatarUrl={account.avatarUrl} size={92} fontSize={30} ring="4px solid #ffffff" />
          <span
            aria-hidden
            className="absolute inset-[4px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity motion-reduce:transition-none"
            style={{ background: "rgba(30,35,64,0.5)", color: "#fff" }}
          >
            <Camera size={22} />
          </span>
        </button>
        <div className="flex flex-col gap-1 min-w-0 text-center sm:text-start pb-1 flex-1">
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
        <button
          type="button"
          onClick={onEditPhoto}
          className="self-center sm:self-end rounded-xl px-3.5 py-2 flex-shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
          style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 700, color: PRIMARY, background: SURFACE_TINT, border: "none", cursor: "pointer" }}
        >
          {photoLabel}
        </button>
      </div>
    </section>
  );
}

import { Skeleton } from "@/shared/components/skeleton";
import type { AccountNotice, AccountOverview, LoadState } from "../types/account.types";
import { FONT, INK, cardStyle } from "../../components/settings-tokens";
import { IdentityCard } from "./identity-card";
import { InfoTile } from "./info-tile";
import { LoadFailure } from "./load-failure";
import { NoticeBanner } from "./notice-banner";
import { SecurityCard } from "./security-card";
import { VerifiedBadge } from "./verified-badge";

const NOTICES: Record<AccountNotice, string> = {
  "name-saved": "تم حفظ الاسم بنجاح.",
  "password-changed": "تم تغيير كلمة المرور. سُجِّل خروجك من أجهزتك الأخرى.",
};

interface AccountOverviewContentProps {
  account: AccountOverview | null;
  loadState: LoadState;
  retry: () => void;
  notice: AccountNotice | null;
  dismissNotice: () => void;
  openNameEditor: () => void;
  openPasswordEditor: () => void;
  openPhotoEditor: () => void;
}

export function AccountOverviewContent({
  account,
  loadState,
  retry,
  notice,
  dismissNotice,
  openNameEditor,
  openPasswordEditor,
  openPhotoEditor,
}: AccountOverviewContentProps) {
  if (loadState === "error") return <LoadFailure onRetry={retry} />;
  if (loadState === "loading" || !account) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-label="جارٍ التحميل">
        <Skeleton className="h-40 rounded-[20px]" />
        <Skeleton className="h-36 rounded-[20px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5" style={{ fontFamily: FONT }}>
      {notice ? <NoticeBanner message={NOTICES[notice]} onDismiss={dismissNotice} /> : null}
      <IdentityCard account={account} onEditPhoto={openPhotoEditor} />
      <section aria-labelledby="personal-title" className="flex flex-col gap-3 p-5" style={cardStyle}>
        <h3 id="personal-title" style={{ fontWeight: 700, fontSize: 15, color: INK }}>المعلومات الشخصية</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <InfoTile label="الاسم الكامل" value={account.fullName} onEdit={openNameEditor} editLabel="تعديل" />
          <InfoTile
            label="البريد الإلكتروني"
            value={
              <span className="inline-flex flex-wrap items-center gap-2">
                <span dir="ltr" style={{ unicodeBidi: "isolate" }}>{account.email}</span>
                {account.emailVerified ? <VerifiedBadge /> : null}
              </span>
            }
            editLabel="تغيير"
            unavailableNote="تغيير البريد قريبًا"
          />
        </div>
      </section>
      <SecurityCard onChangePassword={openPasswordEditor} passwordChangedOn={account.passwordChangedOn} />
    </div>
  );
}

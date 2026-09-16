import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";
import { paths } from "@/shared/navigation/paths";
import { FONT, TEXT, TEXT_LIGHT, TEXT_MUTED, PRIMARY } from "./theme";

/** "الرئيسية / current page" — the same two-step trail every secondary public page uses. */
export function PublicBreadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="مسار التنقل" style={{ marginBlockEnd: 20 }}>
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4, fontSize: 13, fontFamily: FONT }}>
        <li>
          <Link
            to={paths.landing}
            className="focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ display: "inline-flex", alignItems: "center", minBlockSize: 44, paddingInline: 6, marginInline: -6, borderRadius: 8, color: TEXT_MUTED, textDecoration: "none", outlineColor: PRIMARY }}
          >
            الرئيسية
          </Link>
        </li>
        <li aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", color: TEXT_LIGHT }}>
          <ChevronLeft size={14} strokeWidth={2} />
        </li>
        <li>
          <span aria-current="page" style={{ display: "inline-flex", alignItems: "center", minBlockSize: 44, color: TEXT, fontWeight: 600 }}>
            {current}
          </span>
        </li>
      </ol>
    </nav>
  );
}

import type { CSSProperties } from "react";
import { Link, useLocation } from "react-router";
import { paths } from "@/shared/navigation/paths";
import { ManaraLogoFull } from "@/shared/components/ManaraLogo";
import { FONT, PRIMARY, TEXT_MUTED } from "./theme";

/**
 * The shared header for public pages that are not the landing page itself: About, Contact,
 * Privacy, Security and Terms. The landing page keeps its own richer `LandingNavbar` — this one
 * is the plain, non-scrolling version those secondary pages need.
 *
 * Active state is read from the router rather than passed in by each page, so a page cannot
 * drift out of sync with its own address.
 */
const NAV_LINKS: ReadonlyArray<{ label: string; to: string }> = [
  { label: "الرئيسية", to: paths.landing },
  { label: "الدورات", to: paths.courses },
  { label: "عن منارة", to: paths.about },
  { label: "تواصل معنا", to: paths.contact },
];

const LINK_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  minBlockSize: 44,
  paddingInline: 12,
  borderRadius: 8,
  fontFamily: FONT,
  fontSize: 14,
  fontWeight: 500,
  textDecoration: "none",
};

export function PublicHeader() {
  const location = useLocation();

  return (
    <header
      dir="rtl"
      style={{
        background: "#FFFFFF",
        borderBlockEnd: "1px solid rgba(78,91,146,0.12)",
        paddingBlock: 14,
        paddingInline: "clamp(16px, 4vw, 40px)",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          maxInlineSize: 1100,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px 20px",
        }}
      >
        <Link
          to={paths.landing}
          replace
          aria-label="العودة إلى منارة"
          className="focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
          style={{ textDecoration: "none", outlineColor: PRIMARY }}
        >
          <ManaraLogoFull size={30} color={PRIMARY} textColor={PRIMARY} />
        </Link>
        <nav aria-label="روابط الموقع">
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2px 4px" }}>
            {NAV_LINKS.map((link) => {
              // The courses link is an in-page anchor on the landing page, never a page of its
              // own, so it never lights up as the current page.
              const active = link.to !== paths.courses && location.pathname === link.to;
              return (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    replace
                    aria-current={active ? "page" : undefined}
                    className="focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{ ...LINK_STYLE, color: active ? PRIMARY : TEXT_MUTED, outlineColor: PRIMARY }}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

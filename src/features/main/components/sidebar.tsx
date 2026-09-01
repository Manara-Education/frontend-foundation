import { Fragment } from "react";
import { Link } from "react-router";
import { LogOut } from "lucide-react";
import { ManaraLogoIcon } from "@/shared/components/ManaraLogo";
import { isInstructorRole } from "@/shared/auth/roles";
import { towardInlineEnd, useDirection } from "@/shared/direction";
import type { NavSectionId } from "@/shared/navigation/paths";
import { getNavSectionsForRole } from "./nav-sections";

const PRIMARY = "#4E5B92";

interface SidebarProps {
  /**
   * The primary area the current route belongs to, taken from that route's own metadata.
   *
   * The sidebar keeps no selection of its own. There is nothing here that can fall out of
   * step with the URL after a refresh, a deep link, or a browser Back — the route decides,
   * every time.
   */
  activeSection?: NavSectionId;
  onLogout: () => void;
  role?: string;
  fullName?: string;
  /**
   * How the sidebar is being presented.
   *
   * `persistent` is the column beside the content, which is the only thing that fits from
   * `md` up. `drawer` is the same navigation slid over the content on a phone, where 280px
   * of the 375 available cannot be spent on a permanent column.
   *
   * The entries, their order and their active state are identical in both — this changes
   * where the navigation sits, not what it is.
   */
  variant?: "persistent" | "drawer";
  /** Called when an entry is chosen, so a drawer can shut behind it. */
  onNavigate?: () => void;
}

export function Sidebar({
  activeSection,
  onLogout,
  role,
  fullName,
  variant = "persistent",
  onNavigate,
}: SidebarProps) {
  const navSections = getNavSectionsForRole(role);
  const isDrawer = variant === "drawer";
  /*
    The side the navigation is on is a property of the layout, not of the copy. Everything
    below that cannot be said with a logical CSS property is derived from this.
  */
  const direction = useDirection();
  return (
    <aside
      dir={direction}
      style={{
        /*
          As a column, 280px that must not be squeezed by the content beside it. As a
          drawer, whatever width the overlay was given — which is capped against the
          viewport, so a `min-inline-size: 280px` here would defeat the cap and push the
          panel off the edge on a very narrow screen.
        */
        inlineSize: isDrawer ? "100%" : 280,
        minInlineSize: isDrawer ? 0 : 280,
        /*
          `100%` rather than `100vh`: as a drawer this is inside a fixed overlay that has
          already been sized against `dvh`, and as a persistent column its parent is the
          shell row. `100vh` measured the viewport with the mobile browser's chrome
          retracted, so the logout button sat under the address bar.
        */
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#FFFFFF",
        /* The edge facing the content, whichever side that is. */
        borderInlineEnd: "1px solid rgba(78,91,146,0.1)",
        boxShadow: isDrawer
          /* Modal: lifted off the page on every side, so it needs no direction. */
          ? "0 0 60px rgba(30,35,64,0.28)"
          /* Column: falls across the content, which is towards inline-end. `box-shadow`
             takes a physical x-offset, so the sign has to come from the direction. */
          : `${towardInlineEnd(direction, 4)}px 0 24px rgba(78,91,146,0.05)`,
        fontFamily: "'Cairo', sans-serif",
        zIndex: 10,
        overflowY: "auto",
      }}
    >
      {/* ── LOGO HEADER ────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5"
        style={{
          height: 64,
          borderBottomWidth: 1,
          borderBottomStyle: "solid",
          borderBottomColor: "rgba(78,91,146,0.07)",
          flexShrink: 0,
        }}
      >
        <ManaraLogoIcon size={32} color={PRIMARY} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#1E2340", lineHeight: 1.1 }}>
            منارة
          </div>
          <div style={{ fontWeight: 400, fontSize: 10, color: "#B0B7D4", letterSpacing: 1.5 }}>
            MANARA
          </div>
        </div>
      </div>

      {/* ── USER CARD ──────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 py-4 mx-3 my-3 rounded-2xl"
        style={{
          background: "rgba(78,91,146,0.04)",
          border: "1px solid rgba(78,91,146,0.08)",
          flexShrink: 0,
        }}
      >
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            width: 42,
            height: 42,
            background: "linear-gradient(135deg, #4E5B92 0%, #6B7AB8 100%)",
            color: "white",
            fontWeight: 700,
            fontSize: 17,
            boxShadow: "0 2px 8px rgba(78,91,146,0.25)",
          }}
        >
          أ
        </div>
        <div className="min-w-0">
          <div
            style={{ fontWeight: 600, fontSize: 14, color: "#1E2340", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {fullName || "المستخدم"}
          </div>
          <div style={{ fontWeight: 400, fontSize: 11, color: "#9BA3C4" }}>
            {isInstructorRole(role) ? "معلّم" : "طالب"}
          </div>
        </div>
        {/* Online dot */}
        <div
          className="rounded-full flex-shrink-0 ms-auto"
          style={{ width: 8, height: 8, background: "#27AE60", boxShadow: "0 0 0 2px rgba(39,174,96,0.2)" }}
        />
      </div>

      {/* ── NAV ITEMS ──────────────────────────────────────────────── */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1">
        {navSections.map((section, sIdx) => (
          <Fragment key={section.label}>
            <div
              className="px-2 pt-3 pb-1"
              style={{ fontSize: 10, fontWeight: 600, color: "#B0B7D4", letterSpacing: 1.5, flexShrink: 0, marginTop: sIdx === 0 ? 0 : 6 }}
            >
              {section.label}
            </div>
            {section.items.map(({ icon: Icon, label, id, to }) => {
              const isActive = activeSection === id;
              return (
                /*
                  A real anchor rather than a click handler: the entry has an address the
                  browser can show in the status bar, open in a new tab, and restore on Back.
                */
                <Link
                  key={id}
                  to={to}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    height: 52,
                    paddingInline: 12,
                    borderRadius: 14,
                    background: isActive ? "rgba(78,91,146,0.09)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: isActive ? PRIMARY : "#5A5A7A",
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 14,
                    textAlign: "start",
                    textDecoration: "none",
                    flexShrink: 0,
                    position: "relative",
                    transition: "background 0.15s, color 0.15s",
                    outline: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(78,91,146,0.05)";
                      e.currentTarget.style.color = PRIMARY;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#5A5A7A";
                    }
                  }}
                >
                  {/* Active indicator, on the entry's inline-end edge — the inner one,
                      facing the content: the left in Arabic, the right in English. */}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        insetInlineEnd: 0,
                        top: "50%",
                        /* Centring on the block axis is the same operation either way, so
                           this transform is deliberately physical. */
                        transform: "translateY(-50%)",
                        inlineSize: 3,
                        blockSize: 28,
                        /* Rounded on the side that faces into the entry, flat against the
                           edge it is pinned to. */
                        borderStartStartRadius: 3,
                        borderEndStartRadius: 3,
                        background: PRIMARY,
                      }}
                    />
                  )}

                  {/* Icon pill */}
                  <div
                    className="rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 36,
                      height: 36,
                      background: isActive ? `rgba(78,91,146,0.14)` : "rgba(78,91,146,0.06)",
                      color: isActive ? PRIMARY : "#9BA3C4",
                      transition: "background 0.15s, color 0.15s",
                    }}
                  >
                    <Icon size={16} />
                  </div>

                  {/* Label */}
                  <span style={{ flex: 1 }}>{label}</span>

                  {/* Active dot */}
                  {isActive && (
                    <div
                      className="rounded-full"
                      style={{ width: 6, height: 6, background: PRIMARY, flexShrink: 0 }}
                    />
                  )}
                </Link>
              );
            })}
          </Fragment>
        ))}
      </nav>

      {/* ── SPACER ─────────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── LOGOUT ─────────────────────────────────────────────────── */}
      <div
        className="px-3 py-3"
        style={{ borderTop: "1px solid rgba(78,91,146,0.07)", flexShrink: 0 }}
      >
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            height: 48,
            paddingInline: 12,
            borderRadius: 14,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#C0392B",
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 500,
            fontSize: 14,
            textAlign: "start",
            transition: "background 0.15s",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(212,24,61,0.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <div
            className="rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              width: 36,
              height: 36,
              background: "rgba(212,24,61,0.07)",
              color: "#C0392B",
            }}
          >
            <LogOut size={15} />
          </div>
          تسجيل الخروج
        </button>
      </div>

      {/* ── BOTTOM BRAND ───────────────────────────────────────────── */}
      <div
        className="flex items-center justify-center gap-2 py-3"
        style={{ borderTop: "1px solid rgba(78,91,146,0.05)", flexShrink: 0 }}
      >
        <ManaraLogoIcon size={12} color="rgba(78,91,146,0.2)" />
        <span style={{ fontSize: 10, color: "#D0D4E8", letterSpacing: 0.5 }}>
          منارة © ٢٠٢٦
        </span>
      </div>
    </aside>
  );
}

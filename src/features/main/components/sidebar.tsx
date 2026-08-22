import { Fragment, type ElementType } from "react";
import { Home, BookOpen, Compass, User, LogOut, PlusSquare, Megaphone } from "lucide-react";
import { ManaraLogoIcon } from "@/shared/components/ManaraLogo";

const PRIMARY = "#4E5B92";

export type ActiveView =
  | "home"
  | "explore"
  | "profile"
  | "instructor-home"
  | "instructor-courses"
  | "instructor-create"
  | "instructor-banners";

interface NavItem { icon: ElementType; label: string; view: ActiveView }
interface NavSection { label: string; items: NavItem[] }

const studentSection: NavSection = {
  label: "الطالب",
  items: [
    { icon: Home, label: "دوراتي", view: "home" },
    { icon: Compass, label: "استكشاف الدورات", view: "explore" },
    { icon: User, label: "ملفي الشخصي", view: "profile" },
  ],
};

const instructorSection: NavSection = {
  label: "المدرّب",
  items: [
    { icon: Home, label: "الرئيسية", view: "instructor-home" },
    { icon: BookOpen, label: "دوراتي", view: "instructor-courses" },
    { icon: PlusSquare, label: "إنشاء دورة", view: "instructor-create" },
    { icon: Megaphone, label: "الإعلانات", view: "instructor-banners" },
    { icon: User, label: "ملفي الشخصي", view: "profile" },
  ],
};

export function isInstructorRole(role: string | undefined): boolean {
  return role?.toUpperCase() === "INSTRUCTOR";
}

export function getNavSectionsForRole(role: string | undefined): NavSection[] {
  return isInstructorRole(role) ? [instructorSection] : [studentSection];
}

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onLogout: () => void;
  role?: string;
  fullName?: string;
}

export function Sidebar({ activeView, onNavigate, onLogout, role, fullName }: SidebarProps) {
  const navSections = getNavSectionsForRole(role);
  return (
    <aside
      dir="rtl"
      style={{
        width: 280,
        minWidth: 280,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        background: "#FFFFFF",
        borderLeft: "1px solid rgba(78,91,146,0.1)",
        boxShadow: "-4px 0 24px rgba(78,91,146,0.05)",
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
          className="rounded-full flex-shrink-0 mr-auto"
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
            {section.items.map(({ icon: Icon, label, view }) => {
              const isActive = activeView === view;
              return (
                <button
                  key={view}
                  onClick={() => onNavigate(view)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    height: 52,
                    paddingRight: 12,
                    paddingLeft: 12,
                    borderRadius: 14,
                    background: isActive ? "rgba(78,91,146,0.09)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: isActive ? PRIMARY : "#5A5A7A",
                    fontFamily: "'Cairo', sans-serif",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 14,
                    textAlign: "right",
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
                  {/* Active indicator — left edge (inner edge facing content) */}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 3,
                        height: 28,
                        borderRadius: "0 3px 3px 0",
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
                </button>
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
            paddingRight: 12,
            paddingLeft: 12,
            borderRadius: 14,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#C0392B",
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 500,
            fontSize: 14,
            textAlign: "right",
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

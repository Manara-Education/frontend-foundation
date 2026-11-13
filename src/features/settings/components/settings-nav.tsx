import { NavLink } from "react-router";
import { ChevronDown } from "lucide-react";
import type { SettingsSection } from "../settings-sections";
import { BORDER, FAINT, FONT, INK, MUTED, PRIMARY, SURFACE_TINT, cardStyle } from "./settings-tokens";

interface SettingsNavProps {
  sections: readonly SettingsSection[];
  activeSectionId?: string;
  activeLinkId?: string;
}

/**
 * The Settings navigation: a sticky rail beside the content from `lg`, two rows of pills above
 * it below `lg`. Both are ordinary links, so the router — not component state — decides what is
 * selected, and `aria-current` follows the URL.
 */
export function SettingsNav({ sections, activeSectionId, activeLinkId }: SettingsNavProps) {
  const activeSection = sections.find((section) => section.id === activeSectionId);

  return (
    <>
      {/* Rail, lg and up */}
      <nav
        aria-label="أقسام الإعدادات"
        className="hidden lg:flex flex-col gap-1 p-2 self-start sticky"
        style={{ ...cardStyle, width: 256, flexShrink: 0, top: 24, fontFamily: FONT }}
      >
        {sections.map((section) => {
          const active = section.id === activeSectionId;
          const Icon = section.icon;
          return (
            <div key={section.id} className="flex flex-col">
              <NavLink
                to={section.to}
                aria-current={active ? "page" : undefined}
                aria-expanded={section.children ? active : undefined}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
                style={{ background: active ? SURFACE_TINT : "transparent", textDecoration: "none" }}
              >
                <span
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{ width: 34, height: 34, background: active ? PRIMARY : SURFACE_TINT, color: active ? "#fff" : PRIMARY }}
                >
                  <Icon size={16} aria-hidden />
                </span>
                <span className="flex flex-col flex-1 min-w-0">
                  <span style={{ fontWeight: 700, fontSize: 14, color: active ? PRIMARY : INK }}>{section.label}</span>
                  <span style={{ fontSize: 11.5, color: FAINT }}>{section.description}</span>
                </span>
                {section.children ? (
                  <ChevronDown
                    size={16}
                    aria-hidden
                    style={{ color: MUTED, transform: active ? "rotate(180deg)" : undefined, transition: "transform 150ms" }}
                  />
                ) : null}
              </NavLink>
              {section.children && active ? (
                <ul className="flex flex-col gap-0.5 mt-1 mb-1" style={{ paddingInlineStart: 22, borderInlineStart: `2px solid ${BORDER}`, marginInlineStart: 20 }}>
                  {section.children.map((link) => {
                    const current = link.id === activeLinkId;
                    return (
                      <li key={link.id}>
                        <NavLink
                          to={link.to}
                          aria-current={current ? "page" : undefined}
                          className="block rounded-lg px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
                          style={{
                            fontSize: 13,
                            fontWeight: current ? 700 : 600,
                            color: current ? PRIMARY : MUTED,
                            background: current ? SURFACE_TINT : "transparent",
                            textDecoration: "none",
                          }}
                        >
                          {link.label}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </nav>

      {/* Pills, below lg */}
      <nav aria-label="أقسام الإعدادات" className="flex lg:hidden flex-col gap-2" style={{ fontFamily: FONT }}>
        <PillRow
          items={sections.map((section) => ({ id: section.id, label: section.label, to: section.to }))}
          activeId={activeSectionId}
        />
        {activeSection?.children ? (
          <PillRow items={activeSection.children} activeId={activeLinkId} secondary />
        ) : null}
      </nav>
    </>
  );
}

function PillRow({
  items,
  activeId,
  secondary = false,
}: {
  items: readonly { id: string; label: string; to: string }[];
  activeId?: string;
  secondary?: boolean;
}) {
  return (
    <ul className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <li key={item.id} className="flex-shrink-0">
            <NavLink
              to={item.to}
              aria-current={active ? "page" : undefined}
              className="block rounded-full px-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#4E5B92]"
              style={{
                fontSize: secondary ? 12.5 : 13,
                fontWeight: 700,
                whiteSpace: "nowrap",
                textDecoration: "none",
                color: active ? (secondary ? PRIMARY : "#fff") : MUTED,
                background: active ? (secondary ? SURFACE_TINT : PRIMARY) : "#fff",
                border: `1.5px solid ${active && secondary ? "rgba(78,91,146,0.25)" : BORDER}`,
              }}
            >
              {item.label}
            </NavLink>
          </li>
        );
      })}
    </ul>
  );
}

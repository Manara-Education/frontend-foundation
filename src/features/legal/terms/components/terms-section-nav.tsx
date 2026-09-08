import { BORDER, FONT, PRIMARY, TEXT, TEXT_MUTED } from "@/features/landing/components/theme";
import type { TermsSection } from "../types/terms.types";

interface TermsSectionNavProps {
  sections: TermsSection[];
}

const NAV_HEADING_ID = "terms-contents-heading";

/**
 * The table of contents.
 *
 * Ordinary in-page anchors, not scroll-spy: an anchor moves keyboard focus as well as the
 * viewport, is addressable from outside the page, and survives with JavaScript disabled —
 * all of which matter more on a legal document than a highlighted current section does.
 *
 * `<nav>` is labelled by its own visible heading, so a screen-reader user landing on the
 * landmark hears what this list of twelve links is for.
 */
export function TermsSectionNav({ sections }: TermsSectionNavProps) {
  return (
    <nav
      aria-labelledby={NAV_HEADING_ID}
      style={{
        background: "#FFFFFF",
        border: `1px solid ${BORDER}`,
        borderRadius: 20,
        padding: "20px 22px",
      }}
    >
      <h2
        id={NAV_HEADING_ID}
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 15,
          color: TEXT,
          margin: "0 0 12px",
        }}
      >
        محتويات الوثيقة
      </h2>
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {sections.map((section) => (
          <li key={section.id}>
            <a
              className="rs-longform focus-visible:outline-2 focus-visible:outline-offset-2"
              href={`#${section.id}`}
              style={{
                display: "block",
                fontFamily: FONT,
                fontSize: 14,
                lineHeight: 1.8,
                color: TEXT_MUTED,
                textDecoration: "none",
                borderRadius: 10,
                padding: "6px 10px",
                outlineColor: PRIMARY,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = PRIMARY;
                event.currentTarget.style.background = "rgba(78,91,146,0.06)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = TEXT_MUTED;
                event.currentTarget.style.background = "transparent";
              }}
            >
              <span style={{ color: PRIMARY, fontWeight: 700 }}>{section.number}.</span>{" "}
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

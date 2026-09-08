import { FONT, TEXT, TEXT_MUTED } from "@/features/landing/components/theme";
import type { TermsBlock, TermsDocument } from "../types/terms.types";

interface TermsDocumentViewProps {
  document: TermsDocument;
  /** The `<h1>` lives in the page header, so the document itself starts at `<h2>`. */
  titleId: string;
}

function Block({ block }: { block: TermsBlock }) {
  if (block.kind === "list") {
    return (
      <ul
        style={{
          margin: 0,
          paddingInlineStart: 22,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {block.items.map((item) => (
          <li
            key={item}
            className="rs-longform"
            style={{ fontFamily: FONT, fontSize: 16, color: TEXT_MUTED, lineHeight: 2 }}
          >
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p
      className="rs-longform"
      style={{ fontFamily: FONT, fontSize: 16, color: TEXT_MUTED, lineHeight: 2, margin: 0 }}
    >
      {block.text}
    </p>
  );
}

/**
 * The agreement itself, and nothing else.
 *
 * The version, the effective date, the navigation and the sign-up call to action all sit
 * outside this element on purpose: everything inside the `<article>` is text the user is
 * agreeing to, so nothing that is merely *about* the document may appear here.
 *
 * Each section is its own `<section>` with an `id` matching its anchor, addressed by an
 * `<h2>` — which is what makes the twelve clauses navigable by heading rather than by
 * scrolling through a single wall of prose.
 */
export function TermsDocumentView({ document, titleId }: TermsDocumentViewProps) {
  return (
    <article
      aria-labelledby={titleId}
      style={{ display: "flex", flexDirection: "column", gap: 36 }}
    >
      <p
        className="rs-longform"
        style={{ fontFamily: FONT, fontSize: 17, color: TEXT, lineHeight: 2, margin: 0 }}
      >
        {document.preamble}
      </p>

      {document.sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          style={{ display: "flex", flexDirection: "column", gap: 14, scrollMarginBlockStart: 24 }}
        >
          <h2
            className="rs-longform"
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: "clamp(18px, 2.4vw, 21px)",
              color: TEXT,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {section.number}. {section.title}
          </h2>
          {section.blocks.map((block, index) => (
            <Block key={`${section.id}-${index}`} block={block} />
          ))}
        </section>
      ))}
    </article>
  );
}

import { FONT, PRIMARY, TEXT, TEXT_MUTED } from "@/features/landing/components/theme";
import { mailtoHref } from "@/shared/business";
import type { PrivacyPolicy, PrivacyPolicyBlock } from "../types/privacy-policy.types";

const TEXT_STYLE = { fontFamily: FONT, fontSize: 16, color: TEXT_MUTED, lineHeight: 2, margin: 0 } as const;

/*
  Every value from the server is rendered as a React text child — never through
  dangerouslySetInnerHTML — so markup inside the policy text is shown as characters, not run.
*/
function Block({ block }: { block: PrivacyPolicyBlock }) {
  if (block.kind === "list") {
    return (
      <ul style={{ margin: 0, paddingInlineStart: 22, display: "flex", flexDirection: "column", gap: 8 }}>
        {block.items.map((item, index) => (
          <li key={index} className="rs-longform" style={{ ...TEXT_STYLE, overflowWrap: "anywhere" }}>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  if (block.kind === "email") {
    const href = mailtoHref(block.address);
    return (
      <p className="rs-longform" style={{ ...TEXT_STYLE, color: TEXT }}>
        <span style={{ fontWeight: 600 }}>{block.label}: </span>
        {href ? (
          <a
            href={href}
            dir="ltr"
            className="focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ color: PRIMARY, fontWeight: 600, textDecoration: "none", borderBlockEnd: "1px solid rgba(78,91,146,0.35)", outlineColor: PRIMARY, overflowWrap: "anywhere" }}
          >
            {block.address}
          </a>
        ) : (
          <span dir="ltr">{block.address}</span>
        )}
      </p>
    );
  }

  return (
    <p className="rs-longform" style={{ ...TEXT_STYLE, overflowWrap: "anywhere" }}>
      {block.text}
    </p>
  );
}

/**
 * The policy text, and nothing about it. Version and date sit outside the `<article>`, as on the
 * terms page. Each section is a `<section>` with the server's stable id and an `<h2>`.
 */
export function PrivacyPolicyDocument({ policy, titleId }: { policy: PrivacyPolicy; titleId: string }) {
  return (
    <article aria-labelledby={titleId} lang={policy.language} style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <p className="rs-longform" style={{ fontFamily: FONT, fontSize: 17, color: TEXT, lineHeight: 2, margin: 0 }}>
        {policy.summary}
      </p>

      {policy.sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-heading`}
          style={{ display: "flex", flexDirection: "column", gap: 14, scrollMarginBlockStart: 24 }}
        >
          <h2
            id={`${section.id}-heading`}
            className="rs-longform"
            style={{ fontFamily: FONT, fontWeight: 700, fontSize: "clamp(18px, 2.4vw, 21px)", color: TEXT, lineHeight: 1.6, margin: 0 }}
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

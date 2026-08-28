/**
 * The stylesheet for rendered lesson content.
 *
 * Everything here is scoped under `.mrc`, which is the containment boundary: these rules apply
 * inside a lesson body and nowhere else, and no rule an author can trigger reaches out of it.
 * Authored styling is applied inline per block from design tokens; this file is the surrounding
 * typography, the responsive behaviour and the accessibility affordances, none of which an
 * instructor can affect.
 *
 * Shipped as a string and rendered in a `<style>` element, matching how `lesson.constants.ts`
 * already ships the lesson page's own sheet, rather than introducing a second styling mechanism
 * for one feature.
 */
export const RICH_CONTENT_STYLES = `
  .mrc {
    font-family: 'Cairo', sans-serif;
    color: #1F2937;
    /*
      The two rules that keep authored content inside its container.

      A long unbroken word — a URL pasted as text, a German compound, a run of Arabic with no
      spaces — is the classic way a content block pushes a page sideways and gives the whole
      document a horizontal scrollbar. overflow-wrap breaks it only when it would otherwise
      overflow; min-width:0 is what lets this element shrink when it sits in a flex row, which the
      lesson page's two-column layout is.
    */
    overflow-wrap: anywhere;
    word-break: break-word;
    min-width: 0;
  }

  .mrc > *:last-child {
    /* The last block's bottom spacing is the container's padding to control, not the author's. */
    margin-bottom: 0 !important;
  }

  .mrc-p {
    margin: 0;
  }

  .mrc-h {
    margin: 0;
    font-weight: 700;
    line-height: 1.5;
    color: #1E2340;
  }

  .mrc-list {
    margin: 0;
    /*
      Logical padding, so the markers sit on the reading side: the right in Arabic, the left in
      English. padding-left would put Arabic bullets on the wrong side of their text.
    */
    padding-inline-start: 24px;
    font-size: 15px;
    line-height: 1.95;
  }

  .mrc-li {
    margin-bottom: 6px;
  }

  .mrc-li:last-child {
    margin-bottom: 0;
  }

  .mrc-quote {
    margin: 0;
    /* Logical again: the rule is on the reading side in both directions. */
    border-inline-start: 3px solid rgba(78,91,146,0.35);
    padding-inline-start: 14px;
    font-size: 15px;
    line-height: 1.95;
    color: #4B5563;
  }

  .mrc-divider {
    border: none;
    border-top: 1px solid #ECECEC;
    margin: 20px 0;
  }

  .mrc-link {
    color: #4E5B92;
    text-decoration: underline;
    text-underline-offset: 3px;
    /*
      Underlined as well as coloured, deliberately. A link identified by colour alone is invisible
      to a reader who cannot distinguish it from the body text.
    */
  }

  .mrc-link:hover {
    color: #3C4778;
  }

  .mrc-link:focus-visible,
  .mrc-cta:focus-visible {
    outline: 2px solid #4E5B92;
    outline-offset: 2px;
    border-radius: 4px;
  }

  .mrc-cta-row {
    display: flex;
    /* Wraps rather than overflowing when a long label meets a narrow screen. */
    flex-wrap: wrap;
  }

  .mrc-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* 44px is the smallest comfortable touch target; the button grows past it for long labels. */
    min-height: 44px;
    padding: 10px 22px;
    border-radius: 12px;
    font-family: 'Cairo', sans-serif;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.18s, opacity 0.18s;
    /* Never wider than its column, however long the label is. */
    max-width: 100%;
  }

  .mrc-cta:hover {
    filter: brightness(0.95);
  }

  .mrc-cta-inert {
    cursor: default;
    opacity: 0.65;
  }

  @media (max-width: 640px) {
    .mrc-cta-row {
      /* A button is easier to hit at full width on a phone than aligned to one side. */
      justify-content: stretch !important;
    }

    .mrc-cta {
      width: 100%;
    }
  }
`;

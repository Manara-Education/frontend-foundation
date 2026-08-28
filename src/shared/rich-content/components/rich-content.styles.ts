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
import { richListStyles } from "./rich-list.styles";

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
    line-height: 1.4;
    color: #1E2340;
    /* A long Arabic heading breaks between words rather than mid-word, however narrow it gets. */
    overflow-wrap: break-word;
  }

  /*
    Space above a heading, which is the half of heading spacing an author has no way to ask for.

    The authored vocabulary is a bottom margin and nothing else, deliberately — a block can push
    the next one down and can do nothing else. That leaves the gap *above* a heading unowned, and
    unowned it comes out as whatever the previous paragraph's bottom margin happened to be, which
    is how a section title ends up sitting on the paragraph it follows. These rules give a heading
    room to start a section, scaled to how big a break the level implies, and they never fight the
    author: only the first block's own margin-bottom is theirs, and this touches margin-top.

    Scoped to a heading with something before it, so a lesson never opens with a blank band.
  */
  .mrc > * + .mrc-h1 { margin-block-start: 40px; }
  .mrc > * + .mrc-h2 { margin-block-start: 32px; }
  .mrc > * + .mrc-h3 { margin-block-start: 24px; }

  /*
    Emphasis worth seeing. Cairo is loaded across its full weight range, so bold is set explicitly
    rather than left to the browser's synthetic bold, and it darkens a shade — at 17px against
    body grey, weight alone is a weaker signal than it looks in a specimen.
  */
  .mrc strong {
    font-weight: 700;
    color: #111827;
  }

  /*
    Markers, indent and item spacing come from the layer the editing surface also uses, so a list
    cannot look like one thing while it is being written and another once it is published. See
    rich-list.styles.ts for why restating list-style-type is necessary at all.
  */
  ${richListStyles(".mrc")}

  .mrc-list {
    /* The block's own bottom margin is the author's, applied inline from their spacing token. */
    margin: 0;
    /* Tracks the body size: a list is the lesson's prose, not a caption under it. */
    font-size: 17px;
    line-height: 1.9;
  }

  /*
    A quote, drawn as a callout.

    Every edge here is logical rather than left/right, which is what makes the accent land on the
    reading side in both directions: on the right of Arabic, on the left of English. A "border-left"
    would put the rule on the far side of an Arabic quote, where it reads as a stray line rather
    than as an accent.
  */
  .mrc-quote {
    margin: 0;
    border-inline-start: 4px solid rgba(78,91,146,0.4);
    border-start-end-radius: 12px;
    border-end-end-radius: 12px;
    background: rgba(78,91,146,0.045);
    padding: 16px 20px;
    font-size: 17px;
    line-height: 1.9;
    color: #4B5563;
  }

  .mrc-divider {
    border: none;
    border-top: 1px solid #ECECEC;
    margin: 28px 0;
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
    /*
      Tighter vertical rhythm on a phone, where a 40px band above a heading is a meaningful
      fraction of the screen rather than a pause in it. Type sizes are left alone: 17px is the
      size a lesson should be read at on any screen, and shrinking body text on the smallest
      screen is how a phone ends up harder to read than a laptop.
    */
    .mrc > * + .mrc-h1 { margin-block-start: 30px; }
    .mrc > * + .mrc-h2 { margin-block-start: 24px; }
    .mrc > * + .mrc-h3 { margin-block-start: 20px; }

    .mrc-quote {
      padding: 14px 16px;
    }

    .mrc-cta-row {
      /* A button is easier to hit at full width on a phone than aligned to one side. */
      justify-content: stretch !important;
    }

    .mrc-cta {
      width: 100%;
    }
  }
`;

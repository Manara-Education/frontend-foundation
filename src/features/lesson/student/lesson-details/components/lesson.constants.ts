export const PRIMARY = "#4E5B92";
export const FONT = "'Cairo', sans-serif";
export const SUCCESS = "#22C55E";

/**
 * The lesson page's grid, in one place.
 *
 * `LP_PAGE_MAX` is what the header, the breadcrumb and the completion banner align to;
 * `LP_SURFACE_MAX` is the reading surface inset inside it — the article card and the
 * previous/complete/next footer under it; `LP_READING_MAX` is the article's own measure.
 *
 * Three constraints rather than one because they answer three different questions. The page
 * width is how much of a wide monitor the screen is willing to occupy, the surface width is
 * how wide a card may be before it stops reading as a document, and the reading width is how
 * long a line of Arabic may run before the eye loses the next one. Collapsing them would mean
 * a card that hugs its text and no longer lines up with the header above it, or a header grid
 * so narrow the lesson looks like a dialog.
 *
 * Only a rich-content lesson uses them. A video lesson lays itself out beside its rail and is
 * left exactly as it was.
 */
export const LP_PAGE_MAX = 1120;
export const LP_SURFACE_MAX = 940;
export const LP_READING_MAX = 780;

export const LP_SHIMMER = `
  @keyframes lp-spin {
    to { transform: rotate(360deg); }
  }
  .lp-spin {
    animation: lp-spin 0.9s linear infinite;
  }
  @keyframes lp-shimmer {
    0%   { background-position: -800px 0; }
    100% { background-position:  800px 0; }
  }
  .lp-sk {
    background: linear-gradient(100deg,#EAECF5 0%,#EAECF5 35%,#F4F5FB 50%,#EAECF5 65%,#EAECF5 100%);
    background-size: 800px 100%;
    animation: lp-shimmer 1.8s ease-in-out infinite;
  }

  /*
    ── The reading grid ──────────────────────────────────────────────────────────────────

    The lesson route asks the shell for its full width, because a video lesson lays its player
    and its rail out across it. A lesson that is *read* wants the opposite, and this is where it
    takes its width back: the page column, the surface inset inside it, and the article's measure
    inside that.

    Widths are capped rather than fitted. "width: fit-content" would hand the page's width to
    whatever the instructor happened to write — a lesson of one short line would draw a narrow
    card and the next lesson a wide one — so every step here is "as wide as available, up to a
    limit", which lands in the same place whatever the content is.
  */
  /*
    The lesson page's root, whatever kind of lesson it turns out to be.

    No width is declared. A block element already fills its parent, and leaving it at "auto" is
    precisely what lets the reading modifier below reclaim the shell's padding with a negative
    inline margin on a phone — a declared width: 100% would turn that reclaim into a horizontal
    overflow instead of a wider column.
  */
  .lp-page {
    min-width: 0;
  }

  .lp-page--reading {
    max-width: ${LP_PAGE_MAX}px;
    margin-inline: auto;
  }

  .lp-reading-surface {
    max-width: ${LP_SURFACE_MAX}px;
    margin-inline: auto;
  }

  .lp-reading-card {
    /*
      Padding, not margin, so the card's own background reaches the full surface width while
      its contents stay inside the measure.

      The card's own radius and padding live here rather than inline on the component, because
      they are the two things that have to change on a narrow screen and an inline style is the
      one thing a media query cannot reach.
    */
    border-radius: 20px;
    padding: 40px 44px 44px;
  }

  .mrc.lp-reading-column {
    /*
      The measure. In px rather than in "ch" units, because "ch" is derived from the font size and
      would quietly re-narrow the column every time the body type changed.
    */
    max-width: ${LP_READING_MAX}px;
    margin-inline: auto;
  }

  /*
    ── Previous / complete / next ────────────────────────────────────────────────────────

    One row, aligned to the reading surface. The equal side columns are what keep the
    completion control on the page's centre line whether the lesson has both neighbours, one,
    or neither — an absent neighbour leaves its column empty rather than pulling the middle
    across.

    Logical placement only: the row is a grid in document order, so [dir=rtl] puts the
    previous lesson on the right without anything here naming a side.
  */
  .lp-lesson-footer {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .lp-lesson-footer__side {
    min-width: 0;
  }

  .lp-lesson-footer__action {
    justify-self: center;
  }

  /* The completion control centres itself in the footer; the rail's copy stays where it was. */
  .lp-lesson-footer .lp-complete-row {
    margin-bottom: 0 !important;
    align-items: center !important;
  }

  /*
    ── The video lesson's two columns ────────────────────────────────────────────────────
    Unchanged. A player and its rail, folding into one column on a narrow screen.
  */
  .lp-two-col {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  .lp-main-col {
    flex: 1;
    min-width: 0;
  }
  .lp-curriculum-col {
    width: 300px;
    flex-shrink: 0;
    position: sticky;
    top: 20px;
    max-height: calc(100vh - 110px);
    overflow-y: auto;
  }
  @media (max-width: 900px) {
    .lp-two-col {
      flex-direction: column !important;
    }
    .lp-main-col {
      order: 1;
      width: 100%;
    }
    .lp-curriculum-col {
      order: 2;
      width: 100% !important;
      position: static !important;
      max-height: none !important;
    }
  }

  /* ── Tablet and small laptop ─────────────────────────────────────────────────────────── */
  @media (max-width: 1024px) {
    .lp-reading-card {
      padding: 30px 28px 32px;
    }
  }

  /*
    The footer's three columns need room for two lesson titles either side of a button. Below
    that they stack, in the order they are read: where you were, the action, where you are going.
  */
  @media (max-width: 820px) {
    .lp-lesson-footer {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    .lp-lesson-footer__action {
      justify-self: stretch;
    }
  }

  /* ── Phone ───────────────────────────────────────────────────────────────────────────── */
  @media (max-width: 640px) {
    /*
      The shell insets every screen by 32px. A lesson body reads better nearer the edge on a
      phone, so the page reclaims half of that back rather than nesting a second inset inside
      the first — the article ends up with the ~16px page padding a phone wants, instead of 32
      plus the card's own.
    */
    .lp-page--reading {
      max-width: none;
      margin-inline: -16px;
    }
    .lp-reading-card {
      padding: 22px 18px 24px;
      border-radius: 16px;
    }
    /*
      The completion control sits under the lesson body. Full width on a phone, where a button
      aligned to one side is harder to reach than one that spans the column.
    */
    .lp-complete-row,
    .lp-lesson-footer .lp-complete-row {
      align-items: stretch !important;
    }
    .lp-complete-row > button,
    .lp-complete-row > span[role="status"] {
      width: 100%;
      justify-content: center;
    }
  }
`;

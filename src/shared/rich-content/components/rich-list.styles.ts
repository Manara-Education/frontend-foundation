/**
 * How a lesson's lists are drawn, in one place, for every surface that draws them.
 *
 * <h2>Why this file exists</h2>
 * The app's CSS reset — Tailwind's preflight, pulled in by `styles/tailwind.css` — contains:
 *
 * ```css
 * ol, ul, menu { list-style: none; }
 * ```
 *
 * That is the right default for an application: almost every list in Manara is navigation, a card
 * grid or a menu, and none of those wants a bullet. It is the wrong default for prose, and lesson
 * content is prose. A `<ul>` an instructor authored has to show its markers, and the reset says it
 * must not — so a bullet list came out as correctly-structured, correctly-indented, invisible text.
 *
 * The fix is not to weaken the reset. Turning markers back on globally would put bullets down the
 * side of every menu and card list in the product. It is to restate `list-style-type` inside the
 * containers that hold authored content, which is exactly what this function emits.
 *
 * <h2>Why it is shared</h2>
 * Two surfaces draw the same document — the instructor's editing surface and the student's
 * renderer — and they have separate stylesheets because they style separate chrome. List geometry
 * is not chrome: a marker that appears while authoring and not when published, or an indent that
 * differs between the two, is the same class of bug as this one. Both sheets call this, so the two
 * cannot drift.
 *
 * @param scope a selector for the container holding authored content — `.mrc` for the renderer,
 *              `.mrce-surface` for the editor. Every rule is nested under it, so nothing here
 *              reaches a list outside lesson content.
 */
export function richListStyles(scope: string): string {
  return `
  ${scope} ul,
  ${scope} ol {
    /*
      The marker, restated against the global reset. Without these two declarations the elements
      below are still semantically lists — screen readers announce them, copy/paste keeps them —
      but a sighted reader sees indented paragraphs.
    */
    list-style-position: outside;
    /*
      Logical, so the markers sit on the reading side: the right in Arabic, the left in English.
      A padding-left would put Arabic bullets on the far side of their own text.
    */
    padding-inline-start: 26px;
  }

  ${scope} ul { list-style-type: disc; }
  ${scope} ol { list-style-type: decimal; }

  /*
    Depth, for the editor. Manara's stored document has no nested lists, but TipTap binds Tab to
    "sink list item", so an instructor can nest while writing and has to be able to see what they
    are doing. The renderer never matches these — it has nothing to match — and they cost nothing.
  */
  ${scope} ul ul { list-style-type: circle; }
  ${scope} ul ul ul { list-style-type: square; }
  ${scope} ol ol { list-style-type: lower-alpha; }
  ${scope} ol ol ol { list-style-type: lower-roman; }

  ${scope} li {
    /*
      Stated rather than relied on. display:list-item is what draws the marker at all, and a reset
      that set list items to block — a common one — would take the bullets away again with no other
      visible effect, which is how this defect stays hidden.
    */
    display: list-item;
    /* The gap between a marker and its text. */
    padding-inline-start: 4px;
    /* Enough that items read as separate points rather than as one wrapped sentence. */
    margin-bottom: 10px;
  }

  ${scope} li:last-child {
    margin-bottom: 0;
  }

  /*
    ProseMirror wraps each list item's content in a paragraph. It carries no margin of its own, so
    an item is one block whether it came from the editor or from the renderer, which draws the
    item's text directly.
  */
  ${scope} li > p {
    margin: 0;
  }

  /* A nested list belongs to the item above it, not to the gap after it. */
  ${scope} li > ul,
  ${scope} li > ol {
    margin-top: 10px;
    margin-bottom: 0;
  }
`;
}

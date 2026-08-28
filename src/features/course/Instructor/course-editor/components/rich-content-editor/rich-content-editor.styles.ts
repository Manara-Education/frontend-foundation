/**
 * The editing surface's own stylesheet.
 *
 * Scoped under `.mrce`, and separate from the student renderer's sheet on purpose. This one styles
 * the *chrome* — the toolbar, the frame, the focus ring, the selected-node outline — none of which
 * a learner ever sees. The content inside the surface is styled by the same token values the
 * renderer uses, applied by the schema's `renderHTML`, so what an instructor sees while typing
 * matches what is published.
 */
export const RICH_EDITOR_STYLES = `
  .mrce {
    border-radius: 13px;
    border: 1.5px solid rgba(78,91,146,0.16);
    background: #FFFFFF;
    overflow: hidden;
    transition: border-color 0.18s, box-shadow 0.18s;
  }

  .mrce.mrce-invalid {
    border-color: #D4183D;
  }

  .mrce-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    padding: 8px;
    background: #FAFBFD;
    border-bottom: 1.5px solid rgba(78,91,146,0.12);
  }

  .mrce-group {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .mrce-sep {
    width: 1px;
    align-self: stretch;
    margin: 2px 4px;
    background: rgba(78,91,146,0.16);
  }

  .mrce-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    /* 32px controls with a comfortable hit area; the toolbar is dense by necessity. */
    min-width: 32px;
    height: 32px;
    padding: 0 7px;
    border: 1px solid transparent;
    border-radius: 8px;
    background: transparent;
    color: #4B5563;
    font-family: 'Cairo', sans-serif;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .mrce-btn:hover:not(:disabled) {
    background: rgba(78,91,146,0.08);
  }

  .mrce-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .mrce-btn[aria-pressed="true"] {
    background: rgba(78,91,146,0.14);
    color: #4E5B92;
  }

  .mrce-btn:focus-visible,
  .mrce-swatch:focus-visible,
  .mrce-select:focus-visible {
    outline: 2px solid #4E5B92;
    outline-offset: 1px;
  }

  .mrce-select {
    height: 32px;
    padding: 0 6px;
    border: 1px solid rgba(78,91,146,0.18);
    border-radius: 8px;
    background: #FFFFFF;
    color: #4B5563;
    font-family: 'Cairo', sans-serif;
    font-size: 12px;
    cursor: pointer;
  }

  .mrce-swatch {
    width: 22px;
    height: 22px;
    border-radius: 999px;
    border: 1.5px solid rgba(0,0,0,0.12);
    cursor: pointer;
    padding: 0;
  }

  .mrce-swatch[aria-pressed="true"] {
    box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #4E5B92;
  }

  /* ── The editing surface ─────────────────────────────────────────────── */

  .mrce-surface {
    padding: 16px 18px;
    min-height: 220px;
    max-height: 520px;
    overflow-y: auto;
    font-family: 'Cairo', sans-serif;
    /*
      The reading sizes, matching TEXT_SIZE_VALUES.NORMAL and the student stylesheet. This surface
      is what an author writes into and the only preview most of them will look at, so a size that
      drifts from the student renderer's turns the editor into a rough approximation of the lesson
      rather than a view of it.
    */
    font-size: 17px;
    line-height: 1.9;
    color: #1F2937;
  }

  .mrce-surface .ProseMirror {
    outline: none;
    /* Same containment as the student renderer: a pasted URL cannot widen the editor. */
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .mrce-surface .ProseMirror > * {
    margin: 0 0 16px 0;
  }

  .mrce-surface .ProseMirror > *:last-child {
    margin-bottom: 0;
  }

  /* The three levels of HEADING_SIZE_VALUES, for the same reason as the body size above. */
  .mrce-surface h1 { font-size: 30px; font-weight: 700; line-height: 1.4; color: #1E2340; }
  .mrce-surface h2 { font-size: 24px; font-weight: 700; line-height: 1.4; color: #1E2340; }
  .mrce-surface h3 { font-size: 20px; font-weight: 700; line-height: 1.4; color: #1E2340; }

  .mrce-surface ul,
  .mrce-surface ol {
    padding-inline-start: 24px;
  }

  .mrce-surface blockquote {
    border-inline-start: 4px solid rgba(78,91,146,0.4);
    padding-inline-start: 14px;
    color: #4B5563;
  }

  .mrce-surface hr {
    border: none;
    border-top: 1px solid #ECECEC;
  }

  .mrce-surface a {
    color: #4E5B92;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  /*
    The empty-document placeholder. Drawn from a data attribute rather than by inserting text, so
    the document really is empty and the "this lesson has no content" check stays honest.
  */
  .mrce-surface .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: inline-start;
    height: 0;
    color: #9BA3C4;
    pointer-events: none;
  }

  /* ── The call-to-action node ─────────────────────────────────────────── */

  .mrce-cta-node {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .mrce-cta-preview {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 8px 20px;
    border-radius: 12px;
    font-family: 'Cairo', sans-serif;
    font-size: 14px;
    font-weight: 600;
    max-width: 100%;
  }

  .mrce-cta-actions {
    display: flex;
    gap: 4px;
  }

  .mrce-cta-node.is-selected .mrce-cta-preview {
    box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #4E5B92;
  }

  /* ── The link and button forms ───────────────────────────────────────── */

  .mrce-panel {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 8px;
    padding: 10px 12px;
    background: #F6F7FC;
    border-bottom: 1.5px solid rgba(78,91,146,0.12);
  }

  .mrce-field {
    display: flex;
    flex-direction: column;
    gap: 3px;
    flex: 1 1 180px;
    min-width: 0;
  }

  .mrce-label {
    font-family: 'Cairo', sans-serif;
    font-size: 11px;
    color: #6B7280;
  }

  .mrce-input {
    height: 34px;
    padding: 0 10px;
    border: 1.5px solid rgba(78,91,146,0.16);
    border-radius: 9px;
    background: #FFFFFF;
    font-family: 'Cairo', sans-serif;
    font-size: 13px;
    color: #1E2340;
    outline: none;
    min-width: 0;
  }

  .mrce-input:focus {
    border-color: #4E5B92;
  }

  .mrce-input[aria-invalid="true"] {
    border-color: #D4183D;
  }

  .mrce-error {
    width: 100%;
    font-family: 'Cairo', sans-serif;
    font-size: 11.5px;
    color: #D4183D;
  }

  @media (max-width: 640px) {
    .mrce-field {
      flex-basis: 100%;
    }
  }
`;

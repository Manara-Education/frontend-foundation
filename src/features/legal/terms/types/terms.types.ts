/**
 * The two halves of "the terms and conditions", kept deliberately apart.
 *
 * `CurrentTermsResponse` / `CurrentTerms` are the *pointer*: which version is in force and
 * from when. That answer belongs to the backend and is fetched on every visit.
 *
 * `TermsDocument` is the *text*, which ships with the frontend and is addressed by version
 * id. Neither shape carries a notion of "current" — joining the two is the page's job, and
 * a version the frontend has no text for is an explicit failure rather than a fallback.
 */

/** Raw payload of `GET /api/v1/terms/current`. */
export interface CurrentTermsResponse {
  /** Opaque version id. Never parsed, compared or ordered by the client. */
  version: string;
  /** ISO-8601 date the version took effect. */
  effectiveDate: string;
}

/** The pointer, as the UI needs it. */
export interface CurrentTerms {
  version: string;
  /** Kept in ISO form for `<time dateTime>`, so the machine-readable date is the source's. */
  effectiveDate: string;
  /** The same date written out for an Arabic reader. */
  effectiveDateLabel: string;
}

/** A run of prose inside a section. */
export interface TermsParagraphBlock {
  kind: "paragraph";
  text: string;
}

/** A bulleted enumeration inside a section. */
export interface TermsListBlock {
  kind: "list";
  items: string[];
}

export type TermsBlock = TermsParagraphBlock | TermsListBlock;

export interface TermsSection {
  /** Stable anchor, so the section navigation and deep links keep working across releases. */
  id: string;
  /** The clause number exactly as the approved text numbers it. */
  number: string;
  title: string;
  blocks: TermsBlock[];
}

/** One complete, immutable version of the terms. */
export interface TermsDocument {
  version: string;
  title: string;
  /** The opening paragraph, which sits above the numbered clauses. */
  preamble: string;
  sections: TermsSection[];
}

/**
 * What the terms page has to render.
 *
 * `unavailable` is not an error the user caused: it is the frontend admitting the backend
 * named a version it has no text for — a deploy-order gap. Showing an older version instead
 * would be showing the wrong contract, so it is called out rather than papered over.
 */
export type TermsViewState =
  | { status: "loading" }
  | { status: "ready"; current: CurrentTerms; document: TermsDocument }
  | { status: "unavailable"; current: CurrentTerms }
  | { status: "error" };

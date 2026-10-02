/**
 * The privacy policy, as the backend publishes it.
 *
 * Unlike the terms, the text itself comes from the server: `GET /api/v1/privacy-policy/current`
 * returns the version in force, its metadata and every section. This build carries no copy of
 * the policy, so there is nothing local that could be shown in its place when the request fails.
 */

/** Raw block in the payload. Every string is plain text; nothing is HTML or Markdown. */
export interface PrivacyPolicyBlockResponse {
  type: string;
  text?: string;
  items?: string[];
  label?: string;
  address?: string;
}

export interface PrivacyPolicySectionResponse {
  id: string;
  number: string;
  title: string;
  blocks: PrivacyPolicyBlockResponse[];
}

/** Raw payload of `GET /api/v1/privacy-policy/current`. */
export interface PrivacyPolicyResponse {
  policyId: string;
  language: string;
  /** Opaque version id. Displayed, never parsed or compared. */
  version: string;
  /** ISO-8601 date the version took effect. */
  effectiveDate: string;
  /** The version this one replaced, when there was one. */
  supersedes?: string;
  title: string;
  summary: string;
  operator: { name: string; owner?: string; privacyEmail: string };
  sections: PrivacyPolicySectionResponse[];
}

export type PrivacyPolicyBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "email"; label: string; address: string };

export interface PrivacyPolicySection {
  /** Stable anchor from the server, so `/privacy#retention` keeps working across versions. */
  id: string;
  number: string;
  title: string;
  blocks: PrivacyPolicyBlock[];
}

/** The published policy, as the page renders it. */
export interface PrivacyPolicy {
  version: string;
  language: string;
  effectiveDate: string;
  effectiveDateLabel: string;
  title: string;
  summary: string;
  operatorName: string;
  privacyEmail: string;
  sections: PrivacyPolicySection[];
}

/**
 * What the privacy page shows.
 *
 * `not-published` is the server saying, with `PRIVACY_POLICY_NOT_PUBLISHED`, that no policy is in
 * force yet. `error` is anything else — offline, a 5xx, a payload this build cannot read. Neither
 * shows any policy text.
 */
export type PrivacyPolicyViewState =
  | { status: "loading" }
  | { status: "ready"; policy: PrivacyPolicy }
  | { status: "not-published" }
  | { status: "error" };

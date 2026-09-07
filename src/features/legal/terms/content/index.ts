import type { TermsDocument } from "../types/terms.types";
import { TERMS_1_0 } from "./terms-1-0.content";

/**
 * Every version of the terms this build can render, addressed by the backend's version id.
 *
 * There is deliberately no "current" here, and no ordering. Which version is in force is a
 * fact about the *server*, and duplicating that answer in the client is how a user ends up
 * reading one contract and consenting to another. This registry only answers "do you have
 * the text for X".
 *
 * Superseded versions stay. Recorded consent points at an exact version id, so removing an
 * entry would make an existing acceptance unreadable.
 */
export const TERMS_REGISTRY: Readonly<Record<string, TermsDocument>> = {
  [TERMS_1_0.version]: TERMS_1_0,
};

/** The text for a version id, or `null` when this build has never heard of it. */
export function findTermsDocument(version: string): TermsDocument | null {
  return TERMS_REGISTRY[version] ?? null;
}

export { TERMS_1_0 };

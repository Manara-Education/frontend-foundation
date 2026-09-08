import { unwrap } from "@/shared/api";
import { getCurrentTermsRequest } from "../api/terms.api";
import { toCurrentTerms } from "../mappers/terms.mapper";
import type { CurrentTerms } from "../types/terms.types";

/**
 * Asks the server which version of the terms is in force.
 *
 * `unwrap` rather than `data!`: an empty envelope here would otherwise become `undefined`
 * masquerading as a version id, and that id is what a consent record is keyed on.
 */
export async function getCurrentTerms(): Promise<CurrentTerms> {
  return toCurrentTerms(unwrap(await getCurrentTermsRequest()));
}

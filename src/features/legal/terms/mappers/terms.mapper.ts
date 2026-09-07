import { formatEffectiveDate } from "../formatters/terms.formatter";
import type { CurrentTerms, CurrentTermsResponse } from "../types/terms.types";

/** The current-version pointer, in the shape the UI reads. */
export function toCurrentTerms(dto: CurrentTermsResponse): CurrentTerms {
  return {
    version: dto.version,
    effectiveDate: dto.effectiveDate,
    effectiveDateLabel: formatEffectiveDate(dto.effectiveDate),
  };
}

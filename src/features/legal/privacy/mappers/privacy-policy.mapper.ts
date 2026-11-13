import { formatEffectiveDate } from "@/features/legal/terms/formatters/terms.formatter";
import type {
  PrivacyPolicy,
  PrivacyPolicyBlock,
  PrivacyPolicyBlockResponse,
  PrivacyPolicyResponse,
} from "../types/privacy-policy.types";

/** A payload this build cannot render faithfully. Surfaces as the page's error state. */
export class UnreadablePrivacyPolicyError extends Error {
  constructor(reason: string) {
    super(`Unreadable privacy policy: ${reason}`);
    this.name = "UnreadablePrivacyPolicyError";
  }
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function toBlock(block: PrivacyPolicyBlockResponse): PrivacyPolicyBlock {
  switch (block.type) {
    case "paragraph":
      if (!isText(block.text)) throw new UnreadablePrivacyPolicyError("empty paragraph");
      return { kind: "paragraph", text: block.text };
    case "list":
      if (!Array.isArray(block.items) || block.items.length === 0 || !block.items.every(isText)) {
        throw new UnreadablePrivacyPolicyError("empty list");
      }
      return { kind: "list", items: block.items };
    case "email":
      if (!isText(block.label) || !isText(block.address)) throw new UnreadablePrivacyPolicyError("incomplete email");
      return { kind: "email", label: block.label, address: block.address };
    default:
      // Dropping a block of a legal text would show a different document from the published
      // one. A type this build does not know is a failure, not something to skip.
      throw new UnreadablePrivacyPolicyError(`unknown block type "${block.type}"`);
  }
}

export function toPrivacyPolicy(dto: PrivacyPolicyResponse): PrivacyPolicy {
  if (!isText(dto.version) || !isText(dto.effectiveDate) || !isText(dto.title) || !Array.isArray(dto.sections)) {
    throw new UnreadablePrivacyPolicyError("missing metadata");
  }

  return {
    version: dto.version,
    language: dto.language,
    effectiveDate: dto.effectiveDate,
    effectiveDateLabel: formatEffectiveDate(dto.effectiveDate),
    title: dto.title,
    summary: dto.summary,
    operatorName: dto.operator?.name ?? "",
    privacyEmail: dto.operator?.privacyEmail ?? "",
    sections: dto.sections.map((section) => ({
      id: section.id,
      number: section.number,
      title: section.title,
      blocks: section.blocks.map(toBlock),
    })),
  };
}

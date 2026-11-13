import { unwrap } from "@/shared/api";
import { getCurrentPrivacyPolicyRequest } from "../api/privacy-policy.api";
import { toPrivacyPolicy } from "../mappers/privacy-policy.mapper";
import type { PrivacyPolicy } from "../types/privacy-policy.types";

/** Asks the server for the published privacy policy. */
export async function getCurrentPrivacyPolicy(): Promise<PrivacyPolicy> {
  return toPrivacyPolicy(unwrap(await getCurrentPrivacyPolicyRequest()));
}

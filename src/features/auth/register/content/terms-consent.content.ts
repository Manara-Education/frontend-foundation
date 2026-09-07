/**
 * The wording of the consent, in one place.
 *
 * These strings are part of what a user is agreeing to and what they are told when the
 * agreement is refused, so they are named constants rather than literals scattered across a
 * component and a hook — the label the checkbox shows and the error the submit handler
 * raises must never be able to drift apart from each other or from the approved text.
 */

/** The label reads `قرأت الشروط والأحكام وأوافق عليها`, with the middle part a link. */
export const TERMS_CONSENT_LABEL_PREFIX = "قرأت ";
export const TERMS_CONSENT_LINK_TEXT = "الشروط والأحكام";
export const TERMS_CONSENT_LABEL_SUFFIX = " وأوافق عليها";

/** Shown beside the checkbox when a submission was attempted without consent. */
export const TERMS_CONSENT_REQUIRED_ERROR =
  "يجب الموافقة على الشروط والأحكام لإتمام إنشاء الحساب.";

/**
 * Shown when the server rejects the consent because the version has moved on. The account
 * was not created, and the acceptance does not carry over — the user re-reads and re-agrees.
 */
export const TERMS_VERSION_OUTDATED_MESSAGE =
  "تم تحديث الشروط والأحكام بعد فتحك لهذه الصفحة، ولم يتم إنشاء الحساب. يُرجى قراءة النسخة الحالية والموافقة عليها ثم إعادة المحاولة.";

export const TERMS_VERSION_OUTDATED_LINK_TEXT = "اقرأ النسخة الحالية من الشروط والأحكام";

/** Shown when the current version could not be established, so no consent can be recorded. */
export const TERMS_UNAVAILABLE_MESSAGE =
  "تعذّر تحميل النسخة الحالية من الشروط والأحكام، ولا يمكن إنشاء الحساب قبل معرفتها.";

export const TERMS_RETRY_LABEL = "إعادة المحاولة";

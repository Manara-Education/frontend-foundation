/**
 * Turning an approved contact into something a page can link to.
 *
 * Both helpers are strict on purpose. A value reaches them only after an owner approved it
 * for publication, and the one thing worse than a missing support link is one that opens the
 * wrong mailbox or dials the wrong number — so anything that is not unmistakably a single
 * mailbox or a single Egyptian number is refused rather than repaired.
 */

/** One mailbox: no display name, no second address, no query string, no scheme. */
const MAILBOX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;

export function mailtoHref(email: string): string | null {
  const value = email.trim();
  return MAILBOX.test(value) ? `mailto:${value}` : null;
}

/**
 * Governorate landlines outside Cairo, Giza and Alexandria: a two-digit area code and seven
 * digits (for example 040 Tanta, 050 Mansoura, 082 Beni Suef, 095 Luxor).
 */
const LANDLINE_TWO_DIGIT_AREA = /^(1[35]|4[05-8]|5[057]|6[24-9]|8[2468]|9[2-7])\d{7}$/;

export interface EgyptianPhone {
  /** What `tel:` dials. International (`+20…`) except for a national short hotline. */
  dial: string;
  /** How it is written on the page. Render it left-to-right inside Arabic text. */
  display: string;
}

/**
 * An Egyptian number in any of the ways people write one — `010 1234 5678`, `+20 10 1234 5678`,
 * `0020 2 1234 5678`, `19xxx` — or `null` if it is not one.
 *
 * Accepted: mobile numbers (`01[0125]` + 8 digits), Cairo and Giza landlines (`02` + 8 digits),
 * Alexandria (`03` + 7 digits), other governorates' landlines (a two-digit area code + 7 digits),
 * and five-digit national hotlines (`15xxx`, `16xxx`, `19xxx`), which have no international form.
 */
export function egyptianPhone(raw: string): EgyptianPhone | null {
  const compact = raw.trim().replace(/[\s().-]/g, "");
  if (!/^\+?\d+$/.test(compact)) return null;

  if (/^1[569]\d{3}$/.test(compact)) {
    return { dial: compact, display: compact };
  }

  let national: string;
  if (compact.startsWith("+20")) national = `0${compact.slice(3)}`;
  else if (compact.startsWith("0020")) national = `0${compact.slice(4)}`;
  else if (compact.startsWith("0")) national = compact;
  else return null;

  const digits = national.slice(1);
  if (/^1[0125]\d{8}$/.test(digits)) {
    return { dial: `+20${digits}`, display: `+20 ${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}` };
  }
  // Cairo subscriber numbers begin with 2, Giza's with 3.
  if (/^2[23]\d{7}$/.test(digits)) {
    return { dial: `+20${digits}`, display: `+20 2 ${digits.slice(1, 5)} ${digits.slice(5)}` };
  }
  if (/^3\d{7}$/.test(digits)) {
    return { dial: `+20${digits}`, display: `+20 3 ${digits.slice(1, 4)} ${digits.slice(4)}` };
  }
  if (LANDLINE_TWO_DIGIT_AREA.test(digits)) {
    return { dial: `+20${digits}`, display: `+20 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}` };
  }
  return null;
}

export function telHref(phone: string): string | null {
  const parsed = egyptianPhone(phone);
  return parsed ? `tel:${parsed.dial}` : null;
}

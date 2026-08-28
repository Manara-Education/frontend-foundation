import type { RichAlignment } from "./rich-content.types";

/**
 * Which addresses lesson content may point at, restated for the editor.
 *
 * The authority is `LinkUrlPolicy` on the server, which every document passes through on write.
 * This exists so an instructor is told about a bad link while they are typing it rather than when
 * they press save — and so the editor never offers to create one the server would reject.
 *
 * It is **not** the security boundary and must never be treated as one. A client check protects the
 * person using the client; it protects nothing against someone who posts at the API directly, which
 * is why the same rule exists on the server and why the server's copy is the one that decides what
 * gets stored.
 */

/** The only schemes a lesson may link to. Mirrors the server's allowlist exactly. */
const ALLOWED_SCHEMES = ["http:", "https:", "mailto:", "tel:"] as const;

const MAX_LENGTH = 2048;

/**
 * Characters that let a string read as one thing to a validator and another to a browser: C0 and
 * C1 controls, zero-width joiners, and the bidi overrides.
 *
 * The bidi ones matter here more than they would in most codebases. Manara's content is routinely
 * mixed Arabic and English, so a direction-override character inside a URL is not obviously out of
 * place the way it would be in an English-only product.
 */
const HIDDEN_CHARACTERS =
  /[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF\u202A-\u202E\u2066-\u2069]/g;

export type LinkRejection =
  | "EMPTY"
  | "MALFORMED"
  | "TOO_LONG"
  | "SCHEME_MISSING"
  | "SCHEME_UNSUPPORTED";

export type LinkResolution = { ok: true; url: string } | { ok: false; reason: LinkRejection };

/**
 * Checks a link the way the server will.
 *
 * Note what this deliberately does not do: it does not rewrite the address. `new URL()` normalises
 * as it parses — adding a trailing slash, lower-casing the host, percent-encoding — and returning
 * that would mean the link an instructor sees after saving is not the one they typed. The parse is
 * used to answer questions; the original string is what travels.
 */
export function resolveLinkUrl(rawUrl: string | null | undefined): LinkResolution {
  if (!rawUrl) return { ok: false, reason: "EMPTY" };

  const url = rawUrl.replace(HIDDEN_CHARACTERS, "").trim();
  if (!url) return { ok: false, reason: "EMPTY" };
  if (url.length > MAX_LENGTH) return { ok: false, reason: "TOO_LONG" };

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // No scheme at all is the overwhelmingly common case — someone typed "example.com" — and it
    // gets its own answer, because "add https://" is a fix and "that is not a web address" is not.
    return { ok: false, reason: /^[a-z][a-z0-9+.-]*:/i.test(url) ? "MALFORMED" : "SCHEME_MISSING" };
  }

  if (!ALLOWED_SCHEMES.includes(parsed.protocol as (typeof ALLOWED_SCHEMES)[number])) {
    return { ok: false, reason: "SCHEME_UNSUPPORTED" };
  }
  if ((parsed.protocol === "http:" || parsed.protocol === "https:") && !parsed.hostname) {
    return { ok: false, reason: "MALFORMED" };
  }

  return { ok: true, url };
}

/** Whether this address may be stored. */
export function isSafeLinkUrl(rawUrl: string | null | undefined): boolean {
  return resolveLinkUrl(rawUrl).ok;
}

/**
 * The address to hand an anchor, or `undefined` for one that should not be followed.
 *
 * The renderer's last line of defence. A document reaching a renderer has already been sanitized by
 * the server, so this should never fire — but "should never" is not a reason to hand an unchecked
 * string to `href`, and the cost of checking is a string comparison. A rejected link still renders
 * its text; it simply is not clickable.
 */
export function safeHref(rawUrl: string | null | undefined): string | undefined {
  const resolution = resolveLinkUrl(rawUrl);
  return resolution.ok ? resolution.url : undefined;
}

/**
 * The CSS value for a direction-neutral alignment token.
 *
 * `start` and `end` are the logical CSS keywords, so the browser resolves them against the
 * element's own direction: the same document reads correctly in an Arabic lesson and an English one
 * with no branch anywhere in Manara.
 */
export function alignmentToCss(align: RichAlignment): "start" | "center" | "end" {
  switch (align) {
    case "CENTER":
      return "center";
    case "END":
      return "end";
    default:
      return "start";
  }
}

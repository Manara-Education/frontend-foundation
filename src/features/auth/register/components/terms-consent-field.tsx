import type { MouseEvent } from "react";
import { paths } from "@/shared/navigation";
import {
  TERMS_CONSENT_LABEL_PREFIX,
  TERMS_CONSENT_LABEL_SUFFIX,
  TERMS_CONSENT_LINK_TEXT,
  TERMS_RETRY_LABEL,
  TERMS_UNAVAILABLE_MESSAGE,
  TERMS_VERSION_OUTDATED_LINK_TEXT,
  TERMS_VERSION_OUTDATED_MESSAGE,
} from "../content/terms-consent.content";

const FONT = "'Cairo', sans-serif";
const PRIMARY = "#4E5B92";
const DANGER = "#D4183D";

const LABEL_ID = "terms-consent-label";
const ERROR_ID = "terms-consent-error";
const OUTDATED_ID = "terms-consent-outdated";

interface TermsConsentFieldProps {
  accepted: boolean;
  onAcceptedChange: (accepted: boolean) => void;
  /** The inline "you must agree" message, present only after a refused submission. */
  error?: string;
  /** The server refused the last attempt because the terms moved on under the user. */
  outdated: boolean;
  /** The current version could not be fetched, so no consent can be recorded at all. */
  loadFailed: boolean;
  onRetryTerms: () => void;
}

/**
 * The mandatory terms consent.
 *
 * The checkbox is **not** wrapped in a `<label htmlFor>`, and that is the whole point of the
 * markup here. With an implicit or `for`-based label, clicking the "الشروط والأحكام" link
 * inside the label text also toggles the checkbox — so a user who opens the terms to read
 * them silently ticks (or unticks) the box they had not decided about yet.
 *
 * Instead the text lives in a plain `<span id>` and the input names it through
 * `aria-labelledby`, which gives the same accessible name with none of the click behaviour.
 * The anchor stops propagation as well, so the association cannot be reintroduced by
 * wrapping this component in a clickable row later.
 *
 * The link opens in a new tab: the terms are long, and sending the visitor away from a
 * half-filled sign-up form would throw away everything they had typed.
 */
export function TermsConsentField({
  accepted,
  onAcceptedChange,
  error,
  outdated,
  loadFailed,
  onRetryTerms,
}: TermsConsentFieldProps) {
  const describedBy = [error ? ERROR_ID : null, outdated ? OUTDATED_ID : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-2">
      {outdated && (
        <div
          id={OUTDATED_ID}
          role="alert"
          className="rs-longform rounded-xl px-4 py-3 flex flex-col gap-2"
          style={{
            background: "rgba(245,166,35,0.08)",
            border: "1px solid rgba(245,166,35,0.28)",
            fontFamily: FONT,
            fontSize: 14,
            color: "#8A5300",
            lineHeight: 1.9,
          }}
        >
          <span>{TERMS_VERSION_OUTDATED_MESSAGE}</span>
          <a
            href={paths.terms}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
            style={{ fontFamily: FONT, fontWeight: 700, color: PRIMARY, outlineColor: PRIMARY }}
          >
            {TERMS_VERSION_OUTDATED_LINK_TEXT}
          </a>
        </div>
      )}

      {loadFailed && (
        <div
          role="alert"
          className="rs-longform rounded-xl px-4 py-3 flex flex-wrap items-center gap-3"
          style={{
            background: "rgba(212,24,61,0.06)",
            border: "1px solid rgba(212,24,61,0.2)",
            fontFamily: FONT,
            fontSize: 14,
            color: DANGER,
            lineHeight: 1.9,
          }}
        >
          <span>{TERMS_UNAVAILABLE_MESSAGE}</span>
          <button
            type="button"
            onClick={onRetryTerms}
            className="focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 14,
              color: PRIMARY,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              outlineColor: PRIMARY,
            }}
          >
            {TERMS_RETRY_LABEL}
          </button>
        </div>
      )}

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="terms-accepted"
          name="termsAccepted"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
          aria-labelledby={LABEL_ID}
          aria-describedby={describedBy || undefined}
          aria-invalid={error ? true : undefined}
          className="focus-visible:outline-2 focus-visible:outline-offset-2 shrink-0"
          style={{
            inlineSize: 18,
            blockSize: 18,
            marginBlockStart: 3,
            accentColor: PRIMARY,
            outlineColor: PRIMARY,
            cursor: "pointer",
          }}
        />
        {/*
          A `<span>`, never a `<label htmlFor>`: see the note on this component. The input
          borrows this element's text through `aria-labelledby`, so the accessible name is
          the full sentence while a click on the link stays a click on the link.
        */}
        <span
          id={LABEL_ID}
          className="rs-longform"
          style={{
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: 14,
            color: "#2C3156",
            lineHeight: 1.9,
          }}
        >
          {TERMS_CONSENT_LABEL_PREFIX}
          <a
            href={paths.terms}
            target="_blank"
            rel="noopener noreferrer"
            /*
              Belt and braces. There is no label wrapping this anchor today, so nothing would
              toggle on the way up — but if this row is ever made clickable, the link must
              still only ever open the terms.
            */
            onClick={(event: MouseEvent<HTMLAnchorElement>) => event.stopPropagation()}
            className="focus-visible:outline-2 focus-visible:outline-offset-2 rounded"
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              color: PRIMARY,
              textDecoration: "underline",
              textUnderlineOffset: 3,
              outlineColor: PRIMARY,
            }}
          >
            {TERMS_CONSENT_LINK_TEXT}
          </a>
          {TERMS_CONSENT_LABEL_SUFFIX}
        </span>
      </div>

      {error && (
        <p
          id={ERROR_ID}
          role="alert"
          className="rs-longform"
          style={{ fontFamily: FONT, fontWeight: 400, fontSize: 13, color: DANGER, margin: 0 }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

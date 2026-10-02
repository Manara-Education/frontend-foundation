# Public business facts: provenance and inventory

The public site states who operates it, how to reach support, and where its legal documents are.
Those facts live in one place, `src/shared/business/public-business-facts.ts`, and every public
surface reads them from there. This file records where each value came from, what it replaced,
and what is still missing.

- Task: [TECH-2 — Centralize approved public support and business facts](https://app.notion.com/p/3d99027b821c813b8ea8e41cde805cc2)
- Consumers: the landing footer, the landing wordmark and the Terms page header. TECH-3's footer
  refund/support links read the same module.

## Rule

A fact is **approved**, with who approved publishing it, the date, and where that approval is
recorded, or it is **pending**, with what is missing. Pending facts are not rendered anywhere. No
placeholder or "probably right" contact is ever published. A customer who writes to an unmonitored
address about a refund never hears back, and that is worse than seeing no address.

Everything in the module ships to every browser. Internal, staff-only or private contacts must
never be added to it.

## Current values (2026-09-14)

| Fact | Status | Value | Source / approval |
| --- | --- | --- | --- |
| Brand (Arabic / Latin) | In use, not a legal identity | منارة / Manara | Already on every page, and the document `<title>` (the test asserts they match) |
| Registered or trading name | **Pending** | — | Owner input required |
| Customer-support email | **Pending** | — | Owner input required. See the conflicts below. |
| Egyptian support phone | **Pending** | — | Owner input required |
| Terms and Conditions link | Published | `/terms` | Existing public route; versioned Terms 1.0 |
| Cancellation and refund link | Published | `/terms#section-6` | Section 6 "الإلغاء والاسترداد" of the immutable Terms 1.0; the test ties the link to that section's title |
| Privacy Policy link | **Pending** | `/privacy` once published | The text and version now come from the backend (`GET /api/v1/privacy-policy/current`, backend `docs/api/PRIVACY_POLICY_API.md`). Version 1.0 is written but held as a backend *candidate* until its blockers clear: no MX for `manara-edu.com`, so `privecy@manara-edu.com` cannot receive mail; 7-day backups not yet on the host; no deletion procedure. While pending, `privacyPolicyHref()` returns `null` and no page links to `/privacy`. |

## What is needed to finish

The smallest input that completes this task is one owner-approved record containing:

1. **The registered or trading name** to show as the service operator.
2. **A monitored customer-support mailbox**, with the address, confirmation that it is monitored, and
   who owns it.
3. **An Egyptian support phone number**: mobile, landline or a 5-digit hotline, in any common
   format.
4. For each item, **who approved it and on what date**, and **where that approval is recorded**
   (Notion page, signed message or ticket).

Enter each value as `{ status: "approved", value, approval: { approvedBy, approvedOn, evidence } }`.
The tests then check that it is well-formed: a single mailbox, a real Egyptian number, no
placeholder domains, and approval details present. The footer (TECH-3) renders it with correct
`mailto:` and `tel:` links, without further code changes.

No message was sent and no call was placed to test any address or number. Whether a contact is
monitored is for the owner to confirm, not for engineering to probe.

## Inventory of public literals

Searched in `src/`, `index.html` and `public/` for business names, email addresses, domains, phone
numbers, `mailto:`/`tel:` links and legal-page links.

| Surface | Literal found | Kind | Outcome |
| --- | --- | --- | --- |
| Landing footer | `© <year> Manara.` | Brand | Now read from `brand.latin` |
| Landing footer | Terms link `/terms` | Legal link | Now read from `legalLinks.terms` |
| Landing wordmark (header and footer) | `منارة` / `MANARA` | Brand | Now read from `brand` |
| Terms page header | `aria-label="العودة إلى منارة"` | Brand | Now read from `brand.arabic` |
| `index.html` | `<title>منارة</title>` | Brand | Static HTML can't import the module, so it stays as is. A test asserts it equals `brand.arabic`. |
| Login, register and forgot-password email fields | `placeholder="example@manara.com"` | **Domain not known to be Manara's** | Replaced by `name@example.com` (RFC 2606 reserved). A sign-in form must not suggest an address on a domain nobody has confirmed belongs to Manara. |
| Terms 1.0, §§3, 5, 7, 8, 11 | "وسائل التواصل المنشورة بالموقع" and similar | Refers generically to the published channels | No conflict. The immutable text names no channel, so approved facts can be published without a new Terms version. |
| Terms 1.0, §10 | Refers to "سياسة الخصوصية المنشورة على الموقع" | Legal reference | Still a gap until Privacy Policy 1.0 is published on the backend. The `/privacy` route exists and renders the backend's published version, or says that none is published yet. |
| Rich-content editor | `mailto:`/`tel:` in the allowed link schemes | Editor capability, not a contact | Out of scope |

### Conflicting support domains outside the public site

These are not rendered on any public page, but they contradict each other and are **not approved**
channels. Align them with the approved mailbox once it exists (backend follow-up, not in this
frontend task):

| Where | Value | Purpose |
| --- | --- | --- |
| Backend `application.properties` `MAIL_REPLY_TO` default | `support@manara-edu.com` | Reply-To on automated email |
| Backend `application.properties` `MAIL_FROM` default | `no-reply@manara-edu.com` | Sender of automated email |
| Backend `OpenApiConfig` | `support@manara.app` | API documentation contact. Swagger is disabled in production. |

## Changing a value

Change it only in `public-business-facts.ts`, with the approval record, in a pull request that
links the approval evidence. The immutable, versioned Terms text is never edited to match a new
contact. It refers to the published channels generically, so it stays correct.

## Publishing the privacy policy

Publication is two releases, backend first:

1. **Backend.** Mark the version `PUBLISHED` in `PrivacyPolicyCatalog`, with its effective date and
   content hash (see backend `docs/api/PRIVACY_POLICY_API.md`), then tag and release.
2. **Frontend.** Set `legalLinks.privacyPolicy` to
   `{ status: "approved", value: paths.privacy, approval: { approvedBy, approvedOn, evidence } }`.
   The evidence is the owner's publication approval and the backend release that published the
   version. Then tag and release. The footer and the contact form link to it through
   `privacyPolicyHref()`, with no other change.

The page works without step 2. `/privacy` is a public route and renders whatever the backend has
published. Step 2 only decides whether other pages link to it.

Operator facts the owner supplied on 2026-10-02 appear in the backend policy text, not in this
module: operator name "Manara EDU", owner Hamed Mohamed, privacy contact `privecy@manara-edu.com`
(the owner's spelling, kept on purpose). `legalName` here stays pending. It is the registered or
trading name for the footer, and nothing establishes that "Manara EDU" is a registered name.

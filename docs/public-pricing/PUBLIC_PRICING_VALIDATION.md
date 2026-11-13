# Public pricing edge-state validation (TECH-12)

- Task: [TECH-12 — Add public-pricing edge-state validation](https://app.notion.com/p/3d99027b821c81b5a2b7c7545a212c07)
- Surfaces: the landing courses section (TECH-10) and the public course page's price panel (TECH-11), both fed by the TECH-9 client.
- Revisions under test:
  - Frontend UI `a70f5ae` (TECH-10), stacked on TECH-11 `a865ff2` and TECH-9 `7ebd744`.
  - The matrix test is added by this change.
  - Backend-foundation `c524ff9` (TECH-6, 7 and 8).
- Date: 2026-09-14.

## Method

1. **Component matrix** (`src/features/public-courses/public-pricing-matrix.test.tsx`).
   - Each of 24 raw offers, exactly as the backend could send them, goes through the shipped mapper and is rendered on **both** surfaces.
   - Each row checks the visible badge, the caption, the screen-reader sentence, the tone, and whether the course page offers an action. It then checks that the two surfaces are **identical**.
   - Expectations are literal Arabic strings, not the formatter's output. A regression in the shared formatter therefore cannot make both surfaces agree on a wrong answer.
2. **Browser matrix against the real backend.**
   - A production build was served by `vite preview` in headless Chrome 152, at 1440×900 and 390×844 @2x.
   - Every `/api` call was forwarded to a local backend-foundation `c524ff9` with a synthetic catalogue.
   - Edge states that live data cannot produce were injected over CDP by replacing one answer: a contract-invalid zero price, 503, 429, network loss, and malformed or empty lists.
3. **Negative control.** The mapper was temporarily changed to accept a zero amount, and the matrix run again.

## Component matrix — landing card and course page

Each row passed on both surfaces with identical output: 25 tests, which are the 24 rows plus a coverage check. **UNAVAILABLE** means badge "السعر غير متاح", no caption, screen-reader text "سعر هذه الدورة غير متاح حاليًا", and **no action**.

| # | Scenario (raw offer) | Expected on both surfaces | Verdict |
| --- | --- | --- | --- |
| 1 | FREE | "مجانية"; actions offered | Pass |
| 2 | PURCHASE 450.00 | "٤٥٠ ج.م" · "شراء مرة واحدة"; spoken "السعر ٤٥٠ جنيه مصري، شراء مرة واحدة" | Pass |
| 3 | PURCHASE 99.50 | "٩٩٫٥٠ ج.م" · "شراء مرة واحدة" | Pass |
| 4 | SUBSCRIPTION, one active plan | "١٢٠ ج.م" · "اشتراك لمدة ١ شهر" | Pass |
| 5 | SUBSCRIPTION, two active plans | "يبدأ من ٤٠ ج.م" · "اشتراك بعدة خطط" | Pass |
| 6 | SUBSCRIPTION, an invalid (zero) plan beside a valid one | Only the valid plan: "١٢٠ ج.م" · "اشتراك لمدة ١ شهر" | Pass |
| 7 | PURCHASE, backend `UNAVAILABLE` (price missing) | UNAVAILABLE | Pass |
| 8 | SUBSCRIPTION, backend `UNAVAILABLE` (all plans retired) | UNAVAILABLE | Pass |
| 9 | PURCHASE "PRICED", null price | UNAVAILABLE | Pass |
| 10 | PURCHASE "PRICED", **zero** price | UNAVAILABLE, not free and not "٠ ج.م" | Pass |
| 11 | PURCHASE "PRICED", negative price | UNAVAILABLE | Pass |
| 12 | PURCHASE "PRICED", string price `"450.00"` | UNAVAILABLE | Pass |
| 13 | PURCHASE "PRICED", three decimal places | UNAVAILABLE | Pass |
| 14 | PURCHASE "PRICED", currency `USD` | UNAVAILABLE | Pass |
| 15 | PURCHASE "PRICED", no currency | UNAVAILABLE | Pass |
| 16 | SUBSCRIPTION "PRICED", no plans (inactive or expired only) | UNAVAILABLE | Pass |
| 17 | SUBSCRIPTION "PRICED", only plan priced at zero | UNAVAILABLE | Pass |
| 18 | SUBSCRIPTION "PRICED", only plan has an unknown unit | UNAVAILABLE | Pass |
| 19 | SUBSCRIPTION "PRICED", only plan has no term | UNAVAILABLE | Pass |
| 20 | FREE access type with PRICED status | UNAVAILABLE, not free | Pass |
| 21 | PURCHASE access type with FREE status | UNAVAILABLE, not free | Pass |
| 22 | Unknown access type | UNAVAILABLE | Pass |
| 23 | Unknown pricing status | UNAVAILABLE | Pass |
| 24 | Offer missing | UNAVAILABLE | Pass |

On every row, no surface shows a standalone zero amount, and "مجانية" appears only on the FREE row.

## Browser matrix — real backend, desktop and mobile

Evidence is in the workspace folder `docs/audits/evidence/phase2-2026-09-14/tech-12/` (`matrix-a70f5ae-*.png`, `matrix-a70f5ae-results.json`), with the list edge states in `…/tech-10/after-tech10-*`.

| Scenario | Expected | Observed (desktop and mobile) | Verdict |
| --- | --- | --- | --- |
| Course 1, PURCHASE 450.00 | Card = panel: "٤٥٠ ج.م / شراء مرة واحدة"; sign-in actions | Identical; actions present | Pass |
| Course 2, SUBSCRIPTION: plans 120 and 40, one retired, one zero-priced | Card = panel: "يبدأ من ٤٠ ج.م / اشتراك بعدة خطط"; panel lists only the two sellable plans | Identical; panel lists "شهري · لمدة ١ شهر ١٢٠ ج.م" and "أسبوعي · لمدة ١ أسبوع ٤٠ ج.م" | Pass |
| Course 3, FREE | Card = panel: "مجانية" | Identical | Pass |
| Course 4, PURCHASE with no stored price | Card = panel: UNAVAILABLE; no buttons | Identical; no buttons | Pass |
| Course 5, SUBSCRIPTION with every plan retired | Card = panel: UNAVAILABLE; no buttons | Identical; no buttons | Pass |
| Course 8, PURCHASE 99.50 | Card = panel: "٩٩٫٥٠ ج.م / شراء مرة واحدة" | Identical | Pass |
| Contract-invalid zero price injected for course 1 on list **and** detail | UNAVAILABLE on both; no buttons | Card and panel "السعر غير متاح"; no buttons | Pass |
| List answers 503 / 429 / network loss / malformed | Failure with retry; no cards | Failure message for each, with retry; 0 cards | Pass |
| List answers empty | "لا توجد دورات معروضة حاليًا"; no cards | As expected | Pass |
| Detail request fails (network) | "تعذّر تحميل الدورة" with retry | As expected | Pass |
| Stale or deleted course (`/courses/999999`) and draft (`/courses/6`) | Not found, with no details | "الدورة غير متاحة" for both | Pass |

## Negative control

Changing `toMoney` to accept `0` (`amount < 0` instead of `amount <= 0`) turns **3 rows red**:

- row 6, where a zero plan appears beside the valid one;
- row 10, where a zero purchase becomes a price;
- row 17, where a zero-only subscription becomes priced.

The mapper was restored and the matrix is green again, so it catches the specific failure it exists for: an unusable amount becoming a displayed price.

## Existing coverage this matrix relies on

| Concern | Tests |
| --- | --- |
| Every combination of access type, status, amount and currency: no path to FREE or a non-positive amount | `public-courses.mapper.test.ts` (combinatorial test) |
| Network, rate-limited, server, malformed and not-found classification; canonical ids | `public-courses.service.test.ts` |
| Loading, ready, empty and error states; stale responses; retry; unmount | `use-public-courses.test.tsx` |
| Landing section states, card labels and accessible descriptions | `courses-section.test.tsx`, `landing-page.test.tsx` |
| Detail states, plans, not-found, return destination, no protected requests | `public-course-detail-page.test.tsx`, `register-return-destination.test.tsx` |
| Backend eligibility, pricing and hardening | backend-foundation `PublicOfferTest`, `PublicCourseApiTest`, `PublicCourseApiHardeningTest` |

## Defects

The validation found no defects in product code. Nothing needed a separate fix.

## Not covered here

This is local evidence against a synthetic catalogue. It does **not** verify production data or deployed builds. Real approved prices on the live site are TECH-63, which needs the TECH-1 production offer inventory and a release of backend #100, #101 and #102 followed by the frontend PRs.

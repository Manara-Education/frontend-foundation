import { render, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { CoursesSection } from "@/features/landing/components/courses-section";
import { PublicCourseContent } from "./components/public-course-content";
import { toPublicCourseDetail, toPublicCourseSummary } from "./mappers/public-courses.mapper";

/*
  TECH-12: the public pricing matrix.

  Every row is a raw offer exactly as the backend could send it — valid, backend-declared
  unavailable, or contract-invalid — pushed through the shipped mapper and rendered on BOTH
  public surfaces: the landing card and the course page's price panel. Each row asserts the
  expected label on each surface and that the two surfaces say exactly the same thing, visibly
  and to a screen reader. Nothing is compared against the formatter's own output, so a regression
  in the shared formatter cannot make both sides agree on a wrong answer.

  Fixtures are synthetic and test-only.
*/

vi.mock("@/shared/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/auth")>();
  return { ...actual, useAuth: () => ({ status: "anonymous", user: null }) };
});

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
});

interface Expected {
  tone: "free" | "paid" | "unavailable";
  badge: string;
  caption: string | null;
  spoken: string;
  /** Whether the course page offers a way on (sign in / register for an anonymous visitor). */
  actions: boolean;
}

const UNAVAILABLE: Expected = {
  tone: "unavailable",
  badge: "السعر غير متاح",
  caption: null,
  spoken: "سعر هذه الدورة غير متاح حاليًا",
  actions: false,
};

const plan = (id: number, name: string, price: unknown, extra: Record<string, unknown> = {}) => ({
  id,
  name,
  duration: 1,
  unit: "MONTH",
  price,
  ...extra,
});

const priced = (overrides: Record<string, unknown>) => ({
  accessType: "PURCHASE",
  pricingStatus: "PRICED",
  currency: "EGP",
  purchasePrice: 450,
  plans: [],
  ...overrides,
});

const subscription = (plans: unknown[], overrides: Record<string, unknown> = {}) => ({
  accessType: "SUBSCRIPTION",
  pricingStatus: "PRICED",
  currency: "EGP",
  purchasePrice: null,
  plans,
  ...overrides,
});

const NINETY_NINE_FIFTY = `${(99.5).toLocaleString("ar-EG", { minimumFractionDigits: 2 })} ج.م`;

const MATRIX: Array<[string, unknown, Expected]> = [
  // ── valid offers ──────────────────────────────────────────────────────────
  ["FREE", { accessType: "FREE", pricingStatus: "FREE", currency: null, purchasePrice: null, plans: [] },
    { tone: "free", badge: "مجانية", caption: null, spoken: "دورة مجانية", actions: true }],
  ["PURCHASE 450.00", priced({}),
    { tone: "paid", badge: "٤٥٠ ج.م", caption: "شراء مرة واحدة", spoken: "السعر ٤٥٠ جنيه مصري، شراء مرة واحدة", actions: true }],
  ["PURCHASE 99.50", priced({ purchasePrice: 99.5 }),
    { tone: "paid", badge: NINETY_NINE_FIFTY, caption: "شراء مرة واحدة", spoken: `السعر ${NINETY_NINE_FIFTY.replace("ج.م", "جنيه مصري")}، شراء مرة واحدة`, actions: true }],
  ["SUBSCRIPTION, one active plan", subscription([plan(1, "شهري", 120)]),
    { tone: "paid", badge: "١٢٠ ج.م", caption: "اشتراك لمدة ١ شهر", spoken: "اشتراك لمدة ١ شهر بسعر ١٢٠ جنيه مصري", actions: true }],
  ["SUBSCRIPTION, two active plans", subscription([plan(1, "شهري", 120), plan(2, "أسبوعي", 40, { unit: "WEEK" })]),
    { tone: "paid", badge: "يبدأ من ٤٠ ج.م", caption: "اشتراك بعدة خطط", spoken: "اشتراك بخطط تبدأ أسعارها من ٤٠ جنيه مصري", actions: true }],
  ["SUBSCRIPTION, an invalid plan beside a valid one", subscription([plan(1, "شهري", 120), plan(2, "صفري", 0)]),
    { tone: "paid", badge: "١٢٠ ج.م", caption: "اشتراك لمدة ١ شهر", spoken: "اشتراك لمدة ١ شهر بسعر ١٢٠ جنيه مصري", actions: true }],

  // ── the backend says the price cannot be stated ───────────────────────────
  ["PURCHASE, backend UNAVAILABLE (price missing)", priced({ pricingStatus: "UNAVAILABLE", purchasePrice: null }), UNAVAILABLE],
  ["SUBSCRIPTION, backend UNAVAILABLE (no active plan: all retired)", subscription([], { pricingStatus: "UNAVAILABLE" }), UNAVAILABLE],

  // ── contract-invalid values the client must refuse ────────────────────────
  ["PURCHASE 'PRICED' with a null price", priced({ purchasePrice: null }), UNAVAILABLE],
  ["PURCHASE 'PRICED' with a zero price", priced({ purchasePrice: 0 }), UNAVAILABLE],
  ["PURCHASE 'PRICED' with a negative price", priced({ purchasePrice: -450 }), UNAVAILABLE],
  ["PURCHASE 'PRICED' with a string price", priced({ purchasePrice: "450.00" }), UNAVAILABLE],
  ["PURCHASE 'PRICED' with three decimal places", priced({ purchasePrice: 99.999 }), UNAVAILABLE],
  ["PURCHASE 'PRICED' in another currency", priced({ currency: "USD" }), UNAVAILABLE],
  ["PURCHASE 'PRICED' with no currency", priced({ currency: null }), UNAVAILABLE],
  ["SUBSCRIPTION 'PRICED' with no plans (inactive or expired only)", subscription([]), UNAVAILABLE],
  ["SUBSCRIPTION 'PRICED' whose only plan is priced at zero", subscription([plan(1, "صفري", 0)]), UNAVAILABLE],
  ["SUBSCRIPTION 'PRICED' whose only plan has an unknown unit", subscription([plan(1, "سنوي", 900, { unit: "YEAR" })]), UNAVAILABLE],
  ["SUBSCRIPTION 'PRICED' whose only plan has no term", subscription([plan(1, "بلا مدة", 120, { duration: 0 })]), UNAVAILABLE],
  ["FREE access type with a PRICED status (contradiction)", { accessType: "FREE", pricingStatus: "PRICED", currency: "EGP", purchasePrice: 0, plans: [] }, UNAVAILABLE],
  ["PURCHASE access type with a FREE status (contradiction)", priced({ pricingStatus: "FREE", purchasePrice: null }), UNAVAILABLE],
  ["unknown access type", priced({ accessType: "LIFETIME" }), UNAVAILABLE],
  ["unknown pricing status", priced({ pricingStatus: "MAYBE" }), UNAVAILABLE],
  ["offer missing entirely", undefined, UNAVAILABLE],
];

function rawCourse(offer: unknown) {
  return {
    id: 7,
    title: "دورة المصفوفة",
    subtitle: null,
    imageUrl: null,
    instructorName: null,
    durationSeconds: null,
    lessonCount: 3,
    description: "وصف تجريبي.",
    offer,
  };
}

interface Rendered {
  tone: string | null;
  visible: string[];
  spoken: string | null;
  text: string;
}

function readBadge(container: HTMLElement): Rendered {
  const badge = container.querySelector("[data-offer-tone]");
  expect(badge, "a price badge is rendered").not.toBeNull();
  return {
    tone: badge!.getAttribute("data-offer-tone"),
    visible: Array.from(badge!.querySelectorAll('[aria-hidden="true"]')).map((node) => node.textContent ?? ""),
    spoken: badge!.querySelector(".sr-only")?.textContent ?? null,
    text: container.textContent ?? "",
  };
}

function renderLandingCard(offer: unknown): Rendered {
  const summary = toPublicCourseSummary(rawCourse(offer));
  expect(summary, "the card is readable").not.toBeNull();
  const { container, unmount } = render(
    <MemoryRouter>
      <CoursesSection
        state={{ status: "ready", page: { items: [summary!], page: 0, size: 12, totalItems: 1, totalPages: 1, skippedItems: 0 } }}
        onRetry={() => {}}
      />
    </MemoryRouter>,
  );
  const card = container.querySelector("article") as HTMLElement;
  const result = readBadge(card);
  unmount();
  return result;
}

function renderDetailPanel(offer: unknown): Rendered & { buttons: string[] } {
  const detail = toPublicCourseDetail(rawCourse(offer));
  const { container, unmount } = render(
    <MemoryRouter>
      <PublicCourseContent state={{ status: "ready", course: detail }} onRetry={() => {}} />
    </MemoryRouter>,
  );
  const panel = container.querySelector('section[aria-labelledby="public-course-offer-heading"]') as HTMLElement;
  const result = { ...readBadge(panel), buttons: within(panel).queryAllByRole("button").map((button) => button.textContent ?? "") };
  unmount();
  return result;
}

const STANDALONE_ZERO = /(^|[^٠-٩0-9٫.])[٠0] ج\.م/;

describe("public pricing matrix — landing card and course page", () => {
  it.each(MATRIX)("%s", (_scenario, offer, expected) => {
    const card = renderLandingCard(offer);
    const panel = renderDetailPanel(offer);
    const expectedVisible = expected.caption ? [expected.badge, expected.caption] : [expected.badge];

    // Each surface says what the row expects…
    for (const surface of [card, panel]) {
      expect(surface.tone).toBe(expected.tone);
      expect(surface.visible).toEqual(expectedVisible);
      expect(surface.spoken).toBe(expected.spoken);
    }
    // …and the two surfaces say exactly the same thing.
    expect({ tone: panel.tone, visible: panel.visible, spoken: panel.spoken }).toEqual({ tone: card.tone, visible: card.visible, spoken: card.spoken });

    // Unknown or broken never becomes free, and no surface shows a zero price.
    if (expected.tone !== "free") {
      expect(card.text).not.toMatch(/مجان/);
      expect(panel.text).not.toMatch(/مجانية/);
    }
    expect(card.text).not.toMatch(STANDALONE_ZERO);
    expect(panel.text).not.toMatch(STANDALONE_ZERO);

    // A price that cannot be stated offers no way to buy.
    if (expected.actions) expect(panel.buttons).toEqual(["سجّل الدخول للمتابعة", "إنشاء حساب جديد"]);
    else expect(panel.buttons).toEqual([]);
  });

  it("covers every offer kind the domain has", () => {
    const tones = new Set(MATRIX.map(([, , expected]) => expected.tone));
    expect(tones).toEqual(new Set(["free", "paid", "unavailable"]));
  });
});

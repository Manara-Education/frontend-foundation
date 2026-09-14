import { describe, expect, it } from "vitest";
import { PublicCourseError } from "../services/public-course.error";
import {
  toMoney,
  toPublicCourseDetail,
  toPublicCoursePage,
  toPublicCourseSummary,
  toPublicOffer,
} from "./public-courses.mapper";

/*
  The boundary that decides what a visitor is told a course costs. Fixtures follow the
  backend contract (docs/api/PUBLIC_COURSE_API.md, backend-foundation) and are synthetic —
  none of these titles, names or amounts is a real Manara offer.
*/

const MONTHLY = { id: 17, name: "شهري", duration: 1, unit: "MONTH", price: 120 };
const WEEKLY = { id: 18, name: "أسبوعي", duration: 1, unit: "WEEK", price: 40 };

function purchaseOffer(overrides: Record<string, unknown> = {}) {
  return { accessType: "PURCHASE", pricingStatus: "PRICED", currency: "EGP", purchasePrice: 450, plans: [], ...overrides };
}

function summaryPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: 42,
    title: "الجبر للمرحلة الثانوية",
    subtitle: "من المعادلات إلى الدوال",
    imageUrl: "/uploads/3f2a9c1e-8d7b-4c55-9e1f-0a1b2c3d4e5f.webp",
    instructorName: "مدرّب تجريبي",
    durationSeconds: 5400,
    lessonCount: 12,
    offer: purchaseOffer(),
    ...overrides,
  };
}

describe("toMoney", () => {
  it("accepts a positive EGP amount with at most two decimal places", () => {
    expect(toMoney(450, "EGP")).toEqual({ amount: 450, currency: "EGP" });
    expect(toMoney(99.5, "EGP")).toEqual({ amount: 99.5, currency: "EGP" });
    expect(toMoney(0.01, "EGP")).toEqual({ amount: 0.01, currency: "EGP" });
    expect(toMoney(1234.56, "EGP")).toEqual({ amount: 1234.56, currency: "EGP" });
  });

  it.each([
    ["zero", 0, "EGP"],
    ["negative", -1, "EGP"],
    ["NaN", Number.NaN, "EGP"],
    ["infinite", Number.POSITIVE_INFINITY, "EGP"],
    ["a numeric string", "450", "EGP"],
    ["null", null, "EGP"],
    ["three decimal places", 99.999, "EGP"],
    ["another currency", 450, "USD"],
    ["no currency", 450, null],
  ])("refuses %s", (_label, amount, currency) => {
    expect(toMoney(amount, currency)).toBeNull();
  });
});

describe("toPublicOffer", () => {
  it("reads FREE only when the access type and the pricing status both say so", () => {
    expect(toPublicOffer({ accessType: "FREE", pricingStatus: "FREE", currency: null, purchasePrice: null, plans: [] }))
      .toEqual({ kind: "FREE" });
  });

  it("reads a contradiction about being free as 'cannot say', never as free", () => {
    expect(toPublicOffer({ accessType: "FREE", pricingStatus: "PRICED", currency: "EGP", purchasePrice: 10, plans: [] }))
      .toEqual({ kind: "UNAVAILABLE", accessType: null, reason: "INVALID" });
    expect(toPublicOffer(purchaseOffer({ pricingStatus: "FREE" })))
      .toEqual({ kind: "UNAVAILABLE", accessType: "PURCHASE", reason: "INVALID" });
  });

  it("reads a priced purchase as its one-off price", () => {
    expect(toPublicOffer(purchaseOffer())).toEqual({ kind: "PURCHASE", price: { amount: 450, currency: "EGP" } });
  });

  it.each([
    ["no price", { purchasePrice: null }],
    ["a zero price", { purchasePrice: 0 }],
    ["a negative price", { purchasePrice: -5 }],
    ["a string price", { purchasePrice: "450.00" }],
    ["no currency", { currency: null }],
    ["a foreign currency", { currency: "USD" }],
    ["an unknown pricing status", { pricingStatus: "MAYBE" }],
  ])("reads a 'priced' purchase with %s as invalid, never free or zero", (_label, overrides) => {
    expect(toPublicOffer(purchaseOffer(overrides))).toEqual({ kind: "UNAVAILABLE", accessType: "PURCHASE", reason: "INVALID" });
  });

  it("keeps the backend's own 'price unavailable' apart from a broken value", () => {
    expect(toPublicOffer(purchaseOffer({ pricingStatus: "UNAVAILABLE", purchasePrice: null })))
      .toEqual({ kind: "UNAVAILABLE", accessType: "PURCHASE", reason: "NOT_STATED" });
    expect(toPublicOffer({ accessType: "SUBSCRIPTION", pricingStatus: "UNAVAILABLE", currency: "EGP", purchasePrice: null, plans: [] }))
      .toEqual({ kind: "UNAVAILABLE", accessType: "SUBSCRIPTION", reason: "NOT_STATED" });
  });

  it("reads a subscription as its valid plans, in the order sent, with the lowest price", () => {
    const offer = toPublicOffer({
      accessType: "SUBSCRIPTION",
      pricingStatus: "PRICED",
      currency: "EGP",
      purchasePrice: null,
      plans: [
        MONTHLY,
        { ...MONTHLY, id: 19, name: "مجاني؟", price: 0 },
        { ...MONTHLY, id: 20, name: "سنوي", unit: "YEAR" },
        { ...MONTHLY, id: 21, name: "بلا مدة", duration: 0 },
        { ...MONTHLY, id: 22, name: "", price: 30 },
        WEEKLY,
      ],
    });

    expect(offer).toEqual({
      kind: "SUBSCRIPTION",
      plans: [
        { id: 17, name: "شهري", duration: 1, unit: "MONTH", price: { amount: 120, currency: "EGP" } },
        { id: 18, name: "أسبوعي", duration: 1, unit: "WEEK", price: { amount: 40, currency: "EGP" } },
      ],
      lowestPrice: { amount: 40, currency: "EGP" },
    });
  });

  it("reads a 'priced' subscription with no usable plan as invalid", () => {
    const offer = toPublicOffer({
      accessType: "SUBSCRIPTION",
      pricingStatus: "PRICED",
      currency: "EGP",
      purchasePrice: null,
      plans: [{ ...MONTHLY, price: 0 }],
    });
    expect(offer).toEqual({ kind: "UNAVAILABLE", accessType: "SUBSCRIPTION", reason: "INVALID" });
    expect(toPublicOffer({ accessType: "SUBSCRIPTION", pricingStatus: "PRICED", currency: "EGP", plans: "nope" }))
      .toEqual({ kind: "UNAVAILABLE", accessType: "SUBSCRIPTION", reason: "INVALID" });
  });

  it.each([
    ["missing", undefined],
    ["null", null],
    ["an array", []],
    ["an unknown access type", purchaseOffer({ accessType: "LIFETIME" })],
  ])("reads an offer that is %s as invalid", (_label, raw) => {
    expect(toPublicOffer(raw)).toEqual({ kind: "UNAVAILABLE", accessType: null, reason: "INVALID" });
  });

  it("never produces FREE or a non-positive amount from any combination of broken fields", () => {
    const accessTypes = ["FREE", "PURCHASE", "SUBSCRIPTION", "LIFETIME", "", null, undefined];
    const statuses = ["FREE", "PRICED", "UNAVAILABLE", "MAYBE", null, undefined];
    const amounts = [450, 0, -1, 0.001, Number.NaN, "450", null, undefined];
    const currencies = ["EGP", "USD", null];

    for (const accessType of accessTypes)
      for (const pricingStatus of statuses)
        for (const amount of amounts)
          for (const currency of currencies) {
            const offer = toPublicOffer({
              accessType,
              pricingStatus,
              currency,
              purchasePrice: amount,
              plans: [{ ...MONTHLY, price: amount }],
            });
            const context = JSON.stringify({ accessType, pricingStatus, amount, currency });
            if (offer.kind === "FREE") {
              expect([accessType, pricingStatus], context).toEqual(["FREE", "FREE"]);
            }
            if (offer.kind === "PURCHASE") expect(offer.price.amount, context).toBeGreaterThan(0);
            if (offer.kind === "SUBSCRIPTION") {
              for (const plan of offer.plans) expect(plan.price.amount, context).toBeGreaterThan(0);
              expect(offer.lowestPrice.amount, context).toBeGreaterThan(0);
            }
          }
  });
});

describe("toPublicCourseSummary", () => {
  it("reads a card from the contract", () => {
    expect(toPublicCourseSummary(summaryPayload())).toEqual({
      id: 42,
      title: "الجبر للمرحلة الثانوية",
      subtitle: "من المعادلات إلى الدوال",
      imageUrl: "/uploads/3f2a9c1e-8d7b-4c55-9e1f-0a1b2c3d4e5f.webp",
      instructorName: "مدرّب تجريبي",
      durationSeconds: 5400,
      lessonCount: 12,
      offer: { kind: "PURCHASE", price: { amount: 450, currency: "EGP" } },
    });
  });

  it.each([
    ["no id", { id: undefined }],
    ["a zero id", { id: 0 }],
    ["a string id", { id: "42" }],
    ["a fractional id", { id: 4.2 }],
    ["no title", { title: null }],
    ["a blank title", { title: "   " }],
  ])("drops a card with %s", (_label, overrides) => {
    expect(toPublicCourseSummary(summaryPayload(overrides))).toBeNull();
  });

  it.each([
    ["an upload path", "/uploads/abc-123.png", "/uploads/abc-123.png"],
    ["an https URL", "https://images.example.com/cover.png", "https://images.example.com/cover.png"],
    ["a javascript: URL", "javascript:alert(1)", null],
    ["a data: URL", "data:image/png;base64,AAAA", null],
    ["plain http", "http://images.example.com/cover.png", null],
    ["credentials", "https://user:secret@images.example.com/cover.png", null],
    ["a traversal", "/uploads/../secret", null],
    ["another local path", "/api/v1/student/courses", null],
    ["a protocol-relative URL", "//evil.example.com/x.png", null],
  ])("handles an image that is %s", (_label, imageUrl, expected) => {
    expect(toPublicCourseSummary(summaryPayload({ imageUrl }))?.imageUrl).toBe(expected);
  });

  it("reads unknown counts and durations as unknown, never as zero", () => {
    const card = toPublicCourseSummary(summaryPayload({ durationSeconds: 0, lessonCount: -1, subtitle: "", instructorName: 7 }));
    expect(card).toMatchObject({ durationSeconds: null, lessonCount: null, subtitle: null, instructorName: null });
  });

  it("keeps a card whose offer is broken, showing it as unavailable", () => {
    expect(toPublicCourseSummary(summaryPayload({ offer: { accessType: "PURCHASE", pricingStatus: "PRICED" } }))?.offer)
      .toEqual({ kind: "UNAVAILABLE", accessType: "PURCHASE", reason: "INVALID" });
  });
});

describe("toPublicCourseDetail", () => {
  it("adds the plain-text description", () => {
    expect(toPublicCourseDetail({ ...summaryPayload(), description: "ماذا ستتعلم." }).description).toBe("ماذا ستتعلم.");
    expect(toPublicCourseDetail({ ...summaryPayload(), description: null }).description).toBeNull();
  });

  it("refuses a detail it cannot identify", () => {
    expect(() => toPublicCourseDetail({ title: "بلا معرّف" })).toThrow(PublicCourseError);
    expect(() => toPublicCourseDetail("not an object")).toThrow(expect.objectContaining({ kind: "malformed" }));
  });
});

describe("toPublicCoursePage", () => {
  const page = (overrides: Record<string, unknown> = {}) => ({
    items: [summaryPayload(), summaryPayload({ id: 43, title: "دورة ثانية" })],
    page: 0,
    size: 12,
    totalItems: 2,
    totalPages: 1,
    ...overrides,
  });

  it("reads a page and its totals", () => {
    const result = toPublicCoursePage(page());
    expect(result.items.map((item) => item.id)).toEqual([42, 43]);
    expect(result).toMatchObject({ page: 0, size: 12, totalItems: 2, totalPages: 1, skippedItems: 0 });
  });

  it("leaves out an unreadable card and says how many", () => {
    const result = toPublicCoursePage(page({ items: [summaryPayload(), { id: "x" }, null] }));
    expect(result.items.map((item) => item.id)).toEqual([42]);
    expect(result.skippedItems).toBe(2);
  });

  it("reads an empty page as empty", () => {
    expect(toPublicCoursePage(page({ items: [], totalItems: 0, totalPages: 0 })).items).toEqual([]);
  });

  it.each([
    ["no items", { items: undefined }],
    ["items that are not a list", { items: {} }],
    ["a negative page", { page: -1 }],
    ["a zero size", { size: 0 }],
    ["a missing total", { totalItems: undefined }],
  ])("refuses a page with %s", (_label, overrides) => {
    expect(() => toPublicCoursePage(page(overrides))).toThrow(expect.objectContaining({ kind: "malformed" }));
  });
});

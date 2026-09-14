import { describe, expect, it } from "vitest";
import type { PublicOffer, PublicPlan } from "../types/public-courses.types";
import {
  describeOffer,
  formatDurationSeconds,
  formatLessonCount,
  formatMoney,
  formatMoneySpoken,
  formatPlanTerm,
} from "./public-offer.formatter";

const egp = (amount: number) => ({ amount, currency: "EGP" as const });
const plan = (id: number, name: string, price: number, duration = 1, unit: PublicPlan["unit"] = "MONTH"): PublicPlan => ({
  id,
  name,
  duration,
  unit,
  price: egp(price),
});

describe("money", () => {
  it("prints Arabic digits with the currency every course screen uses", () => {
    expect(formatMoney(egp(450))).toBe("٤٥٠ ج.م");
    expect(formatMoney(egp(1250))).toBe(`${(1250).toLocaleString("ar-EG")} ج.م`);
    expect(formatMoneySpoken(egp(450))).toBe("٤٥٠ جنيه مصري");
  });

  it("prints a fraction with both piastre digits", () => {
    expect(formatMoney(egp(99.5))).toBe(`${(99.5).toLocaleString("ar-EG", { minimumFractionDigits: 2 })} ج.م`);
    expect(formatMoney(egp(99.5))).toMatch(/٩٩.٥٠ ج\.م$/);
  });
});

describe("terms, lengths and counts", () => {
  it("states a plan's term in the unit it is sold in", () => {
    expect(formatPlanTerm({ duration: 1, unit: "MONTH" })).toBe("١ شهر");
    expect(formatPlanTerm({ duration: 2, unit: "WEEK" })).toBe("٢ أسبوع");
    expect(formatPlanTerm({ duration: 30, unit: "DAY" })).toBe("٣٠ يوم");
  });

  it("reads a duration from seconds, and says nothing when it is unknown", () => {
    expect(formatDurationSeconds(5400)).toBe("١ ساعة ٣٠ دقيقة");
    expect(formatDurationSeconds(7200)).toBe("٢ ساعة");
    expect(formatDurationSeconds(900)).toBe("١٥ دقيقة");
    expect(formatDurationSeconds(20)).toBe("أقل من دقيقة");
    expect(formatDurationSeconds(0)).toBeNull();
    expect(formatDurationSeconds(null)).toBeNull();
  });

  it("counts lessons, and says nothing for none", () => {
    expect(formatLessonCount(12)).toBe("١٢ درس");
    expect(formatLessonCount(0)).toBeNull();
    expect(formatLessonCount(null)).toBeNull();
  });
});

describe("describeOffer", () => {
  it("says free only for a free offer", () => {
    expect(describeOffer({ kind: "FREE" })).toEqual({ badge: "مجانية", caption: null, spoken: "دورة مجانية", tone: "free" });
  });

  it("states a one-off price as a one-time purchase", () => {
    expect(describeOffer({ kind: "PURCHASE", price: egp(450) })).toEqual({
      badge: "٤٥٠ ج.م",
      caption: "شراء مرة واحدة",
      spoken: "السعر ٤٥٠ جنيه مصري، شراء مرة واحدة",
      tone: "paid",
    });
  });

  it("states a single plan with its term, as a period rather than a recurring charge", () => {
    const offer: PublicOffer = { kind: "SUBSCRIPTION", plans: [plan(1, "شهري", 120)], lowestPrice: egp(120) };
    expect(describeOffer(offer)).toEqual({
      badge: "١٢٠ ج.م",
      caption: "اشتراك لمدة ١ شهر",
      spoken: "اشتراك لمدة ١ شهر بسعر ١٢٠ جنيه مصري",
      tone: "paid",
    });
  });

  it("labels the lowest of several plans as a starting price", () => {
    const offer: PublicOffer = {
      kind: "SUBSCRIPTION",
      plans: [plan(1, "شهري", 120), plan(2, "أسبوعي", 40, 1, "WEEK")],
      lowestPrice: egp(40),
    };
    expect(describeOffer(offer)).toMatchObject({ badge: "يبدأ من ٤٠ ج.م", caption: "اشتراك بعدة خطط", tone: "paid" });
  });

  it.each([
    [{ kind: "UNAVAILABLE", accessType: "PURCHASE", reason: "NOT_STATED" }],
    [{ kind: "UNAVAILABLE", accessType: "SUBSCRIPTION", reason: "INVALID" }],
    [{ kind: "UNAVAILABLE", accessType: null, reason: "INVALID" }],
  ] as [PublicOffer][])("says an unavailable price is unavailable — no amount, never free (%j)", (offer) => {
    const described = describeOffer(offer);
    expect(described).toEqual({ badge: "السعر غير متاح", caption: null, spoken: "سعر هذه الدورة غير متاح حاليًا", tone: "unavailable" });
    expect(`${described.badge} ${described.spoken}`).not.toMatch(/مجان|٠|ج\.م/);
  });
});

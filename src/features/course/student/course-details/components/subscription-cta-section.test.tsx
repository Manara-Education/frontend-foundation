import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CourseDetailData } from "../types/course-details.types";
import { SubscriptionCTASection } from "./subscription-cta-section";

const PLANS = [
  { id: 7, name: "شهري", durationLabel: "١ شهر", priceLabel: "١٢٠ ج.م" },
  { id: 8, name: "فصلي", durationLabel: "٣ شهر", priceLabel: "٣٠٠ ج.م" },
];
const course = { id: 42, title: "دورة" } as unknown as CourseDetailData;

describe("a plan chosen before signing in", () => {
  it("is preselected when it is one of the plans the server returned", () => {
    render(<SubscriptionCTASection course={course} plans={PLANS} preferredPlanId={8} onPay={vi.fn()} />);
    expect(screen.getByRole("button", { name: /اشترك الآن — ٣٠٠ ج.م/ })).toBeInTheDocument();
  });

  it("is ignored when it names no current plan", () => {
    render(<SubscriptionCTASection course={course} plans={PLANS} preferredPlanId={999} onPay={vi.fn()} />);
    expect(screen.getByRole("button", { name: /اشترك الآن — ١٢٠ ج.م/ })).toBeInTheDocument();
  });
});

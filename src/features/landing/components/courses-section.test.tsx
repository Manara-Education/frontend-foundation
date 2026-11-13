import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type {
  PublicCourseListState,
  PublicCoursePage,
  PublicCourseSummary,
  PublicOffer,
} from "@/features/public-courses/types/public-courses.types";
import { CoursesSection } from "./courses-section";

/*
  The landing page's courses section, from each state the public catalogue hook can be in.
  Courses are synthetic; none of these titles or prices is a real Manara offer.
*/

beforeAll(() => {
  // The section's fade-in is driven by IntersectionObserver, which jsdom does not have.
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

const egp = (amount: number) => ({ amount, currency: "EGP" as const });

function course(id: number, title: string, offer: PublicOffer): PublicCourseSummary {
  return { id, title, subtitle: null, imageUrl: null, instructorName: "مدرّبة تجريبية", durationSeconds: 3600, lessonCount: 4, offer };
}

function page(items: PublicCourseSummary[], overrides: Partial<PublicCoursePage> = {}): PublicCoursePage {
  return { items, page: 0, size: 12, totalItems: items.length, totalPages: items.length ? 1 : 0, skippedItems: 0, ...overrides };
}

function renderSection(state: PublicCourseListState, onRetry = vi.fn()) {
  render(
    <MemoryRouter>
      <CoursesSection state={state} onRetry={onRetry} />
    </MemoryRouter>,
  );
  return onRetry;
}

const OFFERS = [
  course(1, "دورة مجانية", { kind: "FREE" }),
  course(2, "دورة بسعر ثابت", { kind: "PURCHASE", price: egp(450) }),
  course(3, "اشتراك بخطة واحدة", { kind: "SUBSCRIPTION", plans: [{ id: 9, name: "شهري", duration: 1, unit: "MONTH", price: egp(120) }], lowestPrice: egp(120) }),
  course(4, "اشتراك بعدة خطط", {
    kind: "SUBSCRIPTION",
    plans: [
      { id: 10, name: "شهري", duration: 1, unit: "MONTH", price: egp(120) },
      { id: 11, name: "أسبوعي", duration: 1, unit: "WEEK", price: egp(40) },
    ],
    lowestPrice: egp(40),
  }),
  course(5, "دورة سعرها غير متاح", { kind: "UNAVAILABLE", accessType: "PURCHASE", reason: "NOT_STATED" }),
  course(6, "دورة ببيانات سعر معطوبة", { kind: "UNAVAILABLE", accessType: null, reason: "INVALID" }),
];

function card(title: string) {
  return screen.getByRole("link", { name: title }).closest("article") as HTMLElement;
}

describe("the landing courses section", () => {
  it("shows a loading state and no courses while the catalogue is on its way", () => {
    renderSection({ status: "loading" });

    expect(screen.getByRole("status")).toHaveTextContent("جارٍ تحميل الدورات");
    expect(screen.queryByRole("list", { name: "الدورات المتاحة" })).toBeNull();
  });

  it("renders every real course as a link to its public page", () => {
    renderSection({ status: "ready", page: page(OFFERS) });

    const links = within(screen.getByRole("list", { name: "الدورات المتاحة" })).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/courses/1", "/courses/2", "/courses/3", "/courses/4", "/courses/5", "/courses/6"]);
  });

  it("labels each price by the kind of offer, never from an amount", () => {
    renderSection({ status: "ready", page: page(OFFERS) });

    expect(within(card("دورة مجانية")).getByText("مجانية")).toBeInTheDocument();
    expect(within(card("دورة بسعر ثابت")).getByText("٤٥٠ ج.م")).toBeInTheDocument();
    expect(within(card("دورة بسعر ثابت")).getByText("شراء مرة واحدة")).toBeInTheDocument();
    expect(within(card("اشتراك بخطة واحدة")).getByText("١٢٠ ج.م")).toBeInTheDocument();
    expect(within(card("اشتراك بخطة واحدة")).getByText("اشتراك لمدة ١ شهر")).toBeInTheDocument();
    expect(within(card("اشتراك بعدة خطط")).getByText("يبدأ من ٤٠ ج.م")).toBeInTheDocument();
    for (const title of ["دورة سعرها غير متاح", "دورة ببيانات سعر معطوبة"]) {
      expect(within(card(title)).getByText("السعر غير متاح")).toBeInTheDocument();
      expect(card(title)).not.toHaveTextContent(/مجان|٠ ج\.م|0 ج\.م/);
    }
  });

  it("describes each card's link by its price for screen readers", () => {
    renderSection({ status: "ready", page: page(OFFERS) });

    expect(screen.getByRole("link", { name: "دورة بسعر ثابت" })).toHaveAccessibleDescription("السعر ٤٥٠ جنيه مصري، شراء مرة واحدة");
    expect(screen.getByRole("link", { name: "دورة سعرها غير متاح" })).toHaveAccessibleDescription("سعر هذه الدورة غير متاح حاليًا");
  });

  it("shows no sample course or sample disclaimer in any state", () => {
    const states: PublicCourseListState[] = [
      { status: "loading" },
      { status: "ready", page: page(OFFERS) },
      { status: "empty", page: page([]) },
      { status: "error", failure: "server" },
    ];
    for (const state of states) {
      const { unmount } = render(
        <MemoryRouter>
          <CoursesSection state={state} onRetry={() => {}} />
        </MemoryRouter>,
      );
      expect(document.body).not.toHaveTextContent("React من الصفر إلى الاحتراف");
      expect(document.body).not.toHaveTextContent("دورات نموذجية");
      expect(document.body).not.toHaveTextContent("قريبًا");
      unmount();
    }
  });

  it("says honestly that there are no courses yet when the catalogue is empty", () => {
    renderSection({ status: "empty", page: page([]) });

    expect(screen.getByText("لا توجد دورات معروضة حاليًا")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("treats a page whose every course was unreadable as a failure, not as empty", () => {
    renderSection({ status: "empty", page: page([], { totalItems: 3, skippedItems: 3 }) });

    expect(screen.getByRole("alert")).toHaveTextContent("تعذّر تحميل الدورات الآن");
  });

  it("reports a failure with a retry, inventing nothing", async () => {
    const onRetry = renderSection({ status: "error", failure: "network" });

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("تحقق من اتصالك بالإنترنت");
    expect(screen.queryByRole("link")).toBeNull();
    await userEvent.click(within(alert).getByRole("button", { name: "إعادة المحاولة" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("says how many courses exist when it shows only the newest ones", () => {
    renderSection({ status: "ready", page: page(OFFERS.slice(0, 2), { totalItems: 30, totalPages: 15 }) });

    expect(screen.getByText("تُعرض هنا أحدث ٢ دورة من أصل ٣٠.")).toBeInTheDocument();
  });
});

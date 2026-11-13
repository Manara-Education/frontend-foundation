import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider, useParams } from "react-router";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/api";
import { getPublicCoursesRequest } from "@/features/public-courses/api/public-courses.api";
import { LandingPage } from "./landing-page";

/*
  The landing page as a visitor loads it, with the public catalogue stubbed at the HTTP boundary
  so the service, mapper and formatters all run as they ship. Courses are synthetic.
*/
vi.mock("@/features/public-courses/api/public-courses.api", () => ({
  getPublicCoursesRequest: vi.fn(),
  getPublicCourseRequest: vi.fn(),
}));

const listRequest = vi.mocked(getPublicCoursesRequest);
type Response = Awaited<ReturnType<typeof getPublicCoursesRequest>>;

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

afterEach(() => {
  listRequest.mockReset();
});

const COURSES = {
  items: [
    {
      id: 42,
      title: "دورة تجريبية: أساسيات الجبر",
      subtitle: null,
      imageUrl: null,
      instructorName: null,
      durationSeconds: null,
      lessonCount: 2,
      offer: { accessType: "PURCHASE", pricingStatus: "PRICED", currency: "EGP", purchasePrice: 450, plans: [] },
    },
    {
      id: 41,
      title: "دورة تجريبية بسعر غير محدد",
      subtitle: null,
      imageUrl: null,
      instructorName: null,
      durationSeconds: null,
      lessonCount: 1,
      offer: { accessType: "PURCHASE", pricingStatus: "PRICED", currency: "EGP", purchasePrice: null, plans: [] },
    },
  ],
  page: 0,
  size: 12,
  totalItems: 2,
  totalPages: 1,
};

function CourseProbe() {
  const { courseId } = useParams();
  return <p data-testid="public-course">{courseId}</p>;
}

function renderLanding() {
  const router = createMemoryRouter(
    [
      { path: "/", element: <LandingPage /> },
      { path: "/courses/:courseId", element: <CourseProbe /> },
    ],
    { initialEntries: ["/"] },
  );
  render(<RouterProvider router={router} />);
}

describe("the landing page's courses", () => {
  it("asks the public catalogue for its first page and shows the real prices", async () => {
    listRequest.mockResolvedValue({ status: 200, data: { status: "success", data: COURSES } } as Response);
    renderLanding();

    const list = await screen.findByRole("list", { name: "الدورات المتاحة" });
    expect(listRequest).toHaveBeenCalledWith({ page: 0, size: 12 });
    expect(within(list).getByText("٤٥٠ ج.م")).toBeInTheDocument();
    // A 'priced' purchase with no amount is shown as unavailable — not free, not zero.
    expect(within(list).getByText("السعر غير متاح")).toBeInTheDocument();
    // A standalone zero amount — not the last digit of "٤٥٠ ج.م".
    expect(list).not.toHaveTextContent(/مجان|(^|[^٠-٩0-9٫.])[٠0] ج\.م/);
  });

  it("opens a course's public page from its card", async () => {
    listRequest.mockResolvedValue({ status: 200, data: { status: "success", data: COURSES } } as Response);
    renderLanding();

    await userEvent.click(await screen.findByRole("link", { name: "دورة تجريبية: أساسيات الجبر" }));

    expect(screen.getByTestId("public-course")).toHaveTextContent("42");
  });

  it("shows a failure with a retry instead of sample courses when the catalogue cannot be read", async () => {
    listRequest.mockRejectedValueOnce(new ApiError(503, ["down"]));
    listRequest.mockResolvedValueOnce({ status: 200, data: { status: "success", data: COURSES } } as Response);
    renderLanding();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("تعذّر تحميل الدورات الآن");
    expect(document.body).not.toHaveTextContent("دورات نموذجية");

    await userEvent.click(within(alert).getByRole("button", { name: "إعادة المحاولة" }));

    expect(await screen.findByRole("list", { name: "الدورات المتاحة" })).toBeInTheDocument();
  });
});

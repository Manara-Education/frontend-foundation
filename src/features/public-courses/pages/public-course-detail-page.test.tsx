import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider, useLocation, useParams } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiClient } from "@/shared/api";
import type { AuthStatus, AuthUser } from "@/shared/auth";
import { getPublicCourseRequest } from "../api/public-courses.api";
import { PublicCourseDetailPage } from "./public-course-detail-page";

/*
  The public course page, driven the way a visitor reaches it: an address, a session that is
  signed in or not, and the public detail endpoint answering. The endpoint is stubbed at the
  HTTP boundary, so the service, mapper and formatters run as they ship. Every course here is
  synthetic.
*/
vi.mock("../api/public-courses.api", () => ({
  getPublicCourseRequest: vi.fn(),
  getPublicCoursesRequest: vi.fn(),
}));

const session = vi.hoisted(() => ({
  current: { status: "anonymous", user: null } as { status: AuthStatus; user: AuthUser | null },
}));

vi.mock("@/shared/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/auth")>();
  return { ...actual, useAuth: () => session.current };
});

const detailRequest = vi.mocked(getPublicCourseRequest);
type Response = Awaited<ReturnType<typeof getPublicCourseRequest>>;

const PURCHASE = {
  id: 42,
  title: "دورة تجريبية: أساسيات الجبر",
  subtitle: "من المعادلات إلى الدوال",
  description: "سطر أول عن الدورة.\nسطر ثانٍ.",
  imageUrl: null,
  instructorName: "مدرّبة تجريبية",
  durationSeconds: 5400,
  lessonCount: 12,
  offer: { accessType: "PURCHASE", pricingStatus: "PRICED", currency: "EGP", purchasePrice: 450, plans: [] },
};

function respond(course: unknown) {
  detailRequest.mockResolvedValue({ status: 200, data: { status: "success", data: course } } as Response);
}

function user(role: string, requiresPasswordReset = false): AuthUser {
  return { fullName: "حساب تجريبي", email: "account@example.com", role, requiresPasswordReset };
}

function Probe({ name }: { name: string }) {
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "none";
  return <p data-testid="arrived">{`${name} ${location.pathname} from=${from}`}</p>;
}

function Screen() {
  const { courseId } = useParams();
  return <PublicCourseDetailPage courseId={courseId} />;
}

function renderAt(url: string) {
  const router = createMemoryRouter(
    [
      { path: "/courses/:courseId", element: <Screen /> },
      { path: "/login", element: <Probe name="login" /> },
      { path: "/register", element: <Probe name="register" /> },
      { path: "/student/explore/:courseId", element: <Probe name="course" /> },
      { path: "/reset-password", element: <Probe name="reset" /> },
      { path: "*", element: <Probe name="elsewhere" /> },
    ],
    { initialEntries: [url] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

let apiGet: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  session.current = { status: "anonymous", user: null };
  apiGet = vi.spyOn(apiClient, "get");
});

afterEach(() => {
  vi.restoreAllMocks();
  detailRequest.mockReset();
});

describe("opening a public course page", () => {
  it("shows an anonymous visitor the course, its details and its price from a direct address", async () => {
    respond(PURCHASE);
    renderAt("/courses/42");

    expect(await screen.findByRole("heading", { level: 1, name: PURCHASE.title })).toBeInTheDocument();
    expect(screen.getByText("من المعادلات إلى الدوال")).toBeInTheDocument();
    // The instructor is named under the title and again on the instructor card.
    expect(within(screen.getByRole("region", { name: "المدرّس" })).getByText("مدرّبة تجريبية")).toBeInTheDocument();
    expect(screen.getByText(/١٢ درس/)).toBeInTheDocument();
    expect(screen.getByText(/١ ساعة ٣٠ دقيقة/)).toBeInTheDocument();
    expect(screen.getByText(/سطر أول عن الدورة/)).toBeInTheDocument();

    const offer = screen.getByRole("region", { name: "السعر والوصول" });
    expect(within(offer).getByText("٤٥٠ ج.م")).toBeInTheDocument();
    expect(within(offer).getByText("شراء مرة واحدة")).toBeInTheDocument();
    expect(within(offer).getByText("السعر ٤٥٠ جنيه مصري، شراء مرة واحدة")).toHaveClass("sr-only");
  });

  it("asks only the public endpoint — no learner, lesson or media request is made", async () => {
    respond(PURCHASE);
    renderAt("/courses/42");

    await screen.findByRole("heading", { level: 1 });
    expect(detailRequest).toHaveBeenCalledTimes(1);
    expect(detailRequest).toHaveBeenCalledWith(42);
    expect(apiGet).not.toHaveBeenCalled();
  });

  it("renders the description as text, never as markup", async () => {
    respond({ ...PURCHASE, description: '<img src="x" onerror="alert(1)">نص' });
    renderAt("/courses/42");

    expect(await screen.findByText('<img src="x" onerror="alert(1)">نص')).toBeInTheDocument();
    expect(document.querySelector('img[src="x"]')).toBeNull();
  });
});

describe("prices", () => {
  it("says free for a free course", async () => {
    respond({ ...PURCHASE, offer: { accessType: "FREE", pricingStatus: "FREE", currency: null, purchasePrice: null, plans: [] } });
    renderAt("/courses/42");

    const offer = await screen.findByRole("region", { name: "السعر والوصول" });
    expect(within(offer).getByText("مجانية")).toBeInTheDocument();
  });

  it("lists every subscription plan and labels the lowest as a starting price", async () => {
    respond({
      ...PURCHASE,
      offer: {
        accessType: "SUBSCRIPTION",
        pricingStatus: "PRICED",
        currency: "EGP",
        purchasePrice: null,
        plans: [
          { id: 17, name: "شهري", duration: 1, unit: "MONTH", price: 120 },
          { id: 18, name: "أسبوعي", duration: 1, unit: "WEEK", price: 40 },
        ],
      },
    });
    renderAt("/courses/42");

    const offer = await screen.findByRole("region", { name: "السعر والوصول" });
    expect(within(offer).getByText("يبدأ من ٤٠ ج.م")).toBeInTheDocument();
    const group = within(offer).getByRole("group", { name: "اختر مدة الوصول" });
    const plans = within(group).getAllByRole("radio");
    expect(plans).toHaveLength(2);
    expect(plans[0].closest("label")).toHaveTextContent("شهري");
    expect(plans[0].closest("label")).toHaveTextContent("لمدة ١ شهر");
    expect(plans[0].closest("label")).toHaveTextContent("١٢٠ ج.م");
    expect(plans[1].closest("label")).toHaveTextContent("أسبوعي");
    expect(plans[1].closest("label")).toHaveTextContent("٤٠ ج.م");
    // The cheapest plan is chosen to begin with.
    expect(plans[1]).toBeChecked();
  });

  it.each([
    ["the backend says the price is unavailable", { accessType: "PURCHASE", pricingStatus: "UNAVAILABLE", currency: "EGP", purchasePrice: null, plans: [] }],
    ["a 'priced' purchase has no amount", { accessType: "PURCHASE", pricingStatus: "PRICED", currency: "EGP", purchasePrice: null, plans: [] }],
    ["a 'priced' purchase has a zero amount", { accessType: "PURCHASE", pricingStatus: "PRICED", currency: "EGP", purchasePrice: 0, plans: [] }],
    ["a subscription has no sellable plan", { accessType: "SUBSCRIPTION", pricingStatus: "PRICED", currency: "EGP", purchasePrice: null, plans: [] }],
  ])("shows an unavailable price, and no way to buy, when %s", async (_label, offer) => {
    respond({ ...PURCHASE, offer });
    renderAt("/courses/42");

    const panel = await screen.findByRole("region", { name: "السعر والوصول" });
    expect(within(panel).getByText("السعر غير متاح")).toBeInTheDocument();
    expect(within(panel).queryByRole("button")).toBeNull();
    expect(panel).not.toHaveTextContent(/مجان|٠ ج\.م|0 ج\.م/);
  });
});

describe("what happens next", () => {
  it("sends an anonymous visitor to sign in, remembering the course", async () => {
    respond(PURCHASE);
    renderAt("/courses/42");

    await userEvent.click(await screen.findByRole("button", { name: "سجّل الدخول للمتابعة" }));

    expect(screen.getByTestId("arrived")).toHaveTextContent("login /login from=/student/explore/42");
  });

  it("sends an anonymous visitor to create an account, remembering the course", async () => {
    respond(PURCHASE);
    renderAt("/courses/42");

    await userEvent.click(await screen.findByRole("button", { name: "إنشاء حساب جديد" }));

    expect(screen.getByTestId("arrived")).toHaveTextContent("register /register from=/student/explore/42");
  });

  it("takes a signed-in student straight to the course screen, where checkout lives", async () => {
    session.current = { status: "authenticated", user: user("STUDENT") };
    respond(PURCHASE);
    renderAt("/courses/42");

    await userEvent.click(await screen.findByRole("button", { name: "متابعة للشراء" }));

    expect(screen.getByTestId("arrived")).toHaveTextContent("course /student/explore/42");
  });

  it("sends a student who owes a password change to change it first", async () => {
    session.current = { status: "authenticated", user: user("STUDENT", true) };
    respond(PURCHASE);
    renderAt("/courses/42");

    await userEvent.click(await screen.findByRole("button", { name: "متابعة للشراء" }));

    expect(screen.getByTestId("arrived")).toHaveTextContent("reset /reset-password");
  });

  it("tells an instructor that buying is for student accounts, offering no action", async () => {
    session.current = { status: "authenticated", user: user("INSTRUCTOR") };
    respond(PURCHASE);
    renderAt("/courses/42");

    const panel = await screen.findByRole("region", { name: "السعر والوصول" });
    expect(within(panel).getByText("الاشتراك في الدورات وشراؤها متاحان لحسابات الطلاب.")).toBeInTheDocument();
    expect(within(panel).queryByRole("button")).toBeNull();
  });

  it("while the session is still being read, continues by way of sign-in, which resolves it", async () => {
    session.current = { status: "loading", user: null };
    respond({ ...PURCHASE, offer: { accessType: "FREE", pricingStatus: "FREE", currency: null, purchasePrice: null, plans: [] } });
    renderAt("/courses/42");

    await userEvent.click(await screen.findByRole("button", { name: "ابدأ الدورة" }));

    expect(screen.getByTestId("arrived")).toHaveTextContent("login /login from=/student/explore/42");
  });

  it("never enrols or buys by itself — nothing is requested beyond the page", async () => {
    session.current = { status: "authenticated", user: user("STUDENT") };
    const post = vi.spyOn(apiClient, "post");
    respond(PURCHASE);
    renderAt("/courses/42");

    await screen.findByRole("button", { name: "متابعة للشراء" });
    expect(post).not.toHaveBeenCalled();
    expect(screen.queryByTestId("arrived")).toBeNull();
  });
});

describe("courses that are not on offer", () => {
  it("answers a draft, private or missing course with the same not-found page", async () => {
    detailRequest.mockRejectedValue(new ApiError(404, ["Course not found with id: 42"]));
    renderAt("/courses/42");

    expect(await screen.findByRole("heading", { level: 1, name: "الدورة غير متاحة" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "السعر والوصول" })).toBeNull();
    expect(document.body).not.toHaveTextContent("Course not found with id");
  });

  it.each(["/courses/0x2a", "/courses/042", "/courses/abc", "/courses/-1"])(
    "answers the mangled address %s as not found without asking the server",
    async (url) => {
      renderAt(url);

      expect(await screen.findByRole("heading", { level: 1, name: "الدورة غير متاحة" })).toBeInTheDocument();
      expect(detailRequest).not.toHaveBeenCalled();
    },
  );
});

describe("failures", () => {
  it("reports a failure and recovers on retry", async () => {
    detailRequest.mockRejectedValueOnce(new ApiError(0, ["Network Error"]));
    detailRequest.mockResolvedValueOnce({ status: 200, data: { status: "success", data: PURCHASE } } as Response);
    renderAt("/courses/42");

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("تعذّر تحميل الدورة");
    expect(alert).toHaveTextContent("تحقق من اتصالك بالإنترنت");

    await userEvent.click(within(alert).getByRole("button", { name: "إعادة المحاولة" }));

    expect(await screen.findByRole("heading", { level: 1, name: PURCHASE.title })).toBeInTheDocument();
  });

  it("explains rate limiting", async () => {
    detailRequest.mockRejectedValue(new ApiError(429, ["Too many requests"]));
    renderAt("/courses/42");

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("انتظر قليلًا"));
  });
});

describe("catalogue sections", () => {
  const OUTLINED = {
    ...PURCHASE,
    imageUrl: "/uploads/cover.jpg",
    category: { id: 3, name: "الرياضيات", color: "teal" },
    instructor: { name: "مدرّبة تجريبية", avatarUrl: null, headline: "مدرّسة رياضيات منذ عشر سنوات" },
    outline: [
      { moduleTitle: "الوحدة الأولى", lessons: [{ id: 1, title: "المعادلات الخطية", durationSeconds: 600, preview: false }] },
      { moduleTitle: "الوحدة الثانية", lessons: [] },
    ],
  };

  it("shows the breadcrumb, category, locked outline and instructor card from the server", async () => {
    respond(OUTLINED);
    renderAt("/courses/42");

    const trail = await screen.findByRole("navigation", { name: "مسار التنقل" });
    expect(within(trail).getByRole("link", { name: "الرئيسية" })).toBeInTheDocument();
    expect(within(trail).getByText(PURCHASE.title)).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("الرياضيات")).toBeInTheDocument();

    const outline = screen.getByRole("region", { name: "محتوى الدورة" });
    expect(within(outline).getByRole("heading", { name: "الوحدة الأولى" })).toBeInTheDocument();
    expect(within(outline).getByText("المعادلات الخطية")).toBeInTheDocument();
    expect(within(outline).getByText("(مقفل)")).toBeInTheDocument();
    expect(within(outline).getByText("لا توجد دروس في هذه الوحدة بعد.")).toBeInTheDocument();
    // Nothing in the outline is a link or a play control.
    expect(within(outline).queryByRole("link")).toBeNull();
    expect(within(outline).queryByRole("button")).toBeNull();

    const instructor = screen.getByRole("region", { name: "المدرّس" });
    expect(within(instructor).getByText("مدرّسة رياضيات منذ عشر سنوات")).toBeInTheDocument();
  });

  it("omits the outline instead of inventing lessons when the server sends none", async () => {
    respond({ ...PURCHASE, outline: [] });
    renderAt("/courses/42");
    await screen.findByRole("heading", { level: 1, name: PURCHASE.title });
    expect(screen.queryByRole("region", { name: "محتوى الدورة" })).toBeNull();
  });

  it("carries the chosen plan to sign-in as a hint in the course address", async () => {
    const user = userEvent.setup();
    respond({
      ...PURCHASE,
      offer: {
        accessType: "SUBSCRIPTION",
        pricingStatus: "PRICED",
        currency: "EGP",
        purchasePrice: null,
        plans: [
          { id: 7, name: "شهري", duration: 1, unit: "MONTH", price: 120 },
          { id: 8, name: "فصلي", duration: 3, unit: "MONTH", price: 300 },
        ],
      },
    });
    renderAt("/courses/42");

    const termly = await screen.findByRole("radio", { name: /فصلي/ });
    await user.click(termly);
    // The unit comes from the plan itself — three months, never "/شهر".
    expect(screen.getByText(/وصول لمدة ٣/)).toBeInTheDocument();
    expect(screen.queryByText(/\/شهر/)).toBeNull();
    expect(screen.queryByText(/شهريًا|يتجدد/)).toBeNull();

    await user.click(screen.getByRole("button", { name: "سجّل الدخول للمتابعة" }));
    expect(screen.getByTestId("arrived")).toHaveTextContent("login /login from=/student/explore/42?plan=8");
  });
});

import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentTermsRequest } from "../api/terms.api";
import { TermsPage } from "./terms-page";

/*
  Stubbed at the HTTP boundary rather than at the service, so the envelope unwrapping, the
  mapper and the Arabic date formatting all run for real — the version and effective date on
  screen are the ones the server sent, through the code that ships.
*/
vi.mock("../api/terms.api", () => ({
  getCurrentTermsRequest: vi.fn(),
}));

const requestMock = vi.mocked(getCurrentTermsRequest);

function respondWith(version: string, effectiveDate = "2026-09-07") {
  requestMock.mockResolvedValue({
    status: 200,
    data: { status: "success", data: { version, effectiveDate } },
  } as Awaited<ReturnType<typeof getCurrentTermsRequest>>);
}

/**
 * The twelve clause headings, transcribed here independently of the content module.
 *
 * Written out rather than derived from `TERMS_1_0`, deliberately: a test that reads its
 * expectations out of the file under test would pass just as happily against a document
 * missing half its clauses.
 */
const SECTION_TITLES = [
  "خدمات منارة",
  "حساب المستخدم",
  "الاحترام والاستخدام المسؤول",
  "الأسعار والدفع",
  "إتاحة المحتوى والتسليم الرقمي",
  "الإلغاء والاسترداد",
  "تقديم طلب الاسترداد وتنفيذه",
  "الملكية الفكرية",
  "تحديث المحتوى واستمرارية الخدمة",
  "الخصوصية",
  "الشكاوى وتسوية الخلافات",
  "تعديل الشروط",
];

beforeEach(() => {
  respondWith("1.0");
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderTerms() {
  return render(
    <MemoryRouter initialEntries={["/terms"]}>
      <TermsPage />
    </MemoryRouter>,
  );
}

describe("the published terms", () => {
  it("renders all twelve clauses, numbered and in order", async () => {
    renderTerms();

    const article = await screen.findByRole("article");
    const headings = within(article)
      .getAllByRole("heading", { level: 2 })
      .map((heading) => heading.textContent?.replace(/\s+/g, " ").trim());

    expect(headings).toEqual(SECTION_TITLES.map((title, index) => `${index + 1}. ${title}`));
  });

  it("opens with the preamble above the numbered clauses", async () => {
    renderTerms();

    const article = await screen.findByRole("article");
    expect(article).toHaveTextContent(/^مرحبًا بك في منارة\./);
  });

  it("lists every clause in the contents navigation", async () => {
    renderTerms();

    await screen.findByRole("article");
    const contents = screen.getByRole("navigation", { name: "محتويات الوثيقة" });

    const links = within(contents).getAllByRole("link");
    expect(links).toHaveLength(12);
    expect(links[0]).toHaveAttribute("href", "#section-1");
    expect(links[11]).toHaveAttribute("href", "#section-12");
  });

  it("shows the version and effective date the server named", async () => {
    renderTerms();

    await screen.findByRole("article");

    expect(screen.getAllByText("1.0").length).toBeGreaterThan(0);
    // The machine-readable date stays the server's ISO value; only the rendering is Arabic.
    const dates = document.querySelectorAll('time[datetime="2026-09-07"]');
    expect(dates.length).toBeGreaterThan(0);
    expect(dates[0].textContent).not.toBe("");
  });

  /*
    Metadata is a fact *about* the agreement, not a term of it. Inside the `<article>` it
    would be indistinguishable from the clauses a user is agreeing to.
  */
  it("keeps the version and date out of the agreement itself", async () => {
    renderTerms();

    const article = await screen.findByRole("article");

    expect(article.querySelector("time")).toBeNull();
    expect(article).not.toHaveTextContent("نسخة الشروط");
    expect(article).not.toHaveTextContent("تاريخ السريان");
  });
});

describe("when the backend names a version this build has no text for", () => {
  it("says so rather than showing an older version as if it were current", async () => {
    respondWith("9.9");
    renderTerms();

    expect(await screen.findByRole("alert")).toHaveTextContent(/غير متوفرة في هذا الإصدار/);
    // The 1.0 text is in this build. Showing it here would be showing the wrong contract.
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(screen.queryByText(SECTION_TITLES[0])).not.toBeInTheDocument();
  });

  it("names the version it could not render", async () => {
    respondWith("9.9");
    renderTerms();

    expect(await screen.findByRole("alert")).toHaveTextContent("9.9");
  });
});

describe("when the current version cannot be fetched", () => {
  it("reports the failure and offers to try again", async () => {
    requestMock.mockRejectedValue(new Error("network"));
    renderTerms();

    expect(await screen.findByRole("alert")).toHaveTextContent(/تعذّر تحميل الشروط والأحكام/);

    // A retry re-asks; it does not fall back to whatever text happens to be bundled.
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    await waitFor(() => expect(requestMock).toHaveBeenCalledTimes(1));
  });
});

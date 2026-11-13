import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/api";
import { getCurrentPrivacyPolicyRequest } from "../api/privacy-policy.api";
import type { PrivacyPolicyResponse } from "../types/privacy-policy.types";
import { PrivacyPage } from "./privacy-page";

/*
  Stubbed at the HTTP boundary, so unwrapping, mapping and date formatting run for real: what is
  on screen is what the server sent. The fixture is test-only text — the real policy lives in the
  backend and nothing here should be read as a copy of it.
*/
vi.mock("../api/privacy-policy.api", () => ({
  getCurrentPrivacyPolicyRequest: vi.fn(),
}));

const requestMock = vi.mocked(getCurrentPrivacyPolicyRequest);

const POLICY: PrivacyPolicyResponse = {
  policyId: "privacy-policy",
  language: "ar",
  version: "9.0",
  effectiveDate: "2030-01-02",
  title: "سياسة اختبارية",
  summary: "ملخص اختباري للسياسة.",
  operator: { name: "Fixture Operator", owner: "Fixture Owner", privacyEmail: "privacy@example.com" },
  sections: [
    {
      id: "first",
      number: "1",
      title: "القسم الأول",
      blocks: [
        { type: "paragraph", text: "فقرة <img src=x onerror=alert(1)> تبقى نصًا." },
        { type: "list", items: ["بند أول", "بند ثانٍ"] },
      ],
    },
    {
      id: "retention",
      number: "2",
      title: "الاحتفاظ",
      blocks: [{ type: "email", label: "البريد", address: "privacy@example.com" }],
    },
  ],
};

function respondWith(policy: PrivacyPolicyResponse) {
  requestMock.mockResolvedValue({
    status: 200,
    data: { status: "success", data: policy },
  } as Awaited<ReturnType<typeof getCurrentPrivacyPolicyRequest>>);
}

afterEach(() => {
  vi.clearAllMocks();
});

function renderPage(entry = "/privacy") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <PrivacyPage />
    </MemoryRouter>,
  );
}

describe("the published privacy policy", () => {
  it("renders the server's title, version, effective date and sections, right to left", async () => {
    respondWith(POLICY);
    renderPage();

    expect(await screen.findByRole("heading", { level: 1, name: "سياسة اختبارية" })).toBeInTheDocument();
    const article = screen.getByRole("article");
    const headings = within(article).getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(["1. القسم الأول", "2. الاحتفاظ"]);

    expect(screen.getAllByText("9.0").length).toBeGreaterThan(0);
    const time = document.querySelector("time");
    expect(time).toHaveAttribute("dateTime", "2030-01-02");
    expect(time?.textContent).toMatch(/2030|٢٠٣٠/);
    expect(article.closest("[dir='rtl']")).not.toBeNull();
    expect(article).toHaveAttribute("lang", "ar");
  });

  it("renders policy text as text, never as markup", async () => {
    respondWith(POLICY);
    renderPage();

    await screen.findByRole("article");
    expect(screen.getByText("فقرة <img src=x onerror=alert(1)> تبقى نصًا.")).toBeInTheDocument();
    expect(document.querySelector("article img")).toBeNull();
  });

  it("links the privacy email with mailto and lists every section in the contents", async () => {
    respondWith(POLICY);
    renderPage();

    await screen.findByRole("article");
    expect(screen.getByRole("link", { name: "privacy@example.com" })).toHaveAttribute("href", "mailto:privacy@example.com");
    const nav = screen.getByRole("navigation", { name: "محتويات الوثيقة" });
    expect(within(nav).getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(["#first", "#retention"]);
  });

  it("asks the backend, at the public privacy-policy route", async () => {
    respondWith(POLICY);
    renderPage();
    await screen.findByRole("article");
    expect(requestMock).toHaveBeenCalledTimes(1);
  });

  it("shows no draft badge and no gap notes", async () => {
    respondWith(POLICY);
    renderPage();
    await screen.findByRole("article");
    expect(screen.queryByText(/مسودة/)).toBeNull();
    expect(screen.queryByText(/قيد التحديد/)).toBeNull();
  });
});

describe("when there is nothing to show", () => {
  it("shows a loading state while the request is in flight", () => {
    requestMock.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText("جارٍ تحميل سياسة الخصوصية…")).toBeInTheDocument();
    expect(screen.queryByRole("article")).toBeNull();
  });

  it("says plainly that no policy is published yet, and shows no text", async () => {
    requestMock.mockRejectedValue(new ApiError(404, ["not published"], "PRIVACY_POLICY_NOT_PUBLISHED"));
    renderPage();

    expect(await screen.findByRole("heading", { name: "سياسة الخصوصية لم تُنشر بعد" })).toBeInTheDocument();
    expect(screen.queryByRole("article")).toBeNull();
  });

  it("offers a retry after a failure, and renders the policy when the retry succeeds", async () => {
    const user = userEvent.setup();
    requestMock.mockRejectedValueOnce(new ApiError(0, ["Network error"]));
    renderPage();

    expect(await screen.findByRole("heading", { name: "تعذّر تحميل سياسة الخصوصية" })).toBeInTheDocument();
    expect(screen.queryByRole("article")).toBeNull();

    respondWith(POLICY);
    await user.click(screen.getByRole("button", { name: "إعادة المحاولة" }));

    expect(await screen.findByRole("article")).toBeInTheDocument();
    expect(requestMock).toHaveBeenCalledTimes(2);
  });

  it("treats a block type it does not know as a failure rather than dropping it", async () => {
    respondWith({
      ...POLICY,
      sections: [{ id: "x", number: "1", title: "t", blocks: [{ type: "html", text: "<b>x</b>" }] }],
    });
    renderPage();

    expect(await screen.findByRole("heading", { name: "تعذّر تحميل سياسة الخصوصية" })).toBeInTheDocument();
    expect(screen.queryByRole("article")).toBeNull();
  });
});

describe("deep links", () => {
  it("brings the section named in the fragment into view once it renders", async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    respondWith(POLICY);
    renderPage("/privacy#retention");

    await screen.findByRole("article");
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled());
    expect(document.activeElement?.id).toBe("retention");
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/shared/api";
import { submitContactRequest } from "../api/contact.api";
import { ContactForm } from "./contact-form";

/*
  Stubbed at the HTTP boundary, the way terms-page.test.tsx stubs getCurrentTermsRequest, so the
  hook, the service's envelope unwrapping and the component all run for real.
*/
vi.mock("../api/contact.api", () => ({
  submitContactRequest: vi.fn(),
}));

const requestMock = vi.mocked(submitContactRequest);

function renderForm() {
  return render(
    <MemoryRouter>
      <ContactForm />
    </MemoryRouter>,
  );
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("الاسم"), "سارة أحمد");
  await user.type(screen.getByLabelText("البريد الإلكتروني"), "sara@example.com");
  await user.type(screen.getByLabelText("الرسالة"), "متى تبدأ الدورة القادمة؟");
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("client-side validation", () => {
  it("refuses to submit an empty form and calls no API", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("button", { name: "إرسال الرسالة" }));

    expect(await screen.findByText("يُرجى كتابة اسمك.")).toBeInTheDocument();
    expect(screen.getByText("يُرجى كتابة بريدك الإلكتروني.")).toBeInTheDocument();
    expect(screen.getByText("يُرجى كتابة رسالتك.")).toBeInTheDocument();
    expect(requestMock).not.toHaveBeenCalled();
  });

  it("rejects a malformed email", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("الاسم"), "سارة أحمد");
    await user.type(screen.getByLabelText("البريد الإلكتروني"), "not-an-email");
    await user.type(screen.getByLabelText("الرسالة"), "رسالة تجريبية");
    await user.click(screen.getByRole("button", { name: "إرسال الرسالة" }));

    expect(await screen.findByText(/تحقّق من صيغة البريد الإلكتروني/)).toBeInTheDocument();
    expect(requestMock).not.toHaveBeenCalled();
  });
});

describe("a successful submission", () => {
  it("sends the trimmed fields and shows the success screen", async () => {
    requestMock.mockResolvedValue({
      status: 200,
      data: { status: "success", data: { message: "وصلتنا رسالتك." } },
    } as Awaited<ReturnType<typeof submitContactRequest>>);
    const user = userEvent.setup();
    renderForm();

    await fillValidForm(user);
    await user.selectOptions(screen.getByLabelText("نوع الاستفسار"), "الدورات");
    await user.click(screen.getByRole("button", { name: "إرسال الرسالة" }));

    expect(await screen.findByRole("status")).toHaveTextContent("وصلتنا رسالتك");
    expect(requestMock).toHaveBeenCalledWith({
      name: "سارة أحمد",
      email: "sara@example.com",
      topic: "الدورات",
      message: "متى تبدأ الدورة القادمة؟",
    });
  });

  it("returns to a blank form when starting another message", async () => {
    requestMock.mockResolvedValue({
      status: 200,
      data: { status: "success", data: { message: "وصلتنا رسالتك." } },
    } as Awaited<ReturnType<typeof submitContactRequest>>);
    const user = userEvent.setup();
    renderForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "إرسال الرسالة" }));
    await screen.findByRole("status");

    await user.click(screen.getByRole("button", { name: "إرسال رسالة أخرى" }));

    expect(screen.getByLabelText("الاسم")).toHaveValue("");
  });
});

describe("a failed submission", () => {
  it("keeps the typed text and shows a failure banner instead of a false success", async () => {
    requestMock.mockRejectedValue(new ApiError(503, ["مشكلة مؤقتة"]));
    const user = userEvent.setup();
    renderForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "إرسال الرسالة" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("تعذّر إرسال رسالتك الآن");
    expect(screen.getByLabelText("الاسم")).toHaveValue("سارة أحمد");
    expect(screen.getByLabelText("البريد الإلكتروني")).toHaveValue("sara@example.com");
    expect(screen.getByLabelText("الرسالة")).toHaveValue("متى تبدأ الدورة القادمة؟");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("while a submission is in flight", () => {
  it("disables the submit button so a second click cannot fire twice", async () => {
    let resolveRequest!: (value: Awaited<ReturnType<typeof submitContactRequest>>) => void;
    requestMock.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const user = userEvent.setup();
    renderForm();

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "إرسال الرسالة" }));

    const submitting = await screen.findByRole("button", { name: /جارٍ الإرسال/ });
    expect(submitting).toBeDisabled();

    resolveRequest({ status: 200, data: { status: "success", data: { message: "وصلتنا رسالتك." } } } as Awaited<
      ReturnType<typeof submitContactRequest>
    >);
    expect(await screen.findByRole("status")).toBeInTheDocument();
    expect(requestMock).toHaveBeenCalledTimes(1);
  });
});

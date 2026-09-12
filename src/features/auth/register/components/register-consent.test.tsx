import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentTerms } from "@/features/legal/terms/services/terms.service";
import { ApiError } from "@/shared/api";
import { RegisterPage } from "../pages/register-page";
import { registerUser } from "../services/register.service";

/*
  Both halves of the consent are stubbed at the service boundary, so the real hooks run:
  the version really is fetched, really is sent, and really is re-fetched after a 409.
*/
vi.mock("@/features/legal/terms/services/terms.service", () => ({
  getCurrentTerms: vi.fn(),
}));

vi.mock("../services/register.service", () => ({
  registerUser: vi.fn(),
}));

const getCurrentTermsMock = vi.mocked(getCurrentTerms);
const registerUserMock = vi.mocked(registerUser);

/** The approved wording. Written out here so a reword in the source fails a test. */
const CONSENT_LABEL = "قرأت الشروط والأحكام وأوافق عليها";
const CONSENT_ERROR = "يجب الموافقة على الشروط والأحكام لإتمام إنشاء الحساب.";
const LINK_TEXT = "الشروط والأحكام";
const SUBMIT = "إنشاء الحساب";

const CURRENT = { version: "1.0", effectiveDate: "2026-09-07", effectiveDateLabel: "٧ سبتمبر ٢٠٢٦" };

beforeEach(() => {
  getCurrentTermsMock.mockResolvedValue(CURRENT);
  registerUserMock.mockResolvedValue({ message: "تم" });
});

afterEach(() => {
  vi.clearAllMocks();
});

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={["/register"]}>
      <RegisterPage />
    </MemoryRouter>,
  );
}

/** The form, reached the way a browser reaches it rather than by test id. */
function formElement(): HTMLFormElement {
  const form = screen.getByRole("button", { name: SUBMIT }).closest("form");
  if (!form) throw new Error("register form not found");
  return form;
}

/*
  Addressed by placeholder rather than by label: `FormField` renders its `<label>` with no
  `htmlFor` and the input outside it, so there is no label association to query. Fixing that
  is a change to every auth screen and does not belong in this one.
*/
const NAME_FIELD = "أدخل اسمك الكامل";
const EMAIL_FIELD = "example@manara.com";

async function fillIdentity() {
  await userEvent.type(screen.getByPlaceholderText(NAME_FIELD), "سارة");
  await userEvent.type(screen.getByPlaceholderText(EMAIL_FIELD), "sara@manara.com");
  await userEvent.type(screen.getByPlaceholderText("15 حرفاً على الأقل"), "sunlit harbour lantern 42");
  await userEvent.type(screen.getByPlaceholderText("أعد إدخال كلمة المرور"), "sunlit harbour lantern 42");
}

/** Waits for the version fetch to land, which is what unlocks the submit button. */
async function termsLoaded() {
  await waitFor(() => expect(getCurrentTermsMock).toHaveBeenCalled());
}

describe("the consent checkbox", () => {
  it("starts unchecked — a pre-ticked box is not a consent", async () => {
    renderRegister();
    await termsLoaded();

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it("reads exactly the approved sentence, with the terms as a link inside it", async () => {
    renderRegister();
    await termsLoaded();

    // The accessible name is borrowed from the span through `aria-labelledby`, so this is
    // also the name a screen reader announces.
    const checkbox = screen.getByRole("checkbox", { name: CONSENT_LABEL });

    // ...and the same sentence is what is actually on screen, link included.
    const labelId = checkbox.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)).toHaveTextContent(CONSENT_LABEL);

    const link = screen.getByRole("link", { name: LINK_TEXT });
    expect(link).toHaveAttribute("href", "/terms");
    // A new tab, so a half-filled form survives being sent off to read the terms.
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("keeps the submit button disabled until it is ticked", async () => {
    renderRegister();
    await termsLoaded();

    const submit = screen.getByRole("button", { name: SUBMIT });
    await waitFor(() => expect(submit).toBeDisabled());

    await userEvent.click(screen.getByRole("checkbox"));

    expect(screen.getByRole("checkbox")).toBeChecked();
    await waitFor(() => expect(submit).toBeEnabled());
  });

  /*
    The regression this whole markup shape exists to prevent. With a `<label htmlFor>` — or
    a label wrapping the text — clicking through to read the terms silently ticks the box,
    so the user agrees to a document by opening it.
  */
  it("is not toggled by opening the terms link", async () => {
    renderRegister();
    await termsLoaded();

    // jsdom would try to follow the hyperlink; a capture-phase listener stops the
    // navigation without interfering with the anchor's own handler.
    const swallowNavigation = (event: Event) => event.preventDefault();
    document.addEventListener("click", swallowNavigation, true);

    try {
      await userEvent.click(screen.getByRole("link", { name: LINK_TEXT }));
    } finally {
      document.removeEventListener("click", swallowNavigation, true);
    }

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
});

describe("submitting without consent", () => {
  /*
    Submitted around the disabled button on purpose. The button is an affordance; the
    submit handler is the rule, and this is the path that proves the rule is there.
  */
  it("shows the exact inline error and sends nothing", async () => {
    renderRegister();
    await termsLoaded();
    await fillIdentity();

    fireEvent.submit(formElement());

    expect(await screen.findByText(CONSENT_ERROR)).toBeInTheDocument();
    expect(registerUserMock).not.toHaveBeenCalled();
  });

  it("points the checkbox at that error and marks it invalid", async () => {
    renderRegister();
    await termsLoaded();
    await fillIdentity();

    fireEvent.submit(formElement());

    const error = await screen.findByText(CONSENT_ERROR);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox.getAttribute("aria-describedby")?.split(" ")).toContain(error.id);
  });

  it("clears the complaint once the box is ticked", async () => {
    renderRegister();
    await termsLoaded();
    await fillIdentity();
    fireEvent.submit(formElement());
    await screen.findByText(CONSENT_ERROR);

    await userEvent.click(screen.getByRole("checkbox"));

    expect(screen.queryByText(CONSENT_ERROR)).not.toBeInTheDocument();
  });
});

describe("sending the consent", () => {
  it("sends the acceptance together with the version the server named", async () => {
    renderRegister();
    await termsLoaded();
    await fillIdentity();
    await userEvent.click(screen.getByRole("checkbox"));

    await userEvent.click(screen.getByRole("button", { name: SUBMIT }));

    await waitFor(() =>
      expect(registerUserMock).toHaveBeenCalledWith({
        fullName: "سارة",
        email: "sara@manara.com",
        password: "sunlit harbour lantern 42",
        termsAccepted: true,
        termsVersion: "1.0",
      }),
    );
  });

  it("refuses to register at all when the current version is unknown", async () => {
    getCurrentTermsMock.mockRejectedValue(new ApiError(503, ["down"], "TERMS_UNAVAILABLE"));
    renderRegister();
    await termsLoaded();
    await fillIdentity();
    await userEvent.click(screen.getByRole("checkbox"));

    // Ticked, but there is no version to tick *against* — so no request, and no guess.
    fireEvent.submit(formElement());

    await waitFor(() => expect(screen.getByRole("button", { name: SUBMIT })).toBeDisabled());
    expect(registerUserMock).not.toHaveBeenCalled();
  });
});

describe("when the terms change while the form is open", () => {
  const outdated = new ApiError(409, ["الشروط تغيّرت"], "TERMS_VERSION_OUTDATED");

  it("withdraws the acceptance but keeps what the user typed", async () => {
    registerUserMock.mockRejectedValue(outdated);
    renderRegister();
    await termsLoaded();
    await fillIdentity();
    await userEvent.click(screen.getByRole("checkbox"));

    await userEvent.click(screen.getByRole("button", { name: SUBMIT }));

    // Consent is to a specific text. The new version has not been read, so it is unticked.
    await waitFor(() => expect(screen.getByRole("checkbox")).not.toBeChecked());
    // Nothing the user typed is thrown away over our timing.
    expect(screen.getByPlaceholderText(NAME_FIELD)).toHaveValue("سارة");
    expect(screen.getByPlaceholderText(EMAIL_FIELD)).toHaveValue("sara@manara.com");
  });

  it("explains what happened and offers the current text", async () => {
    registerUserMock.mockRejectedValue(outdated);
    renderRegister();
    await termsLoaded();
    await fillIdentity();
    await userEvent.click(screen.getByRole("checkbox"));

    await userEvent.click(screen.getByRole("button", { name: SUBMIT }));

    const notice = await screen.findByRole("alert");
    expect(notice).toHaveTextContent(/تم تحديث الشروط والأحكام/);
    expect(
      screen.getByRole("link", { name: "اقرأ النسخة الحالية من الشروط والأحكام" }),
    ).toHaveAttribute("href", "/terms");
  });

  it("re-asks the server which version is now current", async () => {
    registerUserMock.mockRejectedValue(outdated);
    renderRegister();
    await termsLoaded();
    await fillIdentity();
    await userEvent.click(screen.getByRole("checkbox"));

    expect(getCurrentTermsMock).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole("button", { name: SUBMIT }));

    await waitFor(() => expect(getCurrentTermsMock).toHaveBeenCalledTimes(2));
  });
});

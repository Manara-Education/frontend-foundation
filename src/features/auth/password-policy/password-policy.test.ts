import { describe, expect, it } from "vitest";
import { ApiError } from "@/shared/api";
import {
  PASSWORD_REQUIREMENTS,
  PASSWORD_TOO_LONG_MESSAGE,
  evaluatePassword,
  passwordPolicyError,
  passwordRefusal,
} from "./password-policy";

/*
  The server's Arabic wording, written out as backend `PasswordPolicyTest` writes it out: a reword on
  either side fails a test on that side, and has to be carried to the other.
*/
const SERVER_WORDING = {
  minimumLength: "يجب أن تتكون كلمة المرور من 15 حرفًا على الأقل.",
  hasUppercase: "يجب أن تحتوي كلمة المرور على حرف إنجليزي كبير واحد على الأقل.",
  hasNumber: "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل.",
  hasSymbol: "يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل.",
} as const;
const SERVER_TOO_LONG = "كلمة المرور طويلة جدًا. يرجى اختيار كلمة مرور أقصر.";

describe("the four password requirements", () => {
  it("are listed in the server's order, with the approved labels", () => {
    expect(PASSWORD_REQUIREMENTS.map((r) => r.id)).toEqual(["minimumLength", "hasUppercase", "hasNumber", "hasSymbol"]);
    expect(PASSWORD_REQUIREMENTS.map((r) => r.label)).toEqual([
      "15 حرفًا على الأقل",
      "حرف إنجليزي كبير واحد على الأقل",
      "رقم واحد على الأقل",
      "رمز خاص واحد على الأقل",
    ]);
  });

  it("refuse in the words the server uses", () => {
    for (const requirement of PASSWORD_REQUIREMENTS) {
      expect(requirement.message).toBe(SERVER_WORDING[requirement.id]);
    }
    expect(PASSWORD_TOO_LONG_MESSAGE).toBe(SERVER_TOO_LONG);
  });

  it("report each requirement on its own while typing", () => {
    expect(evaluatePassword("")).toEqual({
      minimumLength: false,
      hasUppercase: false,
      hasNumber: false,
      hasSymbol: false,
    });
    expect(evaluatePassword("harbour lights at dusk 7")).toEqual({
      minimumLength: true,
      hasUppercase: false,
      hasNumber: true,
      hasSymbol: false,
    });
  });

  it.each([
    ["no upper-case letter or symbol", "password123456789", SERVER_WORDING.hasUppercase],
    ["no symbol", "PASSWORD123456789", SERVER_WORDING.hasSymbol],
    ["no symbol, though mixed case", "PasswordPassword1", SERVER_WORDING.hasSymbol],
    ["no upper-case letter or digit", "abcdefghijklmno!", SERVER_WORDING.hasUppercase],
    ["no digit", "Harbour lights at dusk!", SERVER_WORDING.hasNumber],
    ["fewer than 15 characters", "Short 1!", SERVER_WORDING.minimumLength],
  ])("refuse a password with %s", (_, password, message) => {
    expect(passwordPolicyError(password)).toBe(message);
  });

  it("accept one of each, with nothing else required", () => {
    expect(passwordPolicyError("ExamplePassword1!")).toBeUndefined();
    expect(passwordPolicyError("SecureAccount2026#")).toBeUndefined();
    expect(passwordPolicyError("NO LOWER CASE 1!")).toBeUndefined();
  });

  it("count any punctuation or symbol, in any script, but not a space", () => {
    for (const symbol of ["_", "؟", "€", "😀"]) {
      expect(passwordPolicyError(`Harbour lights 7${symbol}`)).toBeUndefined();
    }
    expect(passwordPolicyError("Harbour lights at dusk 7")).toBe(SERVER_WORDING.hasSymbol);
  });

  it("mean A to Z and 0 to 9, and still allow Arabic letters", () => {
    expect(passwordPolicyError("Ｈarbour lights 7 at dusk!")).toBe(SERVER_WORDING.hasUppercase);
    expect(passwordPolicyError("Harbour lights ٣ at dusk!")).toBe(SERVER_WORDING.hasNumber);
    expect(passwordPolicyError("نخيل البحر يغني Q7!")).toBeUndefined();
  });

  it("count characters as the server does, an emoji as one", () => {
    expect("River stone 1😀".length).toBe(15);
    expect(passwordPolicyError("River stone 1😀")).toBe(SERVER_WORDING.minimumLength);
    expect(passwordPolicyError("River stone 1😀😀")).toBeUndefined();
  });
});

describe("the ceiling", () => {
  it("refuses what the server cannot store, at the same point the server does", () => {
    expect(passwordPolicyError("ب".repeat(34) + "A1!?")).toBeUndefined();
    expect(passwordPolicyError("ب".repeat(35) + "A1!?")).toBe(PASSWORD_TOO_LONG_MESSAGE);
    expect(passwordPolicyError("Lanterns drift past the quiet harbour wall every single evening at 7 pm!")).toBeUndefined();
    expect(passwordPolicyError("Lanterns drift past the quiet harbour wall every single evening at 7 pm!!")).toBe(
      PASSWORD_TOO_LONG_MESSAGE,
    );
  });
});

describe("what a person is shown", () => {
  it("names no storage, encoding or hashing detail", () => {
    const shown = [
      ...PASSWORD_REQUIREMENTS.flatMap((requirement) => [requirement.label, requirement.message]),
      PASSWORD_TOO_LONG_MESSAGE,
    ].join("\n");

    expect(shown).not.toMatch(/byte|بايت|UTF|bcrypt|hash|encod|ترميز|72/i);
  });
});

describe("the server's refusal", () => {
  it("is the named field's error, without the field name", () => {
    const error = new ApiError(400, [
      "email: البريد الإلكتروني غير صحيح",
      "newPassword: كلمة المرور هذه شائعة وسهلة التخمين. يرجى اختيار كلمة مرور أخرى.",
    ]);

    expect(passwordRefusal(error, "newPassword")).toBe("كلمة المرور هذه شائعة وسهلة التخمين. يرجى اختيار كلمة مرور أخرى.");
    expect(passwordRefusal(error, "password")).toBeUndefined();
  });
});

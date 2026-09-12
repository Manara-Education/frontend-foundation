import { describe, expect, it } from "vitest";
import {
  PASSWORD_TOO_LONG_MESSAGE,
  PASSWORD_TOO_SHORT_MESSAGE,
  passwordByteCount,
  passwordCharacterCount,
  passwordLengthError,
  passwordLengthMeter,
} from "./password-policy";

describe("password length rules", () => {
  it("counts code points, not UTF-16 units", () => {
    expect("river stone 😀😀".length).toBe(16);
    expect(passwordCharacterCount("river stone 😀😀")).toBe(14);
    expect(passwordLengthError("river stone 😀😀")).toBe(PASSWORD_TOO_SHORT_MESSAGE);
    expect(passwordLengthError("river stone 😀😀😀")).toBeUndefined();
  });

  it("allows 72 UTF-8 bytes and refuses 73: 36 Arabic letters fit, 37 do not", () => {
    expect(passwordByteCount("ب".repeat(36))).toBe(72);
    expect(passwordLengthError("ب".repeat(36))).toBeUndefined();
    expect(passwordLengthError("ب".repeat(37))).toBe(PASSWORD_TOO_LONG_MESSAGE);
    expect(passwordLengthError("a".repeat(73))).toBe(PASSWORD_TOO_LONG_MESSAGE);
  });

  it("accepts spaces and requires no upper case, digit or symbol", () => {
    expect(passwordLengthError("harbour lights at dusk")).toBeUndefined();
    expect(passwordLengthError("نخيل البحر يغني")).toBeUndefined();
  });
});

describe("password length meter", () => {
  it("shows nothing for an empty field", () => {
    expect(passwordLengthMeter("")).toBeNull();
  });

  it("reports how far a short password is from the minimum, whatever its composition", () => {
    expect(passwordLengthMeter("Aa1!Aa1!Aa1!")?.label).toContain("12 من 15");
  });

  it("rates on length alone", () => {
    expect(passwordLengthMeter("harbour lights ok")?.label).toBe("الطول كافٍ");
    expect(passwordLengthMeter("harbour lights at dusk")?.label).toBe("طول جيد");
    expect(passwordLengthMeter("ب".repeat(37))?.label).toContain("72");
  });
});

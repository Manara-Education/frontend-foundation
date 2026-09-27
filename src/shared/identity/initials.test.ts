import { describe, expect, it } from "vitest";
import { initialsOf } from "./initials";

describe("initials", () => {
  it("takes the first letters of the first and last names", () => {
    expect(initialsOf("سارة أحمد")).toBe("سأ");
    expect(initialsOf("  ليلى   حسن ")).toBe("لح");
  });

  it("skips the Arabic article on the last name", () => {
    expect(initialsOf("ريم عبد الرحمن الشريف")).toBe("رش");
    expect(initialsOf("علي آل")).toBe("عآ");
  });

  it("does not split a surrogate pair and never returns an empty circle", () => {
    expect(initialsOf("😀 Smile")).toBe("😀S");
    expect(initialsOf("   ")).toBe("؟");
    expect(initialsOf(null)).toBe("؟");
  });
});

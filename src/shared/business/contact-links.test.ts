import { describe, expect, it } from "vitest";
import { egyptianPhone, mailtoHref, telHref } from "./contact-links";

describe("mailtoHref", () => {
  it("links one mailbox", () => {
    expect(mailtoHref("support@example.eg")).toBe("mailto:support@example.eg");
    expect(mailtoHref("  help.desk+refunds@example.com.eg ")).toBe("mailto:help.desk+refunds@example.com.eg");
  });

  it.each([
    "",
    "support",
    "support@",
    "@example.eg",
    "support@example",
    "a@example.eg,b@example.eg",
    "support@example.eg?subject=refund",
    "Support <support@example.eg>",
    "javascript:alert(1)//@example.eg",
    "mailto:support@example.eg",
  ])("refuses %j", (value) => {
    expect(mailtoHref(value)).toBeNull();
  });
});

describe("egyptianPhone", () => {
  it.each([
    ["010 1234 5678", "+201012345678", "+20 10 1234 5678"],
    ["+20 11 2345 6789", "+201123456789", "+20 11 2345 6789"],
    ["00201212345678", "+201212345678", "+20 12 1234 5678"],
    ["0155-123-4567", "+201551234567", "+20 15 5123 4567"],
    ["(02) 2345 6789", "+20223456789", "+20 2 2345 6789"],
    ["+20 3 4567890", "+2034567890", "+20 3 456 7890"],
    ["040 1234567", "+20401234567", "+20 40 123 4567"],
    ["095 2345678", "+20952345678", "+20 95 234 5678"],
    ["19999", "19999", "19999"],
    ["16123", "16123", "16123"],
  ])("reads %j", (raw, dial, display) => {
    expect(egyptianPhone(raw)).toEqual({ dial, display });
  });

  it.each([
    "",
    "12345",
    "0101234567",
    "01312345678",
    "020 1234567",
    "0412345678",
    "+1 202 555 0100",
    "+44 20 7946 0958",
    "010 1234 567a",
    "tel:+201012345678",
    "0020",
  ])("refuses %j", (raw) => {
    expect(egyptianPhone(raw)).toBeNull();
  });
});

describe("telHref", () => {
  it("dials the international form, or a hotline as written", () => {
    expect(telHref("010 1234 5678")).toBe("tel:+201012345678");
    expect(telHref("19999")).toBe("tel:19999");
    expect(telHref("+1 202 555 0100")).toBeNull();
  });
});

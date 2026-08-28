import { describe, expect, it } from "vitest";
import { RICH_CONTENT_STYLES } from "@/shared/rich-content/components/rich-content.styles";
import { richListStyles } from "@/shared/rich-content/components/rich-list.styles";
import { RICH_EDITOR_STYLES } from "./rich-content-editor.styles";

/**
 * That the two surfaces draw a list the same way.
 *
 * The instructor's editing surface and the student's renderer have separate stylesheets, and the
 * bug this guards against is what happens when list rules live in both: one gets fixed. Here they
 * come from one function, and this is the test that says so — if someone restates a marker or an
 * indent locally, the shared block stops matching and this fails.
 */

describe("the shared list stylesheet", () => {
  it("is the source of the list rules on both surfaces", () => {
    expect(RICH_CONTENT_STYLES).toContain(richListStyles(".mrc"));
    expect(RICH_EDITOR_STYLES).toContain(richListStyles(".mrce-surface"));
  });

  it("restores the markers the app's CSS reset removes, on both surfaces", () => {
    // Tailwind's preflight sets `list-style: none` on every ul and ol. Restating the type inside
    // the content containers is what makes an authored list visible without turning bullets on
    // down the side of every menu and card list in the product.
    for (const scope of [".mrc", ".mrce-surface"]) {
      const sheet = scope === ".mrc" ? RICH_CONTENT_STYLES : RICH_EDITOR_STYLES;
      expect(sheet).toContain(`${scope} ul { list-style-type: disc; }`);
      expect(sheet).toContain(`${scope} ol { list-style-type: decimal; }`);
    }
  });

  it("scopes every rule to the container holding authored content", () => {
    // A bare `ul { list-style-type: disc }` would fix the lesson body and put bullets down the side
    // of the navigation. Every selector the layer emits has to start at the scope it was given.
    const rules = richListStyles(".mrc")
      .split("}")
      .map((chunk) => chunk.split("{")[0])
      // Drop the comment blocks between rules; what is left is the selectors.
      .map((selector) => selector.replace(/\/\*[\s\S]*?\*\//g, "").trim())
      .filter((selector) => selector !== "");

    expect(rules.length).toBeGreaterThan(0);
    for (const selector of rules) {
      for (const part of selector.split(",")) {
        expect(part.trim().startsWith(".mrc")).toBe(true);
      }
    }
  });

  it("places markers logically, so they follow the reading direction", () => {
    // Declarations only — the comments around them name the physical properties in order to
    // explain why they are not used.
    const declarations = richListStyles(".mrc").replace(/\/\*[\s\S]*?\*\//g, "");

    // What makes an Arabic list's markers sit on the right and an English list's on the left,
    // without either direction being named.
    expect(declarations).toContain("padding-inline-start");
    expect(declarations).not.toContain("padding-left");
    expect(declarations).not.toContain("margin-left");
    expect(declarations).not.toContain("padding-right");
    expect(declarations).not.toContain("margin-right");
  });
});

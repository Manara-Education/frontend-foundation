import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { PublicHeader } from "./public-header";

function renderAt(path: string) {
  const router = createMemoryRouter([{ path: "*", element: <PublicHeader /> }], { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

describe("the shared public header", () => {
  it("links home, courses, about and contact", () => {
    renderAt("/about");

    expect(screen.getByRole("link", { name: "الرئيسية" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "الدورات" })).toHaveAttribute("href", "/#courses");
    expect(screen.getByRole("link", { name: "عن منارة" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("link", { name: "تواصل معنا" })).toHaveAttribute("href", "/contact");
  });

  it("marks the current page and no other", () => {
    renderAt("/contact");

    expect(screen.getByRole("link", { name: "تواصل معنا" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "عن منارة" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "الرئيسية" })).not.toHaveAttribute("aria-current");
  });

  it("never marks the courses anchor as the current page", () => {
    renderAt("/");

    expect(screen.getByRole("link", { name: "الدورات" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "الرئيسية" })).toHaveAttribute("aria-current", "page");
  });
});

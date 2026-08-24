import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Each test gets a clean document; a player left mounted would keep its message listener
// registered and hear the next test's events.
afterEach(() => {
  cleanup();
});

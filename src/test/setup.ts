import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Each test gets a clean document; a player left mounted would keep its message listener
// registered and hear the next test's events.
afterEach(() => {
  cleanup();
});

/*
  jsdom implements no scrolling API on elements at all — not `scrollTo`, not `scrollIntoView`.
  Any component that scrolls its own container therefore throws on mount under test, and
  because React Router catches render errors in its default ErrorBoundary, what a test
  actually sees is not the exception but an empty tree and a bewildering "unable to find
  role" failure several assertions later.

  These are no-ops rather than fakes. Nothing here can assert *that* something scrolled;
  they exist so that scrolling does not prevent a component from mounting.
*/
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
if (!window.scrollTo) {
  window.scrollTo = () => {};
}

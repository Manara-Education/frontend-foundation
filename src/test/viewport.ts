import { afterEach } from "vitest";

/**
 * A working `matchMedia` for jsdom, so a component's responsive branch can be tested.
 *
 * jsdom implements no `matchMedia` at all, which means any component that asks "am I on a
 * phone" throws under test. That is why the responsive branches in this codebase have
 * never had a test: there was no way to be at a width.
 *
 * This does not lay anything out — jsdom has no layout engine, and a test here can never
 * tell you a card overflowed. What it *can* pin down is the decision: at 375px the shell
 * renders a drawer and a menu button; at 1280px it renders the sidebar. That is the part
 * that regresses silently when someone edits a breakpoint, and it is worth locking.
 *
 * Overflow itself is checked in the browser, against the mock API — see
 * `tools/mock-api/README.md`.
 *
 *     setViewport(375);
 *     render(<AppLayout />);
 *     expect(screen.getByRole("button", { name: /القائمة/ })).toBeInTheDocument();
 */

/** Parses the `(min-width: 768px)` / `(max-width: 767px)` forms this codebase uses. */
function evaluate(query: string, width: number): boolean {
  const min = /\(min-width:\s*(\d+(?:\.\d+)?)px\)/.exec(query);
  const max = /\(max-width:\s*(\d+(?:\.\d+)?)px\)/.exec(query);
  if (min && width < Number(min[1])) return false;
  if (max && width > Number(max[1])) return false;
  return Boolean(min || max);
}

let listeners: Array<() => void> = [];

export function setViewport(width: number): void {
  Object.defineProperty(window, "innerWidth", { value: width, writable: true, configurable: true });

  window.matchMedia = ((query: string) => {
    const mql = {
      media: query,
      get matches() {
        return evaluate(query, window.innerWidth);
      },
      onchange: null,
      addEventListener: (_: string, cb: () => void) => void listeners.push(cb),
      removeEventListener: (_: string, cb: () => void) => {
        listeners = listeners.filter((l) => l !== cb);
      },
      // Deprecated pair, kept because `useSyncExternalStore` shims and older
      // libraries still reach for them and would otherwise throw.
      addListener: (cb: () => void) => void listeners.push(cb),
      removeListener: (cb: () => void) => {
        listeners = listeners.filter((l) => l !== cb);
      },
      dispatchEvent: () => true,
    };
    return mql as unknown as MediaQueryList;
  }) as typeof window.matchMedia;

  listeners.forEach((l) => l());
}

/** Resizes an already-rendered tree, so a test can cross a breakpoint mid-test. */
export function resizeViewport(width: number): void {
  setViewport(width);
  window.dispatchEvent(new Event("resize"));
}

afterEach(() => {
  listeners = [];
});

/** The widths the responsive acceptance criteria name. */
export const VIEWPORTS = {
  smallPhone: 320,
  phone: 375,
  largePhone: 430,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
} as const;

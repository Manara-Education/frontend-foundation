import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_DIRECTION,
  readDocumentDirection,
  type LayoutDirection,
} from "./layout-direction";

/*
  `null` rather than a direction, so "no provider" is distinguishable from "a provider that
  chose RTL". Without a provider the document is the authority, which is what makes this
  work in the running application without anything having to be wired up at the root.
*/
const DirectionContext = createContext<LayoutDirection | null>(null);

/**
 * Declares the direction a subtree lays out in.
 *
 * The application does not need this: `readDocumentDirection` already reads
 * `<html dir="rtl">`, so the shell is correct without a provider anywhere. What this is for
 * is the two cases where the document cannot answer — a test that needs to render the shell
 * in LTR, and any future subtree that genuinely runs the other way round.
 *
 * It renders no element of its own. A direction that nothing puts in the DOM would leave
 * every logical CSS property resolving against the document instead, so whoever consumes
 * `useDirection` is expected to put it on an element — which the shell does, on its root.
 */
export function DirectionProvider({
  direction,
  children,
}: {
  direction: LayoutDirection;
  children: ReactNode;
}) {
  return <DirectionContext.Provider value={direction}>{children}</DirectionContext.Provider>;
}

/*
  Module scope, because `useSyncExternalStore` re-subscribes whenever `subscribe` changes
  identity — a new function every render would tear down and rebuild the observer on every
  render.
*/
function subscribe(onStoreChange: () => void): () => void {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
  return () => observer.disconnect();
}

/**
 * The document's own direction, kept in step with `<html dir>`.
 *
 * `useSyncExternalStore` for the same reason `useMediaQuery` uses it: the value is read
 * during render, so the first paint is already in the right direction. A drawer that
 * mounted LTR and corrected itself in an effect would animate in from the wrong edge once
 * on every load, which is precisely the defect being fixed.
 */
export function useDocumentDirection(): LayoutDirection {
  return useSyncExternalStore(subscribe, readDocumentDirection, () => DEFAULT_DIRECTION);
}

/**
 * The direction this subtree lays out in — the nearest {@link DirectionProvider}, or the
 * document.
 *
 * This is the single input the navigation shell derives its side from. `start` is the right
 * in RTL and the left in LTR; nothing in the shell should be asking "is this Arabic".
 */
export function useDirection(): LayoutDirection {
  const provided = useContext(DirectionContext);
  const documentDirection = useDocumentDirection();
  return provided ?? documentDirection;
}

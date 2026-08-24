import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const SUFFIX = "منارة";

type SetOverride = (title: string | undefined) => void;

const TitleOverrideContext = createContext<SetOverride | null>(null);

/**
 * Owns `document.title` for the whole application.
 *
 * The title normally comes from the matched route's own metadata, passed in here. What the
 * override exists for is the case where the matched route is not what ended up on screen —
 * a role guard answering with a refusal, for instance. Without it the tab would go on
 * naming a page the visitor was never shown.
 */
export function DocumentTitleProvider({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const [override, setOverride] = useState<string | undefined>();
  const effective = override ?? title;

  useEffect(() => {
    document.title = effective ? `${effective} | ${SUFFIX}` : SUFFIX;
  }, [effective]);

  return (
    <TitleOverrideContext.Provider value={setOverride}>{children}</TitleOverrideContext.Provider>
  );
}

/**
 * Claims the document title for as long as the calling component is mounted, handing it
 * back to the route's own metadata on unmount.
 */
export function useDocumentTitleOverride(title: string): void {
  const setOverride = useContext(TitleOverrideContext);

  useEffect(() => {
    if (!setOverride) return;
    setOverride(title);
    return () => setOverride(undefined);
  }, [setOverride, title]);
}

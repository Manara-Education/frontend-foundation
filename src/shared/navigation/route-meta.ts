import { useMemo } from "react";
import { useMatches } from "react-router";
import type { NavSectionId } from "./paths";

/**
 * What a route declares about itself.
 *
 * The shell reads this rather than inspecting the URL: the page heading, the document
 * title and — most importantly — which primary navigation entry stays lit all come from
 * the route that is actually matched. A nested page such as
 * `/instructor/courses/:courseId/:tab` names `instructor-courses` as its section, so the
 * sidebar keeps "دوراتي" active without anyone writing `pathname.includes("course")`.
 */
export interface RouteHandle {
  /** Page heading, and the document title. */
  title?: string;
  /** The line under the heading. */
  subtitle?: string;
  /** The primary navigation entry this route belongs to. */
  section?: NavSectionId;
  /** Reading-column width for the shell. `"full"` lets the page lay itself out. */
  contentWidth?: number | "full";
  /**
   * Route params that identify a view *inside* the page rather than the page itself.
   * They are left out of the shell's transition key, so switching the course editor's
   * tab does not fade the whole screen — only the tab panel changes.
   */
  volatileParams?: readonly string[];
}

export interface ResolvedRouteMeta {
  title?: string;
  subtitle?: string;
  section?: NavSectionId;
  contentWidth: number | "full";
  /** Changes exactly when the shell should play its page transition. */
  transitionKey: string;
}

const DEFAULT_CONTENT_WIDTH = 860;

/**
 * Folds the `handle` of every matched route into one answer, deepest match winning.
 */
export function useRouteMeta(): ResolvedRouteMeta {
  const matches = useMatches();

  return useMemo(() => {
    let title: string | undefined;
    let subtitle: string | undefined;
    let section: NavSectionId | undefined;
    let contentWidth: number | "full" = DEFAULT_CONTENT_WIDTH;
    let volatileParams: readonly string[] = [];

    for (const match of matches) {
      const handle = match.handle as RouteHandle | undefined;
      if (!handle) continue;
      if (handle.title !== undefined) title = handle.title;
      if (handle.subtitle !== undefined) subtitle = handle.subtitle;
      if (handle.section !== undefined) section = handle.section;
      if (handle.contentWidth !== undefined) contentWidth = handle.contentWidth;
      if (handle.volatileParams !== undefined) volatileParams = handle.volatileParams;
    }

    const leaf = matches[matches.length - 1];
    const volatile = new Set(volatileParams);
    const identity = Object.entries(leaf?.params ?? {})
      .filter(([name]) => !volatile.has(name))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, value]) => `${name}=${value ?? ""}`)
      .join("&");

    return {
      title,
      subtitle,
      section,
      contentWidth,
      transitionKey: `${leaf?.id ?? "root"}|${identity}`,
    };
  }, [matches]);
}

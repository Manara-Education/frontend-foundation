import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { bannerCarouselService } from "../services/banner-carousel.service";
import type { StudentBanner } from "../types/banner-carousel.types";

const AUTO_ADVANCE_MS = 6000;

/**
 * The learner's banner carousel: what to show, which one is showing, and how it advances.
 *
 * A failed load leaves the carousel with nothing and says nothing. That is deliberate — a
 * promotion is the least important thing on the screen it sits above, and an error strip
 * where an advert failed would cost the learner more attention than the advert was worth.
 * The courses below it are unaffected either way.
 *
 * `ONCE_PER_STUDENT` banners are already gone by the time they get here: the server subtracts
 * what this learner has permanently refused. `ONCE_PER_SESSION` is subtracted here, from the
 * tab's own note. `EVERY_VISIT` is always shown, which is what it means.
 */
export function useStudentBanners() {
  const [banners, setBanners] = useState<StudentBanner[]>([]);
  const [isResolved, setIsResolved] = useState(false);
  const [sessionDismissed, setSessionDismissed] = useState<number[]>(() =>
    bannerCarouselService.getSessionDismissedIds(),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    bannerCarouselService
      .loadActiveBanners()
      .then((loaded) => {
        if (!cancelled) setBanners(loaded);
      })
      .catch((err) => {
        // Never surfaced: a banner that fails to load is simply not there.
        console.error("Failed to load banners", err);
      })
      .finally(() => {
        if (!cancelled) setIsResolved(true);
      });

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener("change", handler);

    return () => {
      cancelled = true;
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  const visibleBanners = useMemo(
    () =>
      banners.filter(
        (banner) =>
          banner.displayFrequency !== "ONCE_PER_SESSION" || !sessionDismissed.includes(banner.id),
      ),
    [banners, sessionDismissed],
  );

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((i) => (i + 1) % visibleBanners.length);
  }, [visibleBanners.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((i) => (i - 1 + visibleBanners.length) % visibleBanners.length);
  }, [visibleBanners.length]);

  // Auto-advance
  useEffect(() => {
    if (visibleBanners.length <= 1 || isHovered || isTouching || prefersReduced) {
      if (autoRef.current) clearInterval(autoRef.current);
      return;
    }
    autoRef.current = setInterval(goNext, AUTO_ADVANCE_MS);
    return () => {
      if (autoRef.current) clearInterval(autoRef.current);
    };
  }, [visibleBanners.length, isHovered, isTouching, prefersReduced, goNext]);

  // Keep index in bounds after dismiss
  useEffect(() => {
    if (currentIndex >= visibleBanners.length && visibleBanners.length > 0) {
      setCurrentIndex(visibleBanners.length - 1);
    }
  }, [visibleBanners.length, currentIndex]);

  const current = visibleBanners[Math.min(currentIndex, visibleBanners.length - 1)];

  /**
   * Closes the banner showing now.
   *
   * Not reachable from the current UI — the reference banner renders no close control, and
   * adding one would be redesigning it. The path is wired end to end so that switching the
   * control on is a rendering change and nothing more.
   */
  const handleDismiss = useCallback(() => {
    if (!current || !current.isDismissible) return;
    void bannerCarouselService.dismissBanner(current);
    if (current.displayFrequency === "ONCE_PER_STUDENT") {
      setBanners((all) => all.filter((b) => b.id !== current.id));
      return;
    }
    setSessionDismissed((ids) => (ids.includes(current.id) ? ids : [...ids, current.id]));
  }, [current]);

  const handleTouchStart = useCallback((clientX: number) => {
    setIsTouching(true);
    touchStartX.current = clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (clientX: number) => {
      setIsTouching(false);
      if (touchStartX.current === null) return;
      const delta = touchStartX.current - clientX;
      touchStartX.current = null;
      if (Math.abs(delta) < 40) return;
      if (delta > 0) goNext();
      else goPrev();
    },
    [goNext, goPrev],
  );

  const handleTouchCancel = useCallback(() => {
    setIsTouching(false);
    touchStartX.current = null;
  }, []);

  const handleSelect = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex],
  );

  return {
    visibleBanners,
    /** False until the request has settled, one way or the other. */
    isResolved,
    current,
    currentIndex,
    direction,
    prefersReduced,
    isMulti: visibleBanners.length > 1,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onTouchCancel: handleTouchCancel,
    onSelect: handleSelect,
    onDismiss: handleDismiss,
  };
}

export type UseStudentBannersReturn = ReturnType<typeof useStudentBanners>;

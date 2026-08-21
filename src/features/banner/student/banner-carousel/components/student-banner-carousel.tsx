import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BannerStudentPreview } from "@/features/banner/components/banner-student-preview";
import { useStudentBanners } from "../hooks/use-student-banners";

interface StudentBannerCarouselProps {
  /**
   * Rendered in the carousel's place when no banner is running.
   *
   * The slot exists because the two are mutually exclusive on the reference home screen: the
   * welcome banner is what sits there when nobody is promoting anything. Passing it in keeps
   * that decision on one answer — the banners this learner actually has — instead of the
   * courses screen fetching them a second time to ask.
   */
  fallback?: ReactNode;
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

/**
 * The promotional carousel above the learner's courses.
 *
 * It renders nothing of its own when there is nothing to show — while loading, on a failed
 * load, and when no banner is running, where `fallback` takes the slot instead. The courses
 * below never wait for it and never see its failures, which is the whole point of it being
 * its own component here.
 */
export function StudentBannerCarousel({ fallback }: StudentBannerCarouselProps = {}) {
  const {
    visibleBanners,
    isResolved,
    current,
    currentIndex,
    direction,
    prefersReduced,
    isMulti,
    onMouseEnter,
    onMouseLeave,
    onTouchStart,
    onTouchEnd,
    onTouchCancel,
    onSelect,
    onDismiss,
  } = useStudentBanners();

  // Nothing at all until the answer is in: showing the fallback first and replacing it with a
  // promotion a moment later would flash two different things into the same slot.
  if (!isResolved) return null;
  if (visibleBanners.length === 0) return <>{fallback ?? null}</>;

  return (
    <div
      dir="rtl"
      style={{ position: "relative", width: "100%", marginBottom: 24 }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Carousel track */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 20,
          touchAction: "pan-y",
          userSelect: "none",
        }}
        onTouchStart={(e) => onTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)}
        onTouchCancel={onTouchCancel}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current?.id ?? currentIndex}
            custom={direction}
            variants={prefersReduced ? undefined : slideVariants}
            initial={prefersReduced ? { opacity: 0 } : "enter"}
            animate={prefersReduced ? { opacity: 1 } : "center"}
            exit={prefersReduced ? { opacity: 0 } : "exit"}
            transition={{ duration: 0.3, ease: [0.36, 0.66, 0.04, 1] }}
          >
            {current && (
              <BannerStudentPreview
                banner={current}
                onDismiss={current.isDismissible ? onDismiss : undefined}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls + dots (only when multiple banners) */}
      {isMulti && (
        <div className="flex items-center justify-center" style={{ marginTop: 10, gap: 6 }}>
          {visibleBanners.map((_, i) => (
            <button
              key={i}
              onClick={() => onSelect(i)}
              aria-label={`الإعلان ${i + 1}`}
              style={{
                width: i === currentIndex ? 18 : 7,
                height: 7,
                borderRadius: 99,
                background: i === currentIndex ? "#4E5B92" : "rgba(78,91,146,0.22)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 0.25s, background 0.2s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

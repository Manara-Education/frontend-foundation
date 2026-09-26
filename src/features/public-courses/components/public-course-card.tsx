import { useId, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, BookOpen, Clock, User } from "lucide-react";
import { BORDER, FONT, PRIMARY, TEXT, TEXT_LIGHT, TEXT_MUTED } from "@/features/landing/components/theme";
import { paths } from "@/shared/navigation";
import { formatDurationSeconds, formatLessonCount } from "../formatters/public-offer.formatter";
import type { PublicCourseSummary } from "../types/public-courses.types";
import { CategoryChip } from "./category-chip";
import { OfferBadge } from "./offer-badge";

/**
 * One real course on a public surface: its cover, title, what it is, and its price, with the
 * whole card leading to the course's public page.
 *
 * The title link is stretched over the card, so the card is a single tab stop named by the
 * course title and described by its price, rather than several links to the same place. The
 * price comes from the same `describeOffer` the course page uses, so a card and its page can
 * never state the same offer differently.
 */
export function PublicCourseCard({ course }: { course: PublicCourseSummary }) {
  const priceId = useId();
  const [imageFailed, setImageFailed] = useState(false);
  const lessons = formatLessonCount(course.lessonCount);
  const duration = formatDurationSeconds(course.durationSeconds);

  return (
    <article
      // The lift is decoration: none under reduced motion, and the card works the same without it.
      className="relative focus-within:ring-2 focus-within:ring-[#4E5B92] focus-within:ring-offset-2 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(78,91,146,0.16)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      style={{ display: "flex", flexDirection: "column", blockSize: "100%", background: "#FFFFFF", borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden", fontFamily: FONT }}
    >
      <div style={{ position: "relative", aspectRatio: "16 / 9", maxInlineSize: "100%", background: "linear-gradient(135deg, #EAECF5 0%, #DDE0F0 100%)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {course.imageUrl && !imageFailed ? (
          <img src={course.imageUrl} alt="" aria-hidden="true" onError={() => setImageFailed(true)} style={{ display: "block", inlineSize: "100%", blockSize: "100%", objectFit: "cover" }} />
        ) : (
          <BookOpen size={26} color="#C4C9DC" aria-hidden="true" />
        )}
        {course.category && (
          <span style={{ position: "absolute", insetBlockStart: 10, insetInlineStart: 10, maxInlineSize: "calc(100% - 20px)" }}>
            <CategoryChip category={course.category} onImage />
          </span>
        )}
      </div>

      <div className="rs-longform" style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, padding: "18px clamp(16px, 5vw, 20px) 20px", minInlineSize: 0 }}>
        {course.instructorName && (
          <p style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: TEXT_LIGHT, margin: 0, overflow: "hidden", whiteSpace: "nowrap" }}>
            <User size={12} aria-hidden="true" style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{course.instructorName}</span>
          </p>
        )}

        <h3 style={{ fontSize: 15.5, fontWeight: 700, color: TEXT, lineHeight: 1.6, margin: 0, overflowWrap: "anywhere" }}>
          <Link
            to={paths.publicCourse(course.id)}
            aria-describedby={priceId}
            className="rounded after:absolute after:inset-0 focus-visible:outline-none"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            {course.title}
          </Link>
        </h3>

        {course.subtitle && (
          <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.8, margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {course.subtitle}
          </p>
        )}

        {(lessons || duration) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, paddingBlockEnd: 10, borderBlockEnd: `1px solid ${BORDER}` }}>
            {lessons && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: TEXT_LIGHT }}>
                <BookOpen size={12} aria-hidden="true" /> {lessons}
              </span>
            )}
            {duration && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: TEXT_LIGHT }}>
                <Clock size={12} aria-hidden="true" /> {duration}
              </span>
            )}
          </div>
        )}

        <div style={{ marginBlockStart: "auto", paddingBlockStart: 6, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <OfferBadge offer={course.offer} spokenId={priceId} />
          {/* Decorative: the stretched title link is the card's one control. */}
          <span
            aria-hidden="true"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, paddingInline: 14, paddingBlock: 7, borderRadius: 999, fontSize: 12.5, fontWeight: 700, color: "#FFFFFF", background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`, whiteSpace: "nowrap" }}
          >
            عرض التفاصيل <ArrowLeft size={13} />
          </span>
        </div>
      </div>
    </article>
  );
}

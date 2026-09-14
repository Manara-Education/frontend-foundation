import { useId, useState } from "react";
import { Link } from "react-router";
import { BookOpen, Clock } from "lucide-react";
import { BORDER, FONT, PRIMARY, TEXT, TEXT_LIGHT, TEXT_MUTED } from "@/features/landing/components/theme";
import { paths } from "@/shared/navigation";
import { formatDurationSeconds, formatLessonCount } from "../formatters/public-offer.formatter";
import type { PublicCourseSummary } from "../types/public-courses.types";
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
      className="relative focus-within:ring-2 focus-within:ring-[#4E5B92] focus-within:ring-offset-2"
      style={{ display: "flex", flexDirection: "column", blockSize: "100%", background: "#FFFFFF", borderRadius: 20, border: `1px solid ${BORDER}`, overflow: "hidden", fontFamily: FONT }}
    >
      <div aria-hidden="true" style={{ aspectRatio: "16 / 9", maxInlineSize: "100%", background: "linear-gradient(135deg, #EAECF5 0%, #DDE0F0 100%)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {course.imageUrl && !imageFailed ? (
          <img src={course.imageUrl} alt="" onError={() => setImageFailed(true)} style={{ display: "block", inlineSize: "100%", blockSize: "100%", objectFit: "cover" }} />
        ) : (
          <BookOpen size={26} color="#C4C9DC" />
        )}
      </div>

      <div className="rs-longform" style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, padding: "18px clamp(16px, 5vw, 20px) 20px", minInlineSize: 0 }}>
        {course.instructorName && (
          <p style={{ fontSize: 12, color: TEXT_LIGHT, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>تقديم: {course.instructorName}</p>
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
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
          <span aria-hidden="true" style={{ fontSize: 12.5, fontWeight: 600, color: PRIMARY, whiteSpace: "nowrap" }}>
            عرض التفاصيل ←
          </span>
        </div>
      </div>
    </article>
  );
}

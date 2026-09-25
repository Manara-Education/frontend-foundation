import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { AlertTriangle, BookOpen, Clock, RotateCw, SearchX } from "lucide-react";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { BORDER, FONT, PRIMARY, TEXT, TEXT_LIGHT, TEXT_MUTED } from "@/features/landing/components/theme";
import { Spinner } from "@/shared/components";
import { ManaraLogoFull } from "@/shared/components/ManaraLogo";
import { paths } from "@/shared/navigation";
import { useDocumentTitleOverride } from "@/shared/navigation/document-title";
import { formatDurationSeconds, formatLessonCount } from "../formatters/public-offer.formatter";
import type { PublicCourseDetail, PublicCourseDetailState, PublicCourseFailure } from "../types/public-courses.types";
import { PublicOfferPanel } from "./public-offer-panel";

const FOCUS_CLASS = "focus-visible:outline-2 focus-visible:outline-offset-2 rounded";
const TITLE_ID = "public-course-title";
const ABOUT_ID = "public-course-about";

/** The page's frame: RTL, a way home, and the public footer with the legal and support links. */
function PublicCourseShell({ children }: { children: ReactNode }) {
  return (
    <div dir="rtl" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", background: "#F6F7FC", fontFamily: FONT }}>
      <header
        className="flex items-center justify-between gap-4 flex-wrap"
        style={{ padding: "14px clamp(16px, 4vw, 40px)", borderBottom: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.8)" }}
      >
        <Link to={paths.landing} replace aria-label="الصفحة الرئيسية" className={FOCUS_CLASS} style={{ textDecoration: "none", outlineColor: PRIMARY }}>
          <ManaraLogoFull size={30} color={PRIMARY} textColor={PRIMARY} />
        </Link>
        <Link
          to={paths.landing}
          replace
          className={FOCUS_CLASS}
          style={{ display: "inline-flex", alignItems: "center", minBlockSize: 44, fontFamily: FONT, fontSize: 14, fontWeight: 600, color: PRIMARY, textDecoration: "none", outlineColor: PRIMARY }}
        >
          العودة إلى الصفحة الرئيسية
        </Link>
      </header>
      <main style={{ flex: 1, inlineSize: "100%", maxInlineSize: 1100, margin: "0 auto", boxSizing: "border-box", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 40px) 64px" }}>
        {children}
      </main>
      <LandingFooter />
    </div>
  );
}

function Notice({ icon, title, body, children, alert = false }: { icon: ReactNode; title: string; body: string; children?: ReactNode; alert?: boolean }) {
  return (
    <div
      role={alert ? "alert" : undefined}
      className="rs-longform"
      style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 24, padding: "clamp(28px, 5vw, 44px)", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16, maxInlineSize: 640, margin: "0 auto" }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", inlineSize: 48, blockSize: 48, borderRadius: 16, background: "rgba(78,91,146,0.08)", color: PRIMARY }}>
        {icon}
      </span>
      <h1 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: TEXT, margin: 0 }}>{title}</h1>
      <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT_MUTED, lineHeight: 2, margin: 0 }}>{body}</p>
      {children}
    </div>
  );
}

const FAILURE_MESSAGES: Record<PublicCourseFailure, string> = {
  network: "تحقق من اتصالك بالإنترنت ثم أعد المحاولة.",
  "rate-limited": "وصلتنا طلبات كثيرة خلال وقت قصير. انتظر قليلًا ثم أعد المحاولة.",
  server: "حدث خطأ من جهتنا أثناء تحميل الدورة. أعد المحاولة بعد قليل.",
  malformed: "حدث خطأ من جهتنا أثناء تحميل الدورة. أعد المحاولة بعد قليل.",
};

/** Names the tab after the course while it is on screen. */
function CourseDocumentTitle({ title }: { title: string }) {
  useDocumentTitleOverride(title);
  return null;
}

function CourseCover({ imageUrl }: { imageUrl: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div style={{ borderRadius: 22, overflow: "hidden", aspectRatio: "16 / 9", maxInlineSize: "100%", background: "linear-gradient(135deg, #EAECF5 0%, #DDE0F0 100%)" }}>
      {/* Decorative: the title right below names the course. */}
      <img src={imageUrl} alt="" onError={() => setFailed(true)} style={{ display: "block", inlineSize: "100%", blockSize: "100%", objectFit: "cover" }} />
    </div>
  );
}

function PublicCourseView({ course }: { course: PublicCourseDetail }) {
  const lessons = formatLessonCount(course.lessonCount);
  const duration = formatDurationSeconds(course.durationSeconds);

  return (
    <>
      <CourseDocumentTitle title={course.title} />
      {/*
        Title, then price, then description — in reading order on every width. On a wide screen
        the price panel moves beside the text and stays in view; on a phone it comes straight
        after the title, where a visitor looks for it.
      */}
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8">
        <header className="rs-longform lg:col-start-1 lg:row-start-1" style={{ display: "flex", flexDirection: "column", gap: 14, minInlineSize: 0 }}>
          {course.imageUrl && <CourseCover imageUrl={course.imageUrl} />}
          {course.instructorName && (
            <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT_LIGHT, margin: 0 }}>تقديم: {course.instructorName}</p>
          )}
          <h1 id={TITLE_ID} style={{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(24px, 4vw, 34px)", color: TEXT, lineHeight: 1.45, margin: 0, overflowWrap: "anywhere" }}>
            {course.title}
          </h1>
          {course.subtitle && (
            <p style={{ fontFamily: FONT, fontSize: 16, color: TEXT_MUTED, lineHeight: 1.9, margin: 0, overflowWrap: "anywhere" }}>{course.subtitle}</p>
          )}
          {(lessons || duration) && (
            <ul aria-label="معلومات الدورة" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexWrap: "wrap", gap: 16 }}>
              {lessons && (
                <li style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: 13, color: TEXT_MUTED }}>
                  <BookOpen size={14} aria-hidden="true" /> {lessons}
                </li>
              )}
              {duration && (
                <li style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: FONT, fontSize: 13, color: TEXT_MUTED }}>
                  <Clock size={14} aria-hidden="true" /> {duration}
                </li>
              )}
            </ul>
          )}
        </header>

        <aside className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-6" style={{ minInlineSize: 0 }}>
          <PublicOfferPanel course={course} />
        </aside>

        {course.description && (
          <section
            aria-labelledby={ABOUT_ID}
            className="rs-longform lg:col-start-1 lg:row-start-2"
            style={{ background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 22, padding: "clamp(20px, 4vw, 32px)", minInlineSize: 0 }}
          >
            <h2 id={ABOUT_ID} style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, color: TEXT, margin: "0 0 12px" }}>
              عن الدورة
            </h2>
            {/* Plain text from the instructor: rendered as text, line breaks kept, never as markup. */}
            <p style={{ fontFamily: FONT, fontSize: 15.5, color: TEXT_MUTED, lineHeight: 2, margin: 0, whiteSpace: "pre-line", overflowWrap: "anywhere" }}>
              {course.description}
            </p>
          </section>
        )}
      </div>
    </>
  );
}

interface PublicCourseContentProps {
  state: PublicCourseDetailState;
  onRetry: () => void;
}

/**
 * The public course page in each of its states.
 *
 * `not-found` covers a course that does not exist, a draft, a private course and a mangled
 * address alike — the server does not say which, and neither does this page.
 */
export function PublicCourseContent({ state, onRetry }: PublicCourseContentProps) {
  if (state.status === "loading") {
    return (
      <PublicCourseShell>
        <div role="status" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "80px 0" }}>
          <Spinner size="lg" />
          <p style={{ fontFamily: FONT, fontSize: 15, color: TEXT_MUTED, margin: 0 }}>جارٍ تحميل الدورة…</p>
        </div>
      </PublicCourseShell>
    );
  }

  if (state.status === "not-found") {
    return (
      <PublicCourseShell>
        <Notice icon={<SearchX size={22} strokeWidth={1.8} aria-hidden="true" />} title="الدورة غير متاحة" body="لم نعثر على هذه الدورة، أو أنها لم تعد معروضة.">
          <Link to={paths.landing} replace className={FOCUS_CLASS} style={{ display: "inline-flex", alignItems: "center", minBlockSize: 44, fontFamily: FONT, fontSize: 14, fontWeight: 600, color: PRIMARY, outlineColor: PRIMARY }}>
            العودة إلى الصفحة الرئيسية
          </Link>
        </Notice>
      </PublicCourseShell>
    );
  }

  if (state.status === "error") {
    return (
      <PublicCourseShell>
        <Notice alert icon={<AlertTriangle size={22} strokeWidth={1.8} aria-hidden="true" />} title="تعذّر تحميل الدورة" body={FAILURE_MESSAGES[state.failure]}>
          <button
            type="button"
            onClick={onRetry}
            className={FOCUS_CLASS}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, minBlockSize: 44, fontFamily: FONT, fontWeight: 600, fontSize: 14, color: "#FFFFFF", background: `linear-gradient(135deg, ${PRIMARY} 0%, #3A4370 100%)`, border: "none", borderRadius: 12, padding: "0 20px", cursor: "pointer", outlineColor: PRIMARY }}
          >
            <RotateCw size={15} strokeWidth={2} aria-hidden="true" />
            إعادة المحاولة
          </button>
        </Notice>
      </PublicCourseShell>
    );
  }

  return (
    <PublicCourseShell>
      <PublicCourseView course={state.course} />
    </PublicCourseShell>
  );
}

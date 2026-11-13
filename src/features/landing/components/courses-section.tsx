import type { CSSProperties, ReactNode } from "react";
import { BookOpen, RotateCw } from "lucide-react";
import { PublicCourseCard } from "@/features/public-courses/components/public-course-card";
import type { PublicCourseFailure, PublicCourseListState } from "@/features/public-courses/types/public-courses.types";
import { FadeIn, SectionHeading } from "./landing-primitives";
import { BG_SOFT, BORDER, FONT, PRIMARY, TEXT, TEXT_LIGHT, TEXT_MUTED } from "./theme";

interface CoursesSectionProps {
  state: PublicCourseListState;
  onRetry: () => void;
}

const GRID: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
  gap: 20,
  margin: "48px 0 0",
  padding: 0,
  listStyle: "none",
};

const FAILURE_MESSAGES: Record<PublicCourseFailure, string> = {
  network: "تحقق من اتصالك بالإنترنت ثم أعد المحاولة.",
  "rate-limited": "وصلتنا طلبات كثيرة خلال وقت قصير. انتظر قليلًا ثم أعد المحاولة.",
  server: "حدث خطأ من جهتنا أثناء تحميل الدورات. أعد المحاولة بعد قليل.",
  malformed: "حدث خطأ من جهتنا أثناء تحميل الدورات. أعد المحاولة بعد قليل.",
};

const formatCount = (value: number) => value.toLocaleString("ar-EG");

function Notice({ icon, title, body, children, alert = false }: { icon: ReactNode; title: string; body: string; children?: ReactNode; alert?: boolean }) {
  return (
    <div
      role={alert ? "alert" : undefined}
      className="rs-longform"
      style={{ marginTop: 48, background: "#FFFFFF", border: `1px solid ${BORDER}`, borderRadius: 20, padding: "clamp(24px, 5vw, 36px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}
    >
      <span style={{ color: PRIMARY }}>{icon}</span>
      <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 17, color: TEXT, margin: 0 }}>{title}</p>
      <p style={{ fontFamily: FONT, fontSize: 14, color: TEXT_MUTED, lineHeight: 1.9, margin: 0 }}>{body}</p>
      {children}
    </div>
  );
}

function Failure({ failure, onRetry }: { failure: PublicCourseFailure; onRetry: () => void }) {
  return (
    <Notice alert icon={<BookOpen size={26} aria-hidden="true" />} title="تعذّر تحميل الدورات الآن" body={FAILURE_MESSAGES[failure]}>
      <button
        type="button"
        onClick={onRetry}
        className="focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, minBlockSize: 44, paddingInline: 20, borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${PRIMARY} 0%, #6172AC 100%)`, color: "#FFFFFF", fontFamily: FONT, fontWeight: 600, fontSize: 14, cursor: "pointer", outlineColor: PRIMARY }}
      >
        <RotateCw size={15} aria-hidden="true" /> إعادة المحاولة
      </button>
    </Notice>
  );
}

function CoursesBody({ state, onRetry }: CoursesSectionProps) {
  if (state.status === "loading") {
    return (
      <div role="status" style={GRID}>
        <span className="sr-only">جارٍ تحميل الدورات…</span>
        {[0, 1, 2].map((key) => (
          <div key={key} aria-hidden="true" style={{ blockSize: 320, borderRadius: 20, border: `1px solid ${BORDER}`, background: "linear-gradient(100deg, #EEF0F7 0%, #F6F7FB 50%, #EEF0F7 100%)" }} />
        ))}
      </div>
    );
  }

  if (state.status === "error") return <Failure failure={state.failure} onRetry={onRetry} />;

  if (state.status === "empty") {
    // Courses came back but none could be read: a broken answer, not an empty catalogue.
    if (state.page.skippedItems > 0) return <Failure failure="malformed" onRetry={onRetry} />;
    return <Notice icon={<BookOpen size={26} aria-hidden="true" />} title="لا توجد دورات معروضة حاليًا" body="ستظهر الدورات هنا عند نشرها." />;
  }

  const { items, totalItems } = state.page;
  return (
    <>
      <ul aria-label="الدورات المتاحة" style={GRID}>
        {items.map((course, index) => (
          <li key={course.id} style={{ minInlineSize: 0 }}>
            <FadeIn delay={Math.min(index, 5) * 0.06}>
              <PublicCourseCard course={course} />
            </FadeIn>
          </li>
        ))}
      </ul>
      {totalItems > items.length && (
        <p style={{ fontFamily: FONT, fontSize: 13, color: TEXT_LIGHT, textAlign: "center", marginTop: 28 }}>
          تُعرض هنا أحدث {formatCount(items.length)} دورة من أصل {formatCount(totalItems)}.
        </p>
      )}
    </>
  );
}

/**
 * Section 10 — the courses on offer.
 *
 * Every card is a real published, public course from the public catalogue, priced the way the
 * backend states it, and leading to that course's public page. Nothing here is sample content and
 * nothing is a fallback: loading says it is loading, an empty catalogue says there is nothing to
 * show yet, and a failure says so and offers a retry. None of them invents a course or a price.
 */
export function CoursesSection({ state, onRetry }: CoursesSectionProps) {
  return (
    <section id="courses" dir="rtl" style={{ paddingBlock: "clamp(72px, 10vw, 100px)", paddingInline: "clamp(16px, 4vw, 28px)", background: BG_SOFT }}>
      <div style={{ maxInlineSize: 1100, margin: "0 auto" }}>
        <FadeIn>
          <SectionHeading tag="الدورات" title="الدورات المتاحة" subtitle="اطّلع على تفاصيل كل دورة وسعرها قبل التسجيل." />
        </FadeIn>
        <CoursesBody state={state} onRetry={onRetry} />
      </div>
    </section>
  );
}

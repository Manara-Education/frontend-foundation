import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CourseCard } from "@/features/course/student/courses/components/course-card";
import { HeroSection } from "@/features/course/student/course-details/components/hero-section";
import { LessonItem } from "@/features/course/student/course-details/components/lesson-item";
import { CurriculumSection } from "@/features/course/student/course-details/components/curriculum-section";
import type { CourseView } from "@/features/course/student/courses/types/courses.types";
import type {
  ContentChange,
  CourseDetailData,
  Lesson,
} from "@/features/course/student/course-details/types/course-details.types";
import { UNCHANGED } from "@/features/course/student/course-details/types/course-details.types";

const UPDATED = /تم التحديث/;
const NEW = /^جديد$/;

function courseView(overrides: Partial<CourseView> = {}): CourseView {
  return {
    id: 1,
    title: "أساسيات اللغة العربية",
    instructor: "معلم",
    description: "وصف الدورة",
    image: "",
    progress: 40,
    totalLessons: 10,
    completedLessons: 4,
    status: "in-progress",
    category: "لغات",
    duration: "2h",
    hasUpdatesSinceEnrollment: false,
    ...overrides,
  };
}

function courseDetail(overrides: Partial<CourseDetailData> = {}): CourseDetailData {
  return {
    id: 1,
    title: "أساسيات اللغة العربية",
    instructor: "معلم",
    instructorTitle: "",
    instructorBio: "",
    instructorStudents: 0,
    instructorCourses: 0,
    instructorImage: "",
    description: "وصف",
    outcomes: [],
    skills: [],
    image: "",
    progress: 0,
    totalLessons: 10,
    completedLessons: 0,
    totalDuration: "2h",
    remainingDuration: "2h",
    students: 12,
    rating: 0,
    category: "لغات",
    price: null,
    purchasePrice: null,
    purchasePriceLabel: null,
    accessType: "FREE",
    subscriptionPlans: [],
    access: {
      enrolled: true,
      entitled: true,
      source: null,
      status: "ACTIVE",
      endDateLabel: "",
      daysRemaining: null,
      planId: null,
    },
    structure: "FLAT",
    currentLesson: { number: 0, title: "", remaining: "" },
    lessons: [],
    modules: [],
    finalQuiz: null,
    courseCompleted: false,
    nextLessonId: null,
    hasUpdatesSinceEnrollment: false,
    finalQuizChange: UNCHANGED,
    removedContent: [],
    ...overrides,
  };
}

function lesson(change: ContentChange, overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: 1,
    number: 1,
    title: "الدرس الأول",
    duration: "10m",
    status: "not-started",
    quiz: null,
    change,
    quizChange: UNCHANGED,
    ...overrides,
  };
}

/**
 * Every screen reads one backend field and none of them decides anything itself — which is
 * the whole point of the field existing. These tests exist to keep it that way: if any of
 * them ever grows a rule of its own, a case below stops matching.
 */
describe("the course-level indicator", () => {
  it("appears on a My Courses card when the course changed after this learner enrolled", () => {
    render(<CourseCard course={courseView({ hasUpdatesSinceEnrollment: true })} index={0} />);

    expect(screen.getByText(UPDATED)).toBeInTheDocument();
  });

  it("is absent for a learner who enrolled after the change", () => {
    render(<CourseCard course={courseView({ hasUpdatesSinceEnrollment: false })} index={0} />);

    expect(screen.queryByText(UPDATED)).not.toBeInTheDocument();
  });

  it("appears on Course Details on the same signal, so the two screens cannot disagree", () => {
    render(<HeroSection course={courseDetail({ hasUpdatesSinceEnrollment: true })} />);

    expect(screen.getByText(UPDATED)).toBeInTheDocument();
  });

  it("is absent from Course Details when the course has not changed for this reader", () => {
    render(<HeroSection course={courseDetail({ hasUpdatesSinceEnrollment: false })} />);

    expect(screen.queryByText(UPDATED)).not.toBeInTheDocument();
  });

  it("is announced, not merely coloured", () => {
    render(<CourseCard course={courseView({ hasUpdatesSinceEnrollment: true })} index={0} />);

    expect(screen.getByRole("status", { name: /تم تحديث محتوى هذه الدورة/ })).toBeInTheDocument();
  });

  it("renders in both directions without the layout deciding whether it is there", () => {
    const { rerender } = render(
      <div dir="rtl">
        <CourseCard course={courseView({ hasUpdatesSinceEnrollment: true })} index={0} />
      </div>,
    );
    expect(screen.getByText(UPDATED)).toBeInTheDocument();

    rerender(
      <div dir="ltr">
        <CourseCard course={courseView({ hasUpdatesSinceEnrollment: true })} index={0} />
      </div>,
    );
    expect(screen.getByText(UPDATED)).toBeInTheDocument();
  });

  it("does not crowd out a very long course title", () => {
    render(
      <CourseCard
        course={courseView({
          hasUpdatesSinceEnrollment: true,
          title: "دورة ".repeat(60).trim(),
        })}
        index={0}
      />,
    );

    expect(screen.getByText(UPDATED)).toBeInTheDocument();
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });
});

describe("the lesson-level indicator", () => {
  it("says NEW for a lesson added after this learner enrolled", () => {
    render(<LessonItem lesson={lesson({ state: "NEW", summary: "تمت إضافة درس جديد" })} index={0} />);

    expect(screen.getByText(NEW)).toBeInTheDocument();
    expect(screen.queryByText(UPDATED)).not.toBeInTheDocument();
  });

  it("says UPDATED for a lesson that existed and has since changed", () => {
    render(
      <LessonItem lesson={lesson({ state: "UPDATED", summary: "تم تحديث محتوى الدرس" })} index={0} />,
    );

    expect(screen.getByText(UPDATED)).toBeInTheDocument();
    expect(screen.queryByText(NEW)).not.toBeInTheDocument();
  });

  it("says nothing at all for an unchanged lesson", () => {
    render(<LessonItem lesson={lesson(UNCHANGED)} index={0} />);

    expect(screen.queryByText(UPDATED)).not.toBeInTheDocument();
    expect(screen.queryByText(NEW)).not.toBeInTheDocument();
  });

  it("carries the server's own wording rather than composing one", () => {
    render(
      <LessonItem
        lesson={lesson({ state: "UPDATED", summary: "تم نقل الدرس من الوحدة الأولى إلى الوحدة الثانية" })}
        index={0}
      />,
    );

    expect(
      screen.getByRole("status", { name: "تم نقل الدرس من الوحدة الأولى إلى الوحدة الثانية" }),
    ).toBeInTheDocument();
  });

  /**
   * A lesson and its quiz each carry a verdict, and a row that showed both would be two
   * badges wide in an already dense list. The louder one wins and brings its own wording.
   */
  it("shows the quiz's verdict on a lesson whose own content did not move", () => {
    render(
      <LessonItem
        lesson={lesson(UNCHANGED, {
          quizChange: { state: "UPDATED", summary: "تم تحديث الاختبار القصير" },
        })}
        index={0}
      />,
    );

    expect(screen.getByRole("status", { name: "تم تحديث الاختبار القصير" })).toBeInTheDocument();
  });

  it("prefers NEW over UPDATED when a lesson and its quiz both changed", () => {
    render(
      <LessonItem
        lesson={lesson({ state: "UPDATED", summary: "تم تحديث محتوى الدرس" }, {
          quizChange: { state: "NEW", summary: "تمت إضافة اختبار قصير جديد" },
        })}
        index={0}
      />,
    );

    expect(screen.getByText(NEW)).toBeInTheDocument();
    expect(screen.queryByText(UPDATED)).not.toBeInTheDocument();
  });

  it("still marks a locked lesson, because the badge is about the listing", () => {
    render(
      <LessonItem
        lesson={lesson({ state: "NEW", summary: "تمت إضافة درس جديد" }, { status: "locked" })}
        index={0}
      />,
    );

    expect(screen.getByText(NEW)).toBeInTheDocument();
  });
});

describe("removed content", () => {
  it("is named at course level, because there is no row left to mark", () => {
    render(
      <CurriculumSection
        courseId={1}
        lessons={[lesson(UNCHANGED)]}
        modules={[]}
        structure="FLAT"
        finalQuiz={null}
        removedContent={[
          { entityType: "LESSON", title: "درس محذوف", summary: "تم حذف الدرس", at: null },
        ]}
        onProgressionChanged={() => {}}
      />,
    );

    expect(screen.getByText(/درس محذوف/)).toBeInTheDocument();
    expect(screen.getByText(/محتوى لم يعد جزءاً من الدورة/)).toBeInTheDocument();
  });

  it("is absent entirely when nothing was removed", () => {
    render(
      <CurriculumSection
        courseId={1}
        lessons={[lesson(UNCHANGED)]}
        modules={[]}
        structure="FLAT"
        finalQuiz={null}
        removedContent={[]}
        onProgressionChanged={() => {}}
      />,
    );

    expect(screen.queryByText(/محتوى لم يعد جزءاً من الدورة/)).not.toBeInTheDocument();
  });
});

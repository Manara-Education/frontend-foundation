import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CourseCard } from "@/features/course/student/courses/components/course-card";
import { HeroSection } from "@/features/course/student/course-details/components/hero-section";
import type { CourseView } from "@/features/course/student/courses/types/courses.types";
import type { CourseDetailData } from "@/features/course/student/course-details/types/course-details.types";

const UPDATED = /تم التحديث/;

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
    hasUpdatesSincePublish: false,
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
    hasUpdatesSincePublish: false,
    ...overrides,
  };
}

/**
 * Both screens read one backend field and neither decides anything itself — which is the
 * whole point of the field existing. These tests exist to keep it that way: if either
 * screen ever grows a rule of its own, one of the four cases below stops matching.
 */
describe("the Updated indicator", () => {
  it("appears on a My Courses card when the backend says the course changed", () => {
    render(<CourseCard course={courseView({ hasUpdatesSincePublish: true })} index={0} />);

    expect(screen.getByText(UPDATED)).toBeInTheDocument();
  });

  it("is absent from a My Courses card when it has not", () => {
    render(<CourseCard course={courseView({ hasUpdatesSincePublish: false })} index={0} />);

    expect(screen.queryByText(UPDATED)).not.toBeInTheDocument();
  });

  it("appears on Course Details on the same signal", () => {
    render(<HeroSection course={courseDetail({ hasUpdatesSincePublish: true })} />);

    expect(screen.getByText(UPDATED)).toBeInTheDocument();
  });

  it("is absent from Course Details when the course has not changed", () => {
    render(<HeroSection course={courseDetail({ hasUpdatesSincePublish: false })} />);

    expect(screen.queryByText(UPDATED)).not.toBeInTheDocument();
  });

  it("is announced, not merely coloured", () => {
    render(<CourseCard course={courseView({ hasUpdatesSincePublish: true })} index={0} />);

    expect(screen.getByRole("status", { name: /تم تحديث محتوى هذه الدورة/ })).toBeInTheDocument();
  });

  it("renders in both directions without the layout deciding whether it is there", () => {
    const { rerender } = render(
      <div dir="rtl">
        <CourseCard course={courseView({ hasUpdatesSincePublish: true })} index={0} />
      </div>,
    );
    expect(screen.getByText(UPDATED)).toBeInTheDocument();

    rerender(
      <div dir="ltr">
        <CourseCard course={courseView({ hasUpdatesSincePublish: true })} index={0} />
      </div>,
    );
    expect(screen.getByText(UPDATED)).toBeInTheDocument();
  });

  it("does not crowd out a very long course title", () => {
    render(
      <CourseCard
        course={courseView({
          hasUpdatesSincePublish: true,
          title: "دورة ".repeat(60).trim(),
        })}
        index={0}
      />,
    );

    expect(screen.getByText(UPDATED)).toBeInTheDocument();
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });
});

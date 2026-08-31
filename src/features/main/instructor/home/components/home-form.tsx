import { motion, AnimatePresence } from "motion/react";
import { PageSkeleton } from "./skeleton";
import { GreetingSection } from "./greeting-section";
import { AnalyticsSection } from "./analytics-section";
import { RecentCoursesSection } from "./recent-courses-section";
import { CreateCourseBanner } from "./create-course-banner";
import type { Course } from "../types/home.types";
import { FONT } from "./theme";

interface HomeFormProps {
  isLoading: boolean;
  courses: Course[];
  hasCourses: boolean;
  totalEnrolled: number;
  firstName: string;
  onCreateCourse?: () => void;
  onCourseClick?: (courseId: string) => void;
}

export function HomeForm({
  isLoading,
  courses,
  hasCourses,
  totalEnrolled,
  firstName,
  onCreateCourse,
  onCourseClick,
}: HomeFormProps) {
  return (
    <div
      dir="rtl"
      className="rs-longform"
      style={{ fontFamily: FONT, minInlineSize: 0, maxInlineSize: "100%" }}
    >
      <AnimatePresence mode="wait">
        {/* ── SKELETON ────────────────────────────────────────── */}
        {isLoading && (
          <motion.div
            key="sk"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ minInlineSize: 0, maxInlineSize: "100%" }}
          >
            <PageSkeleton />
          </motion.div>
        )}

        {/* ── CONTENT ─────────────────────────────────────────── */}
        {!isLoading && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            style={{ minInlineSize: 0, maxInlineSize: "100%" }}
          >
            <GreetingSection firstName={firstName} />

            <AnalyticsSection
              totalEnrolled={totalEnrolled}
              coursesCount={courses.length}
            />

            <RecentCoursesSection
              courses={courses}
              hasCourses={hasCourses}
              onCreateCourse={onCreateCourse}
              onCourseClick={onCourseClick}
            />

            <CreateCourseBanner onCreateCourse={onCreateCourse} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

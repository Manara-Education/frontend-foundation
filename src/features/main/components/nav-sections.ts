import type { ElementType } from "react";
import { BookOpen, Compass, Home, Megaphone, PlusSquare, User } from "lucide-react";
import { isInstructorRole } from "@/shared/auth/roles";
import { paths, type NavSectionId } from "@/shared/navigation/paths";

/**
 * The primary navigation: the major product areas, and nothing below them.
 *
 * Detail, create and edit screens deliberately have no entry here. They belong to one of
 * these areas and say so through their route's `handle.section`, which is what keeps the
 * owning entry lit while the learner or instructor is inside them.
 */
export interface NavItem {
  id: NavSectionId;
  label: string;
  icon: ElementType;
  to: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

const studentSection: NavSection = {
  label: "الطالب",
  items: [
    { id: "student-courses", label: "دوراتي", icon: Home, to: paths.student.courses },
    { id: "student-explore", label: "استكشاف الدورات", icon: Compass, to: paths.student.explore },
    { id: "profile", label: "ملفي الشخصي", icon: User, to: paths.profile },
  ],
};

const instructorSection: NavSection = {
  label: "المدرّب",
  items: [
    { id: "instructor-home", label: "الرئيسية", icon: Home, to: paths.instructor.home },
    { id: "instructor-courses", label: "دوراتي", icon: BookOpen, to: paths.instructor.courses },
    { id: "instructor-create", label: "إنشاء دورة", icon: PlusSquare, to: paths.instructor.createCourse },
    { id: "instructor-banners", label: "الإعلانات", icon: Megaphone, to: paths.instructor.banners },
    { id: "profile", label: "ملفي الشخصي", icon: User, to: paths.profile },
  ],
};

export function getNavSectionsForRole(role: string | undefined): NavSection[] {
  return isInstructorRole(role) ? [instructorSection] : [studentSection];
}

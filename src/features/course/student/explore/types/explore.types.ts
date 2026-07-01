export interface CourseExploreDto {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  description: string | null;
  duration: number | null; // in minutes
  lessonCount: number | null;
  price: number | null;
  studentsCount: number | null;
  instructorId: number;
  instructorName: string | null;
  createdAt: string;
}

export interface CourseExploreView {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  duration: number; // in minutes
  lessonCount: number;
  price: number;
  studentsCount: number;
  instructorId: number;
  instructorName: string;
  createdAt: string;
}

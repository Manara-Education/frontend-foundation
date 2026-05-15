import type { CourseView } from "../types/courses.types";

// Preserved curated mock dataset from the legacy CoursesView. The HTTP endpoint
// (see ../api/courses.api.ts → getMyCourses) is reserved for the real backend
// once the list payload includes per-student progress.
const MOCK_COURSES: CourseView[] = [
  {
    id: 1,
    title: "أساسيات النحو العربي",
    instructor: "أ. محمد الأمين",
    description: "رحلة شاملة في قواعد النحو من المبادئ الأولى حتى الاستخدام الاحترافي في الكتابة",
    image: "https://images.unsplash.com/photo-1771909752761-d26abe4e60ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBjYWxsaWdyYXBoeSUyMGFydCUyMGVsZWdhbnR8ZW58MXx8fHwxNzc4MzQwOTgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    progress: 75,
    totalLessons: 24,
    completedLessons: 18,
    status: "in-progress",
    category: "نحو وصرف",
    duration: "٢٠ ساعة",
  },
  {
    id: 2,
    title: "مهارات الكتابة الإبداعية",
    instructor: "أ. سارة القحطاني",
    description: "من الفكرة الأولى إلى النص الإبداعي المتكامل — تقنيات وأدوات الكاتب العربي المعاصر",
    image: "https://images.unsplash.com/photo-1622137879013-beaca5144a4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjB3cml0aW5nJTIwZ3JhbW1hciUyMGxpbmd1aXN0aWNzJTIwc3R1ZHl8ZW58MXx8fHwxNzc4MzQwOTgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    progress: 100,
    totalLessons: 18,
    completedLessons: 18,
    status: "completed",
    category: "كتابة إبداعية",
    duration: "١٢ ساعة",
  },
  {
    id: 3,
    title: "فن التلاوة والتجويد",
    instructor: "الشيخ عمر الفاروق",
    description: "أحكام التجويد الكاملة مع التطبيق الصوتي والتدريب على السور القرآنية الكريمة",
    image: "https://images.unsplash.com/photo-1619714125744-4e7d8a804476?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxRdXJhbiUyMHJlY2l0YXRpb24lMjBJc2xhbWljJTIwYm9vayUyMG9wZW58ZW58MXx8fHwxNzc4MzQwOTgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    progress: 40,
    totalLessons: 30,
    completedLessons: 12,
    status: "in-progress",
    category: "تجويد وتلاوة",
    duration: "٢٤ ساعة",
  },
  {
    id: 4,
    title: "الشعر العربي الكلاسيكي",
    instructor: "د. ليلى المنصور",
    description: "الأوزان والبحور الشعرية وأعلام الشعراء من العصر الجاهلي حتى العصر العباسي",
    image: "https://images.unsplash.com/photo-1634630487525-84df162e5305?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBwb2V0cnklMjBsaXRlcmF0dXJlJTIwbWFudXNjcmlwdCUyMGFuY2llbnR8ZW58MXx8fHwxNzc4MzQwOTgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    progress: 0,
    totalLessons: 20,
    completedLessons: 0,
    status: "not-started",
    category: "أدب وشعر",
    duration: "١٥ ساعة",
  },
  {
    id: 5,
    title: "اللغة العربية للأعمال",
    instructor: "أ. خالد العتيبي",
    description: "مهارات التواصل المهني والكتابة الرسمية وإعداد التقارير في بيئة الأعمال العربية",
    image: "https://images.unsplash.com/photo-1762330918491-f4288a62adb8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBlZHVjYXRpb24lMjBkaWdpdGFsJTIwbGVhcm5pbmclMjBsYXB0b3B8ZW58MXx8fHwxNzc4MzQwOTgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    progress: 100,
    totalLessons: 10,
    completedLessons: 10,
    status: "completed",
    category: "لغة مهنية",
    duration: "٨ ساعات",
  },
  {
    id: 6,
    title: "الحضارة العربية الإسلامية",
    instructor: "د. فاطمة الزهراني",
    description: "رحلة معمّقة عبر التاريخ والتراث والإسهامات الإنسانية والعلمية الكبرى للحضارة العربية",
    image: "https://images.unsplash.com/photo-1641919005235-4271abd5a8fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBcmFiaWMlMjBjdWx0dXJlJTIwaGVyaXRhZ2UlMjBtb3NxdWUlMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzc4MzQwOTgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    progress: 0,
    totalLessons: 18,
    completedLessons: 0,
    status: "not-started",
    category: "تاريخ وحضارة",
    duration: "٢٠ ساعة",
  },
];

export const coursesService = {
  async loadCourses(): Promise<CourseView[]> {
    // Simulated latency preserves the legacy skeleton timing.
    await new Promise((resolve) => setTimeout(resolve, 1600));
    return MOCK_COURSES;
  },
};

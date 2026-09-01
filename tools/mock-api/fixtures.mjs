/**
 * Fixtures for the responsive verification harness.
 *
 * These are not "realistic" data in the sense of being average. They are deliberately
 * adversarial along the axes the responsive Definition of Done cares about, because a
 * layout that only holds for short strings has not been verified at all:
 *
 *   - Arabic titles long enough to wrap two or three times in a narrow card
 *   - an unbroken 44-character token, to catch missing `overflow-wrap`
 *   - a Latin URL long enough to overflow any container that does not break it
 *   - empty/null optional fields beside fully-populated ones, to exercise both branches
 *   - counts high enough that grids actually have to reflow
 *
 * Shapes mirror `src/shared/courses/courses.types.ts` exactly. When a contract changes,
 * this file changes with it.
 */

export const LONG_AR_TITLE =
  "أساسيات هندسة البرمجيات الحديثة وبناء الأنظمة الموزعة القابلة للتوسع باستخدام أنماط التصميم المتقدمة";

export const LONG_AR_DESC =
  "تغطي هذه الدورة الشاملة كل ما تحتاج معرفته حول تصميم وبناء وصيانة الأنظمة البرمجية الحديثة، " +
  "بدءاً من المبادئ الأساسية للبرمجة كائنية التوجه ووصولاً إلى الأنماط المعمارية المتقدمة مثل " +
  "المعمارية السداسية والأحداث الموزعة، مع تطبيقات عملية على مشاريع حقيقية.";

/** No spaces. Anything that does not set `overflow-wrap` will overflow on this. */
export const UNBREAKABLE = "التطبيقاتالبرمجيةالموزعةالمتقدمة";
export const LONG_URL =
  "https://example.com/very/long/path/segment/that/will/not/wrap/on/its/own/unless/told/to/index.html";

const IMG = "https://placehold.co/640x360/4E5B92/FFFFFF/png";

export const users = {
  student: {
    fullName: "أحمد عبد الرحمن محمود السيد",
    email: "student@manara.test",
    role: "STUDENT",
    requiresPasswordReset: false,
  },
  instructor: {
    fullName: "د. فاطمة الزهراء بنت محمد",
    email: "instructor@manara.test",
    role: "INSTRUCTOR",
    requiresPasswordReset: false,
  },
};

/** `CourseViewDto[]` — the student dashboard at `/v1/dashboard/student`. */
export const studentDashboard = [
  {
    id: 1, title: LONG_AR_TITLE, instructor: "د. فاطمة الزهراء بنت محمد",
    description: LONG_AR_DESC, image: IMG, progress: 45, totalLessons: 24,
    completedLessons: 11, status: "in-progress", category: "هندسة البرمجيات",
    duration: "12 ساعة و 30 دقيقة", hasUpdatesSinceEnrollment: true,
  },
  {
    id: 2, title: "مقدمة في " + UNBREAKABLE, instructor: "م. خالد",
    description: "وصف قصير.", image: IMG, progress: 100, totalLessons: 8,
    completedLessons: 8, status: "completed", category: "برمجة",
    duration: "3 ساعات", hasUpdatesSinceEnrollment: false,
  },
  {
    id: 3, title: "دورة مجانية", instructor: "أ. سارة عبد الله الشمري",
    description: "", image: null, progress: 0, totalLessons: 15,
    completedLessons: 0, status: "not-started", category: "تصميم تجربة المستخدم",
    duration: "6 ساعات", hasUpdatesSinceEnrollment: false,
  },
  {
    id: 4, title: "الذكاء الاصطناعي التطبيقي", instructor: "د. عمر",
    description: LONG_AR_DESC, image: IMG, progress: 72, totalLessons: 30,
    completedLessons: 22, status: "in-progress", category: "ذكاء اصطناعي",
    duration: "20 ساعة", hasUpdatesSinceEnrollment: true,
  },
];

function course(id, over = {}) {
  return {
    id, title: LONG_AR_TITLE, subtitle: "مسار متكامل من الصفر إلى الاحتراف",
    image: IMG, description: LONG_AR_DESC, duration: 750, lessonCount: 24,
    price: null, purchasePrice: null, accessType: "FREE", structure: "MODULES",
    status: "PUBLISHED", visibility: "PUBLIC", hasUpdatesSincePublish: false,
    studentsCount: 1284, instructorId: 10, instructorName: "د. فاطمة الزهراء بنت محمد",
    createdAt: "2026-01-15T10:00:00Z", updatedAt: "2026-08-20T09:30:00Z",
    subscriptionPlans: null, lessons: null, ...over,
  };
}

/** `CourseResponse[]` — the catalogue and the instructor's own list. */
export const catalogue = [
  course(1),
  course(2, { title: "مقدمة في " + UNBREAKABLE, accessType: "PURCHASE", purchasePrice: 499, price: 499, structure: "FLAT", lessonCount: 8, subtitle: null, description: null, image: null }),
  course(3, { title: "دورة مجانية", accessType: "FREE", status: "DRAFT", studentsCount: 0, subtitle: null }),
  course(4, { title: "الذكاء الاصطناعي التطبيقي", accessType: "SUBSCRIPTION", visibility: "PRIVATE", hasUpdatesSincePublish: true,
    subscriptionPlans: [
      { id: 1, name: "شهري", duration: 1, unit: "MONTH", price: 99, orderIndex: 0 },
      { id: 2, name: "ربع سنوي مع خصم خاص للطلاب", duration: 3, unit: "MONTH", price: 249, orderIndex: 1 },
      { id: 3, name: "سنوي", duration: 12, unit: "MONTH", price: 899, orderIndex: 2 },
    ] }),
  course(5, { title: "تصميم واجهات المستخدم", accessType: "FREE", lessonCount: 15 }),
  course(6, { title: "قواعد البيانات المتقدمة", accessType: "PURCHASE", purchasePrice: 350, price: 350 }),
];

const RICH = JSON.stringify({
  type: "doc",
  content: [
    { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "مقدمة الدرس" }] },
    { type: "paragraph", content: [{ type: "text", text: LONG_AR_DESC }] },
    { type: "paragraph", content: [{ type: "text", text: UNBREAKABLE + " " + LONG_URL }] },
    { type: "bulletList", content: [1, 2, 3].map((n) => ({
      type: "listItem",
      content: [{ type: "paragraph", content: [{ type: "text", text: `النقطة رقم ${n}: ${LONG_AR_DESC.slice(0, 90)}` }] }],
    })) },
    { type: "orderedList", content: [1, 2].map((n) => ({
      type: "listItem",
      content: [{ type: "paragraph", content: [{ type: "text", text: `خطوة ${n}` }] }],
    })) },
  ],
});

function lesson(id, over = {}) {
  return {
    id, title: `الدرس ${id}: ${LONG_AR_TITLE.slice(0, 55)}`,
    summary: "ملخص موجز للدرس.", description: LONG_AR_DESC.slice(0, 160),
    contentType: "VIDEO", richContent: null,
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    videoProvider: "YOUTUBE", externalVideoId: "dQw4w9WgXcQ",
    videoEmbedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoThumbnailUrl: IMG, duration: "12:45", orderIndex: id, courseId: 1,
    moduleId: 1, isCompleted: false, locked: false, quiz: null,
    change: null, createdAt: "2026-02-01T08:00:00Z", ...over,
  };
}

export const lessons = [
  lesson(101, { isCompleted: true, change: { state: "UNCHANGED", summary: null, at: null } }),
  lesson(102, { isCompleted: true }),
  lesson(103, { contentType: "RICH_CONTENT", richContent: RICH, videoUrl: null, videoProvider: null,
    externalVideoId: null, videoEmbedUrl: null, videoThumbnailUrl: null, duration: null,
    change: { state: "UPDATED", summary: "تم تحديث محتوى الدرس بإضافة أمثلة عملية جديدة", at: "2026-08-20T09:30:00Z" } }),
  lesson(104, { moduleId: 2, locked: true, videoUrl: null, videoEmbedUrl: null,
    change: { state: "NEW", summary: "درس جديد أضيف بعد تسجيلك في الدورة", at: "2026-08-25T12:00:00Z" } }),
  lesson(105, { moduleId: 2, locked: true }),
];

const quiz = (id, over = {}) => ({
  id, title: "اختبار الوحدة الأولى — مراجعة شاملة للمفاهيم الأساسية",
  instructions: LONG_AR_DESC.slice(0, 120), passingScore: 70,
  questions: [1, 2, 3].map((q) => ({
    id: `${id}-q${q}`,
    text: `السؤال ${q}: ${LONG_AR_DESC.slice(0, 130)}`,
    hintByAiEnabled: q === 1, orderIndex: q,
    options: ["أ", "ب", "ج", "د"].map((o, i) => ({
      id: `${id}-q${q}-o${i}`,
      text: `${o}) ${LONG_AR_DESC.slice(i * 20, i * 20 + 70)}`,
      orderIndex: i,
    })),
  })),
  state: { available: true, attemptCount: 0, passed: false, bestScore: null, lastAttemptId: null, lastSubmittedAt: null },
  change: null, ...over,
});

export const modules = [
  { id: 1, title: "الوحدة الأولى: الأساسيات والمفاهيم التمهيدية", description: LONG_AR_DESC.slice(0, 100),
    orderIndex: 0, lessons: lessons.slice(0, 3), quiz: quiz("qz-1"), locked: false, change: null },
  { id: 2, title: "الوحدة الثانية: " + UNBREAKABLE, description: null,
    orderIndex: 1, lessons: lessons.slice(3), quiz: quiz("qz-2", { state: { available: false, attemptCount: 0, passed: false, bestScore: null, lastAttemptId: null, lastSubmittedAt: null } }),
    locked: true, change: { state: "NEW", summary: "وحدة جديدة", at: "2026-08-25T12:00:00Z" } },
];

export function courseDetails(id, mode) {
  const enrolled = mode !== "DISCOVER";
  return {
    course: {
      id, title: LONG_AR_TITLE, subtitle: "مسار متكامل من الصفر إلى الاحتراف",
      image: IMG, description: LONG_AR_DESC, duration: "12 ساعة و 30 دقيقة",
      remainingDuration: "6 ساعات و 45 دقيقة", lessonCount: 24,
      price: id === 2 ? 499 : null, purchasePrice: id === 2 ? 499 : null,
      accessType: id === 4 ? "SUBSCRIPTION" : id === 2 ? "PURCHASE" : "FREE",
      subscriptionPlans: id === 4 ? catalogue[3].subscriptionPlans : null,
      studentsCount: 1284, createdAt: "2026-01-15T10:00:00Z",
      hasUpdatesSincePublish: false, hasUpdatesSinceEnrollment: enrolled,
      latestContentUpdateAt: "2026-08-25T12:00:00Z",
    },
    instructor: {
      id: 10, fullName: "د. فاطمة الزهراء بنت محمد", email: "instructor@manara.test",
      bio: LONG_AR_DESC.slice(0, 200), specialization: "هندسة البرمجيات والأنظمة الموزعة",
    },
    access: enrolled
      ? { enrolled: true, entitled: true, source: "FREE", status: "ACTIVE", startsAt: "2026-06-01T00:00:00Z", expiresAt: null, daysRemaining: null, planId: null }
      : { enrolled: false, entitled: false, source: null, status: "NONE", startsAt: null, expiresAt: null, daysRemaining: null, planId: null },
    structure: "MODULES", lessons: null, modules,
    finalQuiz: quiz("qz-final", { title: "الاختبار النهائي للدورة" }),
    progress: enrolled ? 45 : 0, courseCompleted: false,
    nextLessonId: enrolled ? 103 : null,
    removedContent: enrolled
      ? [{ entityType: "LESSON", title: "درس أزيل من الدورة بعد تسجيلك فيها", summary: "حُذف هذا الدرس", at: "2026-08-10T00:00:00Z" }]
      : [],
  };
}

export const profile = {
  fullName: "أحمد عبد الرحمن محمود السيد",
  email: "student@manara.test",
  role: "STUDENT",
  createdAt: "2026-01-05T09:00:00Z",
};

export const banners = [
  { id: 1, internalName: "حملة الخريف", title: "خصم ٤٠٪ على جميع الدورات لفترة محدودة جداً",
    description: LONG_AR_DESC.slice(0, 140), imageUrl: IMG,
    callToActionLabel: "اشترك الآن واحصل على الخصم", callToActionUrl: LONG_URL,
    startAt: "2026-09-01T00:00:00Z", endAt: "2026-09-30T23:59:59Z", timezone: "Africa/Cairo",
    priority: 1, enabled: true, dismissible: true, displayFrequency: "ONCE_PER_SESSION",
    draft: false, status: "SCHEDULED", createdAt: "2026-08-01T00:00:00Z", updatedAt: "2026-08-20T00:00:00Z" },
  { id: 2, internalName: UNBREAKABLE, title: "إعلان بدون صورة", description: null, imageUrl: null,
    callToActionLabel: null, callToActionUrl: null, startAt: null, endAt: null, timezone: "Africa/Cairo",
    priority: 2, enabled: false, dismissible: false, displayFrequency: "ALWAYS",
    draft: true, status: "DRAFT", createdAt: "2026-08-05T00:00:00Z", updatedAt: null },
];

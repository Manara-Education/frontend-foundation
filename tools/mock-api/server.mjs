/**
 * A deterministic stand-in for the Manara backend, for responsive verification only.
 *
 * Sixteen of the application's twenty-four screens sit behind `ProtectedRoute`, and the
 * Vite dev server proxies `/api` to `:8081`. With nothing listening there, those screens
 * redirect to `/login` and cannot be looked at — which makes the visual and interaction
 * verification the responsive Definition of Done asks for impossible to perform.
 *
 * This is not a backend. It answers the shapes in `src/shared/courses/courses.types.ts`
 * with the adversarial fixtures next door, and nothing about it is a claim on how the
 * real server behaves. It exists so a layout can be looked at.
 *
 *     node tools/mock-api/server.mjs            # :8081
 *     curl 'localhost:8081/api/__mock/role?as=instructor'   # switch role
 *
 * Zero dependencies on purpose: it must not add anything to package.json.
 */
import { createServer } from "node:http";
import * as fx from "./fixtures.mjs";

const PORT = Number(process.env.MOCK_API_PORT ?? 8081);

const ok = (data) => ({ status: "success", data });
const err = (errors, code) => ({ status: "error", errors, code });

/**
 * The session, such as it is: one process-wide role, flipped through `/api/__mock/role`.
 *
 * `anon` is a real state, not an absence of one. The six auth screens are only reachable
 * while signed out — `PublicOnlyRoute` sends a signed-in visitor away — so auditing them
 * means being able to ask for a 401 on demand rather than stopping the server.
 */
let role = "student";
const currentUser = () => (role === "instructor" ? fx.users.instructor : fx.users.student);

/**
 * Routes, most specific first. Each entry is a pattern whose `:name` segments become
 * params. Matching is exact on segment count, so `/courses/:id` never swallows
 * `/courses/:id/lessons/:lid`.
 */
const routes = [
  ["GET", "/api/__mock/role", (_p, q) => {
    if (q.as === "student" || q.as === "instructor" || q.as === "anon") role = q.as;
    return ok({ role, user: role === "anon" ? null : currentUser() });
  }],

  // ── auth ──
  ["GET", "/api/v1/auth/csrf", () => ok({ token: "mock-csrf-token" })],
  ["GET", "/api/v1/auth/me", () =>
    role === "anon" ? err(["غير مصرح"], "UNAUTHENTICATED") : ok(currentUser())],
  ["POST", "/api/v1/auth/login", (_p, _q, body) => {
    if (body?.email?.includes("instructor")) role = "instructor";
    return ok(currentUser());
  }],
  ["POST", "/api/v1/auth/logout", () => ok({ message: "تم تسجيل الخروج" })],
  ["POST", "/api/v1/auth/register", () => ok({ message: "تم إنشاء الحساب" })],
  ["POST", "/api/v1/auth/forgot-password", () => ok({ message: "تم إرسال الرمز" })],
  ["POST", "/api/v1/auth/verify-otp", () => ok({ message: "تم التحقق", token: "mock-reset-token" })],
  ["POST", "/api/v1/auth/reset-password", () => ok({ message: "تم تغيير كلمة المرور" })],

  // ── student ──
  ["GET", "/api/v1/dashboard/student", () => ok(fx.studentDashboard)],
  ["GET", "/api/v1/student/courses", () => ok(fx.catalogue)],
  ["GET", "/api/v1/student/courses/:id", (p, q) => ok(fx.courseDetails(Number(p.id), q.mode))],
  ["POST", "/api/v1/student/courses/:id/checkout", (p) => ok({
    enrollmentId: 900, courseId: Number(p.id), accessType: "FREE",
    access: { enrolled: true, entitled: true, source: "FREE", status: "ACTIVE",
      startsAt: new Date().toISOString(), expiresAt: null, daysRemaining: null, planId: null },
    paymentReference: "sim_mock_0001",
  })],
  ["GET", "/api/v1/student/courses/:id/lessons/:lid", (p) => {
    const idx = fx.lessons.findIndex((l) => l.id === Number(p.lid));
    if (idx === -1) return err(["الدرس غير موجود"]);
    const ref = (l) => (l ? { id: l.id, title: l.title } : null);
    return ok({ lesson: fx.lessons[idx], previous: ref(fx.lessons[idx - 1]), next: ref(fx.lessons[idx + 1]) });
  }],
  ["POST", "/api/v1/student/courses/:id/lessons/:lid/complete", (p) => ok({
    lessonId: Number(p.lid), completed: true, courseProgress: 60,
    nextLessonId: 104, courseCompleted: false,
  })],
  ["POST", "/api/v1/student/courses/:id/quizzes/:qid/submit", (p, _q, body) => {
    const answers = body?.answers ?? [];
    return ok({
      quizId: p.qid, attemptId: 1, attemptNumber: 1,
      correctCount: answers.length, totalQuestions: answers.length,
      score: 100, passingScore: 70, passed: true, submittedAt: new Date().toISOString(),
      answers: answers.map((a) => ({
        questionId: a.questionId, selectedOptionId: a.optionId, correctOptionId: a.optionId,
        correct: true, explanation: fx.LONG_AR_DESC.slice(0, 120),
      })),
    });
  }],
  ["GET", "/api/v1/student/banners", () => ok(fx.banners.filter((b) => b.enabled))],
  ["POST", "/api/v1/student/banners/:id/dismiss", () => ok({ message: "تم" })],

  // ── instructor ──
  ["GET", "/api/v1/instructor/courses/my-courses", () => ok(fx.catalogue)],
  ["GET", "/api/v1/instructor/courses/:id", (p) => ok({
    ...fx.catalogue.find((c) => c.id === Number(p.id)) ?? fx.catalogue[0],
    lessons: fx.lessons, modules: fx.modules,
  })],
  ["POST", "/api/v1/instructor/courses", () => ok(fx.catalogue[0])],
  ["PUT", "/api/v1/instructor/courses/:id", (p) => ok({ ...fx.catalogue[0], id: Number(p.id) })],
  ["POST", "/api/v1/instructor/courses/:id/publish", () => ok({ message: "تم النشر" })],
  ["POST", "/api/v1/instructor/courses/:id/unpublish", () => ok({ message: "تم الإلغاء" })],
  ["GET", "/api/v1/instructor/banners", () => ok(fx.banners)],
  ["GET", "/api/v1/instructor/banners/:id", (p) =>
    ok(fx.banners.find((b) => b.id === Number(p.id)) ?? fx.banners[0])],
  ["POST", "/api/v1/instructor/banners", () => ok(fx.banners[0])],
  ["PUT", "/api/v1/instructor/banners/order", () => ok(fx.banners)],
  ["PUT", "/api/v1/instructor/banners/:id", (p) =>
    ok({ ...fx.banners[0], id: Number(p.id) })],
  ["DELETE", "/api/v1/instructor/banners/:id", () => ok({ message: "تم الحذف" })],

  // ── shared ──
  ["GET", "/api/v1/profile", () => ok(fx.profile)],
  ["PUT", "/api/v1/profile", () => ok({ message: "تم الحفظ" })],
  ["GET", "/api/v1/instructors/:id", () => ok({
    id: 10, fullName: "د. فاطمة الزهراء بنت محمد", email: "instructor@manara.test",
    bio: fx.LONG_AR_DESC.slice(0, 200), specialization: "هندسة البرمجيات",
  })],
  ["GET", "/api/v1/instructors/:id/courses", () => ok(fx.catalogue)],
  ["POST", "/api/v1/uploads", () => ok({ url: "https://placehold.co/640x360/4E5B92/FFFFFF/png" })],
];

function match(pattern, path) {
  const a = pattern.split("/"), b = path.split("/");
  if (a.length !== b.length) return null;
  const params = {};
  for (let i = 0; i < a.length; i++) {
    if (a[i].startsWith(":")) params[a[i].slice(1)] = decodeURIComponent(b[i]);
    else if (a[i] !== b[i]) return null;
  }
  return params;
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const query = Object.fromEntries(url.searchParams);

  res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-XSRF-TOKEN, Accept-Language");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.writeHead(204).end();

  // The client sends this back as X-XSRF-TOKEN; without it every mutation 403s.
  res.setHeader("Set-Cookie", "XSRF-TOKEN=mock-csrf-token; Path=/; SameSite=Lax");

  let body = null;
  if (req.method !== "GET" && req.method !== "DELETE") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const raw = Buffer.concat(chunks).toString("utf8");
    if (raw) { try { body = JSON.parse(raw); } catch { /* multipart upload — ignore */ } }
  }

  for (const [method, pattern, handler] of routes) {
    if (method !== req.method) continue;
    const params = match(pattern, url.pathname);
    if (!params) continue;
    const payload = handler(params, query, body);
    const status =
      payload.status !== "error" ? 200 : payload.code === "UNAUTHENTICATED" ? 401 : 400;
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify(payload));
  }

  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(err([`No mock route for ${req.method} ${url.pathname}`])));
}).listen(PORT, () => {
  console.log(`[mock-api] listening on http://localhost:${PORT} (role: ${role})`);
});

/**
 * Canonical course API contracts — the single frontend mirror of the backend's
 * `course` and `lesson` DTOs. Nothing here is a view model: these shapes exist to be
 * fed to a mapper, never rendered directly.
 *
 * Field names and nullability follow the backend exactly. `null` means "the backend
 * can send null here"; `?` means "the field may be absent from the payload".
 */
import type {
  AccessStatus,
  CourseAccessType,
  CourseStatus,
  CourseStructure,
  EntitlementSource,
  SubscriptionUnit,
} from "./courses.enums";
import type {
  InstructorQuizResponse,
  LearnerQuizResponse,
  QuizRequest,
} from "./quiz.types";
// The video domain is owned by the shared video module, not by the course contracts.
import type { VideoProvider } from "@/shared/video";

// ── Change tracking ───────────────────────────────────────────────────────────

/**
 * What one piece of a course is, relative to the learner reading it.
 *
 * Relative is the whole of it. The same lesson is `NEW` to somebody who enrolled last
 * month and `UNCHANGED` to somebody who enrolled this morning, because they bought
 * different versions of the same course. There is no global "this lesson is new".
 */
export type ContentChangeState = "NEW" | "UPDATED" | "UNCHANGED";

export type ContentEntityType = "COURSE" | "MODULE" | "LESSON" | "QUIZ" | "EXAM";

/**
 * The server's answer about one curriculum row, for the learner who asked.
 *
 * A decision, not a pair of timestamps. The rule — "changed after you enrolled" — lives on
 * the server, and nothing here recomputes it: an enrolment date shipped to the browser and
 * compared in React is the same rule implemented twice, and the two would drift.
 *
 * Optional throughout, because a payload from an older backend does not carry it and a
 * missing value has to read as "nothing to say" rather than as an error.
 */
export interface ContentChangeResponse {
  state: ContentChangeState;
  /**
   * A sentence for the learner, already localised server-side from `Accept-Language` —
   * "New lesson added", "Lesson moved from Module 1 to Module 2".
   *
   * `null` when the state is `UNCHANGED`, and `null` for a change that predates the
   * server's change log, in which case `state` is still correct and the row falls back to
   * a bare badge.
   */
  summary: string | null;
  /** When it changed, or when it was created if the state is `NEW`. */
  at: string | null;
}

/**
 * Something that was part of the course when this learner enrolled and is not part of it
 * now. It cannot be a row in the curriculum, because there is nothing left to open.
 */
export interface RemovedContentResponse {
  entityType: ContentEntityType;
  title: string;
  summary: string | null;
  at: string | null;
}

// ── Subscription plans ────────────────────────────────────────────────────────

export interface SubscriptionPlanRequest {
  /** Set to update an existing plan of this course; omit to create a new one. */
  id?: number;
  name: string;
  duration: number;
  unit: SubscriptionUnit;
  price: number;
}

export interface SubscriptionPlanResponse {
  id: number;
  name: string;
  duration: number;
  unit: SubscriptionUnit;
  price: number;
  orderIndex: number;
}

// ── Lessons ───────────────────────────────────────────────────────────────────

export interface LessonRequest {
  /** Set to update an existing lesson of the course; omit to create a new one. */
  id?: number;
  title: string;
  summary?: string | null;
  description?: string | null;
  videoUrl: string;
  orderIndex: number;
  /**
   * Required by the standalone lesson endpoints when the course uses modules. Inside a
   * course payload the nesting already says it and the backend ignores this field.
   */
  moduleId?: number | null;
  /** Optional — `null` removes the lesson's quiz. */
  quiz?: QuizRequest | null;
}

/**
 * Learner-facing lesson. The attached quiz is the learner view, so course and lesson
 * browsing can never hand out an answer key.
 *
 * When `locked` is true the viewer has not earned the lesson's content, and the fields
 * that carry it — every `video*` field, `description` and `quiz` — are absent. What is left
 * is the title, length and position, which is what a locked row in the curriculum shows.
 *
 * @see InstructorLessonResponse for the authoring view
 */
export interface LessonResponse {
  id: number;
  title: string;
  summary: string | null;
  description: string | null;
  videoUrl: string | null;
  /**
   * Which platform hosts `videoUrl`. Derived by the server from the URL, so it is authoritative
   * and never has to be sent on write. Null when the stored URL is one no adapter recognises,
   * which a client shows as "no player available" rather than as an error.
   */
  videoProvider: VideoProvider | null;
  /** The provider's own id for the video. */
  externalVideoId: string | null;
  /** What to point an iframe at. Carries no player options; clients append their own. */
  videoEmbedUrl: string | null;
  /**
   * Still image for the video. Present immediately for YouTube, and once the server has fetched
   * it for Vimeo — whose thumbnails have no address derivable from an id.
   */
  videoThumbnailUrl: string | null;
  duration: string | null;
  orderIndex: number;
  courseId: number;
  moduleId: number | null;
  isCompleted: boolean | null;
  /** True when the viewer may see this lesson listed but not open it. */
  locked: boolean | null;
  quiz: LearnerQuizResponse | null;
  /**
   * Whether this lesson is new or updated to the learner reading it. Present on the
   * enrolled course-details tree; absent for a visitor browsing the catalogue, and on the
   * endpoints that serve one lesson rather than a curriculum.
   */
  change?: ContentChangeResponse | null;
  createdAt: string | null;
}

/**
 * Authoring view of a lesson, returned only by the course editor endpoints. The
 * difference that matters is the quiz type.
 */
export interface InstructorLessonResponse {
  id: number;
  title: string;
  summary: string | null;
  description: string | null;
  videoUrl: string | null;
  /**
   * Which platform hosts `videoUrl`. Derived by the server from the URL, so it is authoritative
   * and never has to be sent on write. Null when the stored URL is one no adapter recognises,
   * which a client shows as "no player available" rather than as an error.
   */
  videoProvider: VideoProvider | null;
  /** The provider's own id for the video. */
  externalVideoId: string | null;
  /** What to point an iframe at. Carries no player options; clients append their own. */
  videoEmbedUrl: string | null;
  /**
   * Still image for the video. Present immediately for YouTube, and once the server has fetched
   * it for Vimeo — whose thumbnails have no address derivable from an id.
   */
  videoThumbnailUrl: string | null;
  duration: string | null;
  orderIndex: number;
  courseId: number;
  moduleId: number | null;
  quiz: InstructorQuizResponse | null;
  createdAt: string | null;
}

export interface LessonRef {
  id: number;
  title: string;
}

export interface LessonDetailsResponse {
  lesson: LessonResponse;
  previous: LessonRef | null;
  next: LessonRef | null;
}

// ── Modules ───────────────────────────────────────────────────────────────────

/**
 * A module inside a course payload. Order comes from the array position, not from a
 * submitted value.
 */
export interface CourseModuleRequest {
  /** Set to update an existing module of this course; omit to create a new one. */
  id?: number;
  title: string;
  description?: string | null;
  /** Accepted for round-tripping; the array position is what the backend stores. */
  orderIndex?: number;
  lessons: LessonRequest[];
  /** The module exam. Optional — `null` removes it. */
  quiz?: QuizRequest | null;
}

/** Authoring view of a module — lessons and exam carry the answer key. */
export interface InstructorCourseModuleResponse {
  id: number;
  title: string;
  description: string | null;
  orderIndex: number;
  lessons: InstructorLessonResponse[];
  quiz: InstructorQuizResponse | null;
}

/** Learner view of a module — no answer keys anywhere in the tree. */
export interface LearnerCourseModuleResponse {
  id: number;
  title: string;
  description: string | null;
  orderIndex: number;
  lessons: LessonResponse[];
  quiz: LearnerQuizResponse | null;
  /** True while an earlier module is unfinished, which is what keeps this one shut. */
  locked: boolean | null;
  /**
   * Whether the module itself is new or updated — its title and description, not its
   * contents. A module whose third lesson changed is not itself updated; that lesson is,
   * and says so on its own row.
   */
  change?: ContentChangeResponse | null;
}

// ── Courses ───────────────────────────────────────────────────────────────────

/**
 * The full course aggregate as submitted by the editor.
 *
 * Semantics are full replacement: children carrying an `id` are updated in place,
 * children without one are created, children the payload no longer mentions are
 * removed. An **omitted** `lessons`/`modules` is a metadata-only update that leaves
 * content untouched; an **empty array** is an explicit "remove everything".
 *
 * `structure` decides which of `lessons` and `modules` is read — sending both for the
 * same structure is rejected by the backend.
 */
export interface CourseRequest {
  title: string;
  subtitle?: string | null;
  image?: string | null;
  description: string;
  /**
   * The course revision this payload was built from, as the server last reported it.
   *
   * Required on update, absent on create. The aggregate `PUT` is a full replacement, so a
   * payload assembled from a copy of the course loaded an hour ago *is* an hour-old course:
   * applying it puts every field back the way that copy remembers them. Quoting the revision
   * is what lets the server refuse a save built on something it has since moved past, rather
   * than silently reverting whoever saved in between.
   *
   * Server-generated and echoed back unchanged. Never computed here.
   */
  expectedRevision?: number | null;
  /** Estimated total duration in minutes. */
  duration?: number | null;
  /** Defaults to `FLAT` when omitted. */
  structure?: CourseStructure;
  /** Read only when `structure` is `FLAT`. */
  lessons?: LessonRequest[];
  /** Read only when `structure` is `MODULES`. */
  modules?: CourseModuleRequest[];
  /** The course final exam. Optional — `null` removes it. */
  finalQuiz?: QuizRequest | null;
  /**
   * Defaults to `PURCHASE` when omitted with a positive price and to `FREE` otherwise,
   * so clients written against the previous price-only contract keep working.
   */
  accessType?: CourseAccessType;
  purchasePrice?: number | null;
  /**
   * Former name of `purchasePrice`, still accepted by the backend. `purchasePrice` wins
   * when both are present.
   *
   * @deprecated New code must send `accessType` + `purchasePrice` / `subscriptionPlans`.
   */
  price?: number | null;
  subscriptionPlans?: SubscriptionPlanRequest[];
  /**
   * Publication state — for **create only**.
   *
   * On update the backend still honours it, for clients written against the previous
   * contract, but the editor deliberately never sends it: publication is changed through
   * `POST /{id}/publish` and `/{id}/unpublish`, so a tab holding a stale copy of the
   * course cannot unpublish it by saving a lesson.
   */
  status?: CourseStatus;
}

/**
 * A course's modules in their new order.
 *
 * Ids only — the backend derives positions from the array. Sending the ordered ids rather
 * than positions is what makes a gap, a duplicate or a negative position unrepresentable,
 * and the list must name every module of the course exactly once, so a reorder built from
 * a stale module list is refused instead of half-applied.
 */
export interface ModuleOrderRequest {
  moduleIds: number[];
}

/**
 * One lesson scope's lessons, in the order the instructor just arranged them.
 *
 * The sibling shape of `ModuleOrderRequest`, and deliberately identical: ids only, with
 * the backend deriving positions from the array. It serves both lesson scopes a course
 * has — the root lessons of a `FLAT` course and the lessons inside one module — because
 * they are the same operation on two different parents, and the parent is named by the
 * URL rather than the body. So a reorder can only ever arrange siblings; moving a lesson
 * into another module is a structural edit and still goes through the aggregate save.
 *
 * The list must name every lesson of the scope exactly once, so a reorder built from a
 * lesson list that has since changed is refused instead of half-applied.
 */
export interface LessonOrderRequest {
  lessonIds: number[];
}

/**
 * Summary shape returned by the course list endpoints (instructor `my-courses`,
 * student browse). The new fields are additive.
 */
export interface CourseResponse {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  description: string | null;
  /** Estimated total duration in minutes. */
  duration: number | null;
  lessonCount: number | null;
  /**
   * Mirror of `purchasePrice` under its former name. **`null` for `FREE` and
   * `SUBSCRIPTION` courses** — read `accessType` to tell those apart.
   *
   * @deprecated Use `accessType` + `purchasePrice`.
   */
  price: number | null;
  purchasePrice: number | null;
  accessType: CourseAccessType | null;
  structure: CourseStructure | null;
  status: CourseStatus | null;
  /**
   * Whether the course has changed in a way its learners should be told about.
   *
   * The backend's answer, derived there from the publication baseline and the content
   * version, so every screen showing an "Updated" badge shows the same thing. Never
   * recompute it from timestamps here — the rule lives in one place, on the server.
   *
   * Optional because a payload from an older backend does not carry it; a missing value
   * reads as "no updates", which is the safe direction.
   */
  hasUpdatesSincePublish?: boolean | null;
  studentsCount: number | null;
  instructorId: number;
  instructorName: string | null;
  createdAt: string;
  /**
   * Last time the course itself changed. Optional because the older list payloads carry
   * only `createdAt`; readers fall back to it rather than printing nothing.
   */
  updatedAt?: string | null;
  /**
   * Populated only by list endpoints that inline the plans. A `SUBSCRIPTION` course
   * whose payload omits them is still a subscription — the price is what is unknown.
   */
  subscriptionPlans?: SubscriptionPlanResponse[] | null;
  /** Populated only by endpoints that inline the lesson list. */
  lessons: LessonResponse[] | null;
}

/**
 * Everything the course editor needs to reconstruct its state, in one response.
 *
 * Only the branch matching `structure` is populated: a `FLAT` course returns `lessons`
 * with an empty `modules`, a `MODULES` course the reverse. Returned exclusively from
 * instructor endpoints — it carries answer keys throughout.
 */
export interface InstructorCourseResponse {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  description: string | null;
  duration: number | null;
  lessonCount: number | null;
  studentsCount: number | null;
  instructorId: number;
  instructorName: string | null;
  structure: CourseStructure | null;
  status: CourseStatus | null;
  /**
   * Whether the course has changed in a way its learners should be told about.
   *
   * The backend's answer, derived there from the publication baseline and the content
   * version, so every screen showing an "Updated" badge shows the same thing. Never
   * recompute it from timestamps here — the rule lives in one place, on the server.
   *
   * Optional because a payload from an older backend does not carry it; a missing value
   * reads as "no updates", which is the safe direction.
   */
  hasUpdatesSincePublish?: boolean | null;
  /**
   * The revision this editor model was read at, to be sent back as `expectedRevision`.
   *
   * Every read *and* every accepted write answers with the current one — including the three
   * reorder commands, which move it like any other accepted change. An editor that keeps
   * adopting the value it was last given therefore never conflicts with itself.
   *
   * Optional because a payload from an older backend does not carry it.
   */
  revision?: number | null;
  lessons: InstructorLessonResponse[] | null;
  modules: InstructorCourseModuleResponse[] | null;
  finalQuiz: InstructorQuizResponse | null;
  accessType: CourseAccessType | null;
  purchasePrice: number | null;
  /**
   * Mirror of `purchasePrice` under its former name.
   *
   * @deprecated Use `accessType` + `purchasePrice`.
   */
  price: number | null;
  subscriptionPlans: SubscriptionPlanResponse[] | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CourseDetailsInstructorInfo {
  id: number;
  fullName: string;
  email: string | null;
  bio: string | null;
  specialization: string | null;
}

export interface CourseDetailsInfo {
  id: number;
  title: string;
  subtitle: string | null;
  image: string | null;
  description: string | null;
  /** Pre-formatted for display by the backend, unlike `CourseResponse.duration`. */
  duration: string | null;
  remainingDuration: string | null;
  lessonCount: number | null;
  /** @deprecated Use `accessType` + `purchasePrice`. */
  price: number | null;
  purchasePrice: number | null;
  accessType: CourseAccessType | null;
  subscriptionPlans: SubscriptionPlanResponse[] | null;
  studentsCount: number | null;
  createdAt: string | null;
  /**
   * Whether the instructor has edited this course since they last published it.
   *
   * A statement about the instructor's workflow: the same value for every viewer, cleared
   * for everybody at once when they republish. Not what a learner's badge should read —
   * see `hasUpdatesSinceEnrollment`.
   */
  hasUpdatesSincePublish?: boolean | null;
  /**
   * Whether this course has changed since **the reader** enrolled.
   *
   * The learner-facing badge. Per enrolment, so two students of one course get different
   * answers — somebody who joined this morning bought the version that already contained
   * everything. `false` for a viewer who is not enrolled.
   *
   * Optional because a payload from an older backend does not carry it; a missing value
   * reads as "no updates", which is the safe direction.
   */
  hasUpdatesSinceEnrollment?: boolean | null;
  /**
   * When the course's content last changed, for display only — never to compare against
   * anything here. The comparison is `hasUpdatesSinceEnrollment`, already made.
   */
  latestContentUpdateAt?: string | null;
}

/**
 * Learner-facing course details. Like the editor response, only the branch matching
 * `structure` is populated. Every quiz in the tree is the learner view.
 *
 * The progression fields describe the viewing learner's own standing, so a client
 * renders locks, the progress bar and "continue where you left off" from what the server
 * decided rather than from rules of its own. They are absent for a viewer the course
 * tracks no progress for — course discovery, typically.
 */
/**
 * The viewing learner's standing on one course: whether they joined it, whether they may
 * open it right now, and — for a subscription — until when.
 *
 * Every field is the server's own answer. "Every lesson is locked" describes a visitor who
 * has not bought the course and a subscriber whose window closed equally well; only this
 * block separates them, which is what decides between a buy CTA and a renew CTA.
 */
export interface CourseAccessResponse {
  /** They joined the course. Stays true after a subscription lapses. */
  enrolled: boolean | null;
  /** They may be served protected content right now. */
  entitled: boolean | null;
  /** What their access rests on, or `null` when nothing was ever granted. */
  source: EntitlementSource | null;
  status: AccessStatus | null;
  startsAt: string | null;
  /** `null` for a grant that never ends — free courses and outright purchases. */
  expiresAt: string | null;
  /** Whole days left before `expiresAt`, or `null` when nothing expires. */
  daysRemaining: number | null;
  /** The plan the current or most recent window was bought under, when there is one. */
  planId: number | null;
}

export interface CourseDetailsResponse {
  course: CourseDetailsInfo;
  instructor: CourseDetailsInstructorInfo;
  /** The viewing learner's own standing. Absent for a response that predates the field. */
  access: CourseAccessResponse | null;
  structure: CourseStructure | null;
  lessons: LessonResponse[] | null;
  modules: LearnerCourseModuleResponse[] | null;
  finalQuiz: LearnerQuizResponse | null;
  /** Percentage of the course's lessons this learner has completed, 0–100. */
  progress: number | null;
  /** True once the curriculum is finished and the final exam, if there is one, is passed. */
  courseCompleted: boolean | null;
  /** The lesson to open next, or `null` when nothing is left to open. */
  nextLessonId: number | null;
  /**
   * Content that was in the course when the reader enrolled and is not in it now. Listed
   * at course level because there is no curriculum row left to hang it on. Empty for a
   * viewer who is not enrolled.
   */
  removedContent?: RemovedContentResponse[] | null;
}

// ── Lesson completion ─────────────────────────────────────────────────────────

/**
 * What completing a lesson changed.
 *
 * Marking a lesson done moves the course progress, may open the next module and may
 * finish the course. All of that is decided by the server and reported back here rather
 * than left for a client to re-derive.
 */
export interface LessonCompletionResponse {
  lessonId: number;
  completed: boolean | null;
  /** Percentage of the course's lessons now complete, 0–100. */
  courseProgress: number | null;
  /** The lesson to open next, or `null` when nothing is left to open. */
  nextLessonId: number | null;
  /** True once the curriculum is finished and the final exam, if there is one, is passed. */
  courseCompleted: boolean | null;
}

// ── Enrollment / checkout ─────────────────────────────────────────────────────

/**
 * The payment instrument, mirroring the backend's `PaymentMethodRequest`.
 *
 * It carries no card data, and that is deliberate. `cardNumber`, `expiry` and `cvc` were
 * removed from the backend DTO — Jackson drops unknown properties, so a client still sending
 * them is not rejected, it is just transmitting real card numbers and CVCs to a server with no
 * acquirer, no tokenisation and no PCI DSS scope, which then discards them. This type is what
 * stops the client from doing that.
 *
 * `token` is the seam for the day a real provider arrives: the browser exchanges card details
 * with the provider directly and sends only the opaque token, so card data never reaches this
 * application at all.
 */
export interface PaymentMethodRequest {
  token?: string;
  name: string;
  email?: string;
}

/**
 * What a learner submits to gain access to a course. The backend decides which parts it
 * reads from the course's own access type — leaving fields out cannot buy a cheaper path.
 *
 * - `FREE` — `{}`
 * - `PURCHASE` — `{ paymentMethod }`; the amount is the course's stored price
 * - `SUBSCRIPTION` — `{ planId, paymentMethod }`; only the identifier is trusted, and the
 *   plan's price, duration and expiry are read from the plan row server-side
 *
 * There is deliberately no field for a price or an expiry. Both are computed by the server.
 */
export interface CheckoutRequest {
  /** Required for a `SUBSCRIPTION` course, ignored for the other two. */
  planId?: number;
  paymentMethod?: PaymentMethodRequest;
}

/**
 * What a checkout produced.
 *
 * Returned identically whether the call did the work or found it already done, so a retried
 * or double-clicked checkout is indistinguishable from the one that succeeded — except that
 * `paymentReference` is `null`, because nothing was charged the second time.
 */
export interface CheckoutResponse {
  enrollmentId: number | null;
  courseId: number;
  accessType: CourseAccessType | null;
  access: CourseAccessResponse | null;
  /**
   * The gateway's reference for the charge this call made, or `null` when nothing was
   * charged. Payments are simulated by the backend; its references are prefixed `sim_`.
   */
  paymentReference: string | null;
}

/** Query parameter of the student course details endpoint. */
export type CourseViewMode = "ENROLLED" | "DISCOVER";

/**
 * Types local to the course editor.
 *
 * The state model itself (`CourseEditorState` and its children) is canonical and lives
 * in `@/shared/courses` — nothing here redefines it. What belongs to this feature is
 * the editor's *mode*, its validation errors, and the small drafts the inline forms
 * hand back before the hook turns them into editor state.
 */
export type {
  CourseEditorState,
  CourseLessonEditorState,
  CourseModuleEditorState,
  QuizEditorState,
  QuizQuestionEditorState,
  QuizOptionEditorState,
  SubscriptionPlanEditorState,
} from "@/shared/courses";

/**
 * Which course the editor is working on.
 *
 * `CREATE` starts from a blank state and ends in a `POST`; `EDIT` hydrates from the
 * aggregate `GET` and saves with a `PUT`. Everything between those two ends — state,
 * validation, components — is shared.
 */
export type CourseEditorMode =
  | { type: "CREATE" }
  | { type: "EDIT"; courseId: string };

/**
 * Field-level validation messages. `step` carries the wizard's single per-step message
 * and `general` any unexpected failure, following the project's error convention.
 */
export interface CourseEditorErrors {
  title?: string;
  description?: string;
  purchasePrice?: string;
  subscriptionPlans?: string;
  step?: string;
  general?: string;
}

/** What the inline lesson form returns; the hook assigns the key and order index. */
export interface LessonDraft {
  title: string;
  description: string;
  videoUrl: string;
  quiz: import("@/shared/courses").QuizEditorState | null;
}

/** What the inline module form returns. */
export interface ModuleDraft {
  title: string;
  description: string;
}

/** What the inline subscription-plan form returns. */
export interface SubscriptionPlanDraft {
  name: string;
  duration: number;
  unit: import("@/shared/courses").SubscriptionUnit;
  price: number;
}

/**
 * The two surfaces the reference UI draws the shared sections on: the create wizard's
 * steps and the course editor's tabs. They differ only in spacing and chrome tokens,
 * so one component renders both rather than the codebase carrying two near-copies.
 */
export type CourseEditorSurface = "wizard" | "tabs";

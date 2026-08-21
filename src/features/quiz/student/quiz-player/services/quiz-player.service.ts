import { submitQuizAttempt } from "../api/quiz-player.api";
import { toQuizResultView } from "../mappers/quiz-player.mapper";
import type { QuizResultView, QuizView } from "../types/quiz-player.types";

/**
 * Sends the chosen option ids and returns what the server made of them.
 *
 * The payload has no field for a score or a verdict, and none is computed here: the
 * result the player renders is the one the backend graded.
 */
export async function submitQuiz(
  courseId: number,
  quiz: QuizView,
  answers: Record<string, string>,
): Promise<QuizResultView> {
  const attempt = await submitQuizAttempt(courseId, quiz.id, {
    answers: quiz.questions.map((question) => ({
      questionId: question.id,
      optionId: answers[question.id],
    })),
  });

  return toQuizResultView(attempt, quiz);
}

/**
 * Hint copy carried over from the reference prototype.
 *
 * TODO: connect to real API. The backend models `hintByAiEnabled` per question but
 * exposes no hint endpoint yet, so the surface the reference UI shows is kept and its
 * source is isolated here — the whole placeholder disappears the moment an endpoint
 * exists.
 */
const AI_HINTS = [
  "فكر في المفهوم الأساسي الذي يربط عناصر السؤال، وراجع الجزء ذي الصلة من محتوى الدرس.",
  "انظر إلى الفروق الدقيقة بين الخيارات المتاحة، وتذكر ما تعلمته عن هذا الموضوع في الدرس.",
  "تأمل في السياق الذي طُرح فيه هذا المفهوم خلال الدرس، وفكر في هدفه الرئيسي.",
  "ركز على الكلمات المفتاحية في السؤال وتذكر كيف تناولها الدرس بالشرح والتوضيح.",
  "فكر في العلاقة بين السبب والنتيجة المذكورَين في السؤال، وتذكر التعريفات التي مرّت في الدرس.",
  "قارن بين الخيارات وفق المعايير التي ناقشها الدرس، وفكر أيها ينسجم مع السياق العام.",
];

export async function requestAiHint(): Promise<string> {
  await new Promise<void>((resolve) => setTimeout(resolve, 1200));
  return AI_HINTS[Math.floor(Math.random() * AI_HINTS.length)];
}

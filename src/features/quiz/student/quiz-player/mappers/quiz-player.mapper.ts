import type {
  LearnerQuizQuestionResponse,
  LearnerQuizResponse,
  QuizAttemptResponse,
  QuizQuestionView,
  QuizResultAnswerView,
  QuizResultView,
  QuizView,
} from "../types/quiz-player.types";

function toQuestionView(dto: LearnerQuizQuestionResponse): QuizQuestionView {
  return {
    id: dto.id,
    text: dto.text,
    hintByAiEnabled: dto.hintByAiEnabled ?? false,
    options: [...(dto.options ?? [])]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map((option) => ({ id: option.id, text: option.text })),
  };
}

/**
 * `state` is absent for a viewer the course tracks no progress for. Treating that as
 * "not available" keeps a discovery viewer out of the player rather than letting them
 * open a quiz the server would refuse.
 */
export function toQuizView(dto: LearnerQuizResponse): QuizView {
  const state = dto.state;

  return {
    id: dto.id,
    title: dto.title,
    instructions: dto.instructions ?? "",
    passingScore: dto.passingScore ?? 0,
    questions: [...(dto.questions ?? [])]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(toQuestionView),
    available: state?.available ?? false,
    attemptCount: state?.attemptCount ?? 0,
    passed: state?.passed ?? false,
    bestScore: state?.bestScore ?? null,
  };
}

/**
 * Joins the graded attempt with the quiz's own texts.
 *
 * The attempt carries ids and verdicts; the question and option wording lives on the
 * quiz the learner just answered. Neither side is recomputed — `correct`, `score` and
 * `passed` are copied straight from the server's verdict.
 */
export function toQuizResultView(
  dto: QuizAttemptResponse,
  quiz: QuizView,
): QuizResultView {
  const questionsById = new Map(quiz.questions.map((question) => [question.id, question]));

  const answers: QuizResultAnswerView[] = (dto.answers ?? []).map((answer) => {
    const question = questionsById.get(answer.questionId);
    const optionText = (optionId: string | null) =>
      question?.options.find((option) => option.id === optionId)?.text ?? "";

    return {
      questionId: answer.questionId,
      questionText: question?.text ?? "",
      selectedOptionText: optionText(answer.selectedOptionId),
      correctOptionText: optionText(answer.correctOptionId),
      correct: answer.correct ?? false,
      explanation: answer.explanation ?? "",
    };
  });

  return {
    attemptId: dto.attemptId,
    attemptNumber: dto.attemptNumber ?? 1,
    score: dto.score ?? 0,
    passingScore: dto.passingScore ?? quiz.passingScore,
    correctCount: dto.correctCount ?? 0,
    totalQuestions: dto.totalQuestions ?? quiz.questions.length,
    passed: dto.passed ?? false,
    answers,
  };
}

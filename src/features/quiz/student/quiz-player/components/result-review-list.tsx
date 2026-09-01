import { CheckCircle2, XCircle } from "lucide-react";
import { DANGER, FONT, SUCCESS } from "../formatters/quiz-player.formatter";
import type { QuizResultAnswerView } from "../types/quiz-player.types";

interface ResultReviewListProps {
  answers: QuizResultAnswerView[];
}

export function ResultReviewList({ answers }: ResultReviewListProps) {
  return (
    <div className="flex flex-col gap-3 text-right" style={{ width: "100%", minWidth: 0 }}>
      {answers.map((answer, index) => (
        <div
          key={answer.questionId}
          style={{
            background: answer.correct ? "rgba(34,197,94,0.04)" : "rgba(212,24,61,0.04)",
            borderRadius: 12,
            border: `1px solid ${answer.correct ? "rgba(34,197,94,0.15)" : "rgba(212,24,61,0.15)"}`,
            padding: "12px 14px",
            boxSizing: "border-box",
            maxWidth: "100%",
          }}
        >
          <div className="flex items-start gap-2" style={{ minWidth: 0 }}>
            <div style={{ flexShrink: 0, marginTop: 2 }}>
              {answer.correct ? (
                <CheckCircle2 size={15} color={SUCCESS} strokeWidth={2} />
              ) : (
                <XCircle size={15} color={DANGER} strokeWidth={2} />
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                className="rs-longform"
                style={{
                  fontFamily: FONT,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#1E2340",
                  marginBottom: 4,
                  lineHeight: 1.65,
                }}
              >
                س{index + 1}: {answer.questionText}
              </div>
              <div
                className="rs-longform"
                style={{
                  fontFamily: FONT,
                  fontSize: 12,
                  color: answer.correct ? "#15803D" : "#B91C1C",
                  lineHeight: 1.6,
                }}
              >
                إجابتك: {answer.selectedOptionText}
              </div>
              <div
                className="rs-longform"
                style={{ fontFamily: FONT, fontSize: 12, color: "#27AE60", lineHeight: 1.6 }}
              >
                الإجابة الصحيحة: {answer.correctOptionText}
              </div>
              {answer.explanation && (
                <div
                  className="rs-longform"
                  style={{
                    fontFamily: FONT,
                    fontSize: 12,
                    color: "#717182",
                    marginTop: 4,
                    lineHeight: 1.7,
                  }}
                >
                  {answer.explanation}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

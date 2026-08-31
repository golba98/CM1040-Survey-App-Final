import type { Answer, Answers } from "./types";
import type { Question } from "./survey";

export const rankingSize = 3;

export function parseRanking(value?: string): string[] {
  if (!value) return Array(rankingSize).fill("");
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return Array(rankingSize).fill("");
    return Array.from({ length: rankingSize }, (_, index) =>
      typeof parsed[index] === "string" ? parsed[index] : "",
    );
  } catch {
    return Array(rankingSize).fill("");
  }
}

export function isRankingItemTaken(answer: Answer | undefined, item: string, index: number) {
  const values = parseRanking(answer?.textAnswer);
  return values.includes(item) && values[index] !== item;
}

export function isAnswerMissing(question: Question, answer?: Answer): boolean {
  if (!question.required) return false;
  if (!answer) return true;
  if (question.type === "text") return !answer.textAnswer?.trim();
  if (question.type === "rating") return !answer.numericAnswer;
  if (question.type === "choice") return !answer.textAnswer;
  return parseRanking(answer.textAnswer).some((value) => !value);
}

export function visibleQuestions(questions: Question[], answers: Answers): Question[] {
  return questions.filter(
    (question) =>
      !question.showWhen ||
      answers[question.showWhen.questionId]?.textAnswer === question.showWhen.equals,
  );
}

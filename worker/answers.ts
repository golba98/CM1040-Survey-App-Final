import { questionMap, questions, retiredQuestionIds } from "../src/shared/survey";
import { clean } from "./http";

export type StoredAnswer = string | number | string[];
export type StoredAnswers = Record<string, StoredAnswer>;

export type AnswerInput = {
  questionId: string;
  numericAnswer?: unknown;
  textAnswer?: unknown;
};

export const participantAnswerIds = new Set([
  "participant_name",
  "participant_device",
  "website_experience",
]);

export const exportQuestions = questions.filter(
  (question) =>
    !retiredQuestionIds.has(question.id) &&
    !participantAnswerIds.has(question.id),
);

export function packAnswers(inputs: AnswerInput[]): StoredAnswers {
  return Object.fromEntries(
    inputs.flatMap((input): Array<[string, StoredAnswer]> => {
      const question = questionMap.get(input.questionId);
      if (!question || participantAnswerIds.has(input.questionId)) return [];

      if (question.type === "rating")
        return [[input.questionId, Number(input.numericAnswer)]];
      if (question.type === "ranking")
        return [
          [
            input.questionId,
            JSON.parse(clean(input.textAnswer)) as string[],
          ],
        ];
      return [[input.questionId, clean(input.textAnswer)]];
    }),
  );
}

export function parseStoredAnswers(value: unknown): StoredAnswers {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as StoredAnswers)
      : {};
  } catch {
    return {};
  }
}

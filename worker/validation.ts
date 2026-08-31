import { questionMap, questions } from "../src/shared/survey";
import { clean } from "./http";

type IncomingAnswer = {
  questionId?: string;
  answerType?: string;
  numericAnswer?: unknown;
  textAnswer?: unknown;
};
type IncomingPayload = {
  responseUuid?: unknown;
  participant?: { deviceType?: unknown; websiteExperience?: unknown };
  answers?: unknown;
};

const validUuid = (value: unknown) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
const deviceTypes = [
  "Desktop computer",
  "Laptop",
  "Mobile phone",
  "Tablet",
  "Other",
];

function parseAnswers(payload: IncomingPayload): IncomingAnswer[] {
  return Array.isArray(payload.answers)
    ? (payload.answers as IncomingAnswer[])
    : [];
}

function validRanking(value: unknown, options: string[] | undefined) {
  try {
    const ranking: unknown = JSON.parse(clean(value));
    return (
      Array.isArray(ranking) &&
      ranking.length === options?.length &&
      new Set(ranking).size === ranking.length &&
      ranking.every(
        (item) => typeof item === "string" && options?.includes(item),
      )
    );
  } catch {
    return false;
  }
}

export function validateSubmission(payload: IncomingPayload) {
  const errors: Record<string, string> = {};
  if (!validUuid(payload.responseUuid))
    errors.responseUuid = "A valid response ID is required.";
  const participant = payload.participant ?? {};
  if (!deviceTypes.includes(String(participant.deviceType)))
    errors.participant_device = "Please select the device you are using.";
  if (!/^[1-5]$/.test(String(participant.websiteExperience)))
    errors.website_experience = "Please select your website experience level.";

  const answers = parseAnswers(payload);
  const seen = new Set<string>();
  for (const answer of answers) {
    const questionId = answer.questionId ?? "";
    const question = questionMap.get(questionId);
    if (!question || seen.has(questionId)) {
      errors[questionId || "answers"] = "This answer is not recognised.";
      continue;
    }
    seen.add(questionId);
    if (
      question.showWhen &&
      answers.find((item) => item.questionId === question.showWhen?.questionId)
        ?.textAnswer !== question.showWhen.equals
    )
      continue;
    if (
      question.required &&
      question.type !== "ranking" &&
      answer.numericAnswer == null &&
      !clean(answer.textAnswer)
    )
      errors[question.id] = `Please answer: ${question.text}`;
    if (
      question.type === "rating" &&
      (!Number.isInteger(answer.numericAnswer) ||
        Number(answer.numericAnswer) < 1 ||
        Number(answer.numericAnswer) > 5)
    )
      errors[question.id] = `Please select a rating for: ${question.text}`;
    if (
      question.type === "choice" &&
      !question.options?.includes(clean(answer.textAnswer))
    )
      errors[question.id] =
        `Please choose one of the available options for: ${question.text}`;
    if (
      question.type === "ranking" &&
      !validRanking(answer.textAnswer, question.options)
    )
      errors[question.id] =
        `Please rank all of the concepts for: ${question.text}`;
    if (question.type === "text" && clean(answer.textAnswer).length > 4000)
      errors[question.id] = "Please keep this response under 4,000 characters.";
  }
  for (const question of questions) {
    if (
      !question.required ||
      question.id === "participant_name" ||
      question.id === "text_too_small_details"
    )
      continue;
    const answer = answers.find((item) => item.questionId === question.id);
    if (
      !answer ||
      (question.type === "text" && !clean(answer.textAnswer)) ||
      (question.type !== "text" &&
        answer.numericAnswer == null &&
        !clean(answer.textAnswer))
    )
      errors[question.id] ??= `Please answer: ${question.text}`;
  }
  return errors;
}

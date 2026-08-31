import { describe, expect, it } from "vitest";
import { questions } from "../src/shared/survey";
import { validateSubmission } from "./validation";

function validAnswers() {
  return questions
    .filter((question) => question.required && !question.hidden)
    .map((question) => {
      if (question.type === "rating")
        return { questionId: question.id, numericAnswer: 4 };
      if (question.type === "ranking")
        return {
          questionId: question.id,
          textAnswer: JSON.stringify(question.options),
        };
      return {
        questionId: question.id,
        textAnswer:
          question.id === "participant_device"
            ? "Laptop"
            : question.id === "website_experience"
              ? "4 — Very comfortable"
              : question.options?.[0] ?? "Detailed feedback",
      };
    });
}

function validPayload() {
  return {
    responseUuid: "123e4567-e89b-42d3-a456-426614174000",
    participant: { deviceType: "Laptop", websiteExperience: 4 },
    answers: validAnswers(),
  };
}

describe("comparison submission validation", () => {
  it("accepts the complete comparison and final-build instrument", () => {
    expect(validateSubmission(validPayload())).toEqual({});
  });

  it("requires every comparison choice", () => {
    const payload = validPayload();
    payload.answers = payload.answers.filter(
      (answer) => answer.questionId !== "preferred_navigation",
    );
    expect(validateSubmission(payload)).toHaveProperty("preferred_navigation");
  });

  it("rejects unknown comparison choices and malformed rankings", () => {
    const payload = validPayload();
    const navigation = payload.answers.find(
      (answer) => answer.questionId === "preferred_navigation",
    );
    if (navigation) navigation.textAnswer = "A fourth demo";
    const ranking = payload.answers.find(
      (answer) => answer.questionId === "concept_ranking",
    );
    if (ranking)
      ranking.textAnswer = JSON.stringify([
        "Timeline History",
        "Timeline History",
        "Visual Data",
      ]);
    const errors = validateSubmission(payload);
    expect(errors).toHaveProperty("preferred_navigation");
    expect(errors).toHaveProperty("concept_ranking");
  });

  it("accepts the neutral comparison option", () => {
    const payload = validPayload();
    for (const answer of payload.answers) {
      if (answer.questionId.startsWith("preferred_") && answer.textAnswer)
        answer.textAnswer = "No clear preference";
    }
    expect(validateSubmission(payload)).toEqual({});
  });
});

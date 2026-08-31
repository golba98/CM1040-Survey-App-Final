import { describe, expect, it } from "vitest";
import { isAnswerMissing, parseRanking, visibleQuestions } from "./survey-logic";
import type { Question } from "./survey";

describe("survey logic", () => {
  it("uses empty ranking slots when persisted ranking data is malformed", () => {
    expect(parseRanking("not json")).toEqual(["", "", ""]);
    expect(parseRanking('["Timeline History"]')).toEqual(["Timeline History", "", ""]);
  });

  it("only exposes conditional questions when their condition is met", () => {
    const conditionalQuestion: Question = {
      id: "details",
      text: "Details",
      type: "text",
      showWhen: { questionId: "choice", equals: "Yes" },
    };
    expect(visibleQuestions([conditionalQuestion], { choice: { textAnswer: "No" } })).toEqual([]);
    expect(visibleQuestions([conditionalQuestion], { choice: { textAnswer: "Yes" } })).toEqual([
      conditionalQuestion,
    ]);
  });

  it("checks required ranking answers without parsing errors", () => {
    const question: Question = { id: "rank", text: "Rank", type: "ranking", required: true };
    expect(isAnswerMissing(question, { textAnswer: "bad data" })).toBe(true);
    expect(isAnswerMissing(question, { textAnswer: '["A", "B", "C"]' })).toBe(false);
  });
});

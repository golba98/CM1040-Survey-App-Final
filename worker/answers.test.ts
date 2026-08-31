import { describe, expect, it } from "vitest";
import { packAnswers, parseStoredAnswers } from "./answers";

describe("stored survey answers", () => {
  it("packs answers by question id using native JSON value types", () => {
    expect(
      packAnswers([
        { questionId: "participant_name", textAnswer: "Ada" },
        { questionId: "participant_device", textAnswer: "Laptop" },
        { questionId: "website_experience", textAnswer: "5" },
        {
          questionId: "participant_consent",
          textAnswer: "Yes, I agree to take part",
        },
        { questionId: "timeline_first_impression_visual", numericAnswer: 5 },
        {
          questionId: "concept_ranking",
          textAnswer: JSON.stringify([
            "Timeline History",
            "Editorial Story",
            "Visual Data",
          ]),
        },
      ]),
    ).toEqual({
      participant_consent: "Yes, I agree to take part",
      timeline_first_impression_visual: 5,
      concept_ranking: [
        "Timeline History",
        "Editorial Story",
        "Visual Data",
      ],
    });
  });

  it("safely parses stored objects and rejects malformed values", () => {
    expect(parseStoredAnswers('{"rating":4}')).toEqual({ rating: 4 });
    expect(parseStoredAnswers("not json")).toEqual({});
    expect(parseStoredAnswers("[]")).toEqual({});
  });
});

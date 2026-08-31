import { describe, expect, it } from "vitest";
import { concepts, prototypes, questions, screenQuestions } from "./survey";

describe("survey definition", () => {
  it("covers each concept and era with paired layouts", () => {
    expect(prototypes).toHaveLength(9);
    expect(new Set(prototypes.map((p) => p.conceptKey))).toEqual(new Set(["timeline", "editorial", "visual-data"]));
    expect(prototypes.every((p) => p.desktop.endsWith("desktop.png") && p.mobile.endsWith("mobile.png"))).toBe(true);
  });

  it("contains unique stable question identifiers", () => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(questions.find((q) => q.id === "most_important_improvement")?.required).toBe(true);
    expect(questions.find((q) => q.id === "text_too_small_details")?.showWhen).toEqual({ questionId: "text_too_small", equals: "Yes" });
  });

  it("names each concept in its optional prototype questions", () => {
    for (const prototype of prototypes) {
      const prototypeQuestions = screenQuestions(
        prototype.key,
        prototype.conceptKey,
        prototype.conceptName,
        prototype.eraLabel,
      );
      expect(prototypeQuestions.every((question) => question.text.includes(prototype.conceptName))).toBe(true);
      expect(prototypeQuestions.every((question) => question.required === false)).toBe(true);
    }

    for (const concept of concepts) {
      const firstImpression = questions.find((question) => question.id === `${concept.key}_first_impression_visual`);
      expect(firstImpression?.text).toContain(concept.name);
      expect(firstImpression?.required).toBe(false);
    }
  });
});

import { describe, expect, it } from "vitest";
import { prototypes, questions } from "./survey";

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
});

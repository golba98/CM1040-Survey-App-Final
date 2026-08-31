import { describe, expect, it } from "vitest";
import {
  comparisonQuestions,
  conceptPreferenceOptions,
  concepts,
  finalBuildQuestions,
  layoutQuestionId,
  primaryEra,
  prototypes,
  questionMap,
  questions,
  retiredQuestionIds,
  screenQuestions,
} from "./survey";

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

  it("finishes with focused comparison and final-build questions", () => {
    expect(comparisonQuestions.map((question) => question.id)).toEqual([
      "concept_ranking",
      "concept_ranking_reason",
      "preferred_at_glance",
      "preferred_first_time_use",
      "preferred_visual_design",
      "preferred_navigation",
      "preferred_readability",
      "preferred_responsive_design",
    ]);
    expect(comparisonQuestions.every((question) => question.required)).toBe(true);
    expect(conceptPreferenceOptions).toEqual([
      "Timeline History",
      "Editorial Story",
      "Visual Data",
      "No clear preference",
    ]);
    expect(
      comparisonQuestions
        .filter((question) => question.type === "choice")
        .every((question) => question.options === conceptPreferenceOptions),
    ).toBe(true);
    expect(finalBuildQuestions.map((question) => question.id)).toEqual([
      "preferred_concept_keep",
      "other_concepts_borrow",
      "most_important_improvement",
      "add_or_remove",
      "final_comments",
    ]);
    expect(finalBuildQuestions.filter((question) => question.required).map((question) => question.id)).toEqual([
      "preferred_concept_keep",
      "other_concepts_borrow",
      "most_important_improvement",
    ]);
  });

  it("requires the shared chapter and leaves the rest optional", () => {
    for (const prototype of prototypes) {
      const asked = screenQuestions(prototype.key, prototype.conceptKey, prototype.conceptName, prototype.eraLabel, prototype.eraKey);
      expect(asked.every((q) => q.text.includes(prototype.conceptName))).toBe(true);
      expect(asked.every((q) => q.prototypeKey === prototype.key)).toBe(true);
      if (prototype.eraKey === primaryEra.key) {
        // Every website is judged on the same chapter, so its core block is
        // required; only the "anything distracting" prompt is a spare.
        expect(asked.filter((q) => q.required).map((q) => q.id)).toEqual([
          `${prototype.conceptKey}_first_impression_visual`,
          `${prototype.conceptKey}_purpose_clear`,
          `${prototype.conceptKey}_ease_of_use`,
          `${prototype.conceptKey}_conveys`,
          `${prototype.conceptKey}_first_attention`,
          `${prototype.conceptKey}_change`,
        ]);
        expect(questionMap.get(`${prototype.conceptKey}_first_distraction`)?.required).toBe(false);
      } else {
        expect(asked.every((q) => q.required === false)).toBe(true);
      }
    }
  });

  it("asks how each website conveys its information, and which layouts were seen", () => {
    for (const concept of concepts) {
      const conveys = questionMap.get(`${concept.key}_conveys`);
      expect(conveys?.text).toContain(concept.name);
      expect(conveys?.required).toBe(true);
      expect(questionMap.get(layoutQuestionId(concept.key))?.required).toBe(true);
      expect(questionMap.get(`${concept.key}_first_impression_visual`)?.required).toBe(true);
    }
  });

  it("keeps superseded identifiers resolvable but never asks them", () => {
    for (const id of retiredQuestionIds) {
      expect(questionMap.get(id)?.hidden).toBe(true);
      expect(questionMap.get(id)?.required).toBe(false);
    }
    expect(retiredQuestionIds.has("first_impression_purpose")).toBe(true);
    expect(retiredQuestionIds.has("layouts_viewed_bandwidth")).toBe(true);
    expect(retiredQuestionIds.has("overall_visual_design")).toBe(true);
    expect(retiredQuestionIds.has("liked_most")).toBe(true);
    expect(retiredQuestionIds.has("concept_ranking")).toBe(false);
  });
});

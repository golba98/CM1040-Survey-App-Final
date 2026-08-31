import { crossConceptQuestions, prototypes } from "../shared/survey";
import type { Step } from "../shared/types";

export const firstQuestionIds = [
  "first_impression_visual",
  "first_impression_purpose",
  "first_attention",
  "first_distraction",
];

export const participantQuestionIds = [
  "participant_name",
  "participant_device",
  "website_experience",
];

export const finalQuestionIds = [
  "concept_ranking",
  "concept_ranking_reason",
  "overall_visual_design",
  "overall_usability",
  "overall_navigation",
  "overall_readability",
  "overall_mobile_design",
  "liked_most",
  "liked_least",
  "overall_confusing",
  "remove_from_site",
  "add_to_site",
  "most_important_improvement",
  "final_comments",
];

export const crossQuestionIds = crossConceptQuestions
  .map((question) => question.id)
  .filter((id) => !finalQuestionIds.includes(id));

export const surveySteps: Step[] = [
  { key: "welcome", title: "Welcome", kind: "welcome" },
  { key: "participant", title: "About you", kind: "participant" },
  ...prototypes.map((prototype) => ({
    key: prototype.key,
    title: `${prototype.conceptName} · ${prototype.eraLabel}`,
    kind: "prototype" as const,
    prototypeKey: prototype.key,
  })),
  { key: "cross", title: "Overall experience", kind: "cross" },
  { key: "final", title: "Final thoughts", kind: "final" },
];

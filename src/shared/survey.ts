export type AnswerType = "rating" | "choice" | "text" | "ranking";
export type LayoutType = "general" | "desktop" | "mobile" | "comparison";
/** Which wording the 1–5 radio scale uses. Declared per question so the labels
 *  always agree with how the question is phrased. */
export type Scale = "quality" | "clarity";
export type Question = {
  id: string; text: string; type: AnswerType; required?: boolean; stronglyEncouraged?: boolean;
  options?: string[]; min?: number; max?: number; prototypeKey?: string; layoutType?: LayoutType;
  scale?: Scale; hidden?: boolean;
  showWhen?: { questionId: string; equals: string };
};

export const concepts = [
  { key: "timeline", name: "Timeline History", tone: "Chronological milestones and infrastructure" },
  { key: "editorial", name: "Editorial Story", tone: "Long-form report and reference archive" },
  { key: "visual-data", name: "Visual Data", tone: "Indicators, maps, charts, and event logs" },
] as const;
export const eras = [
  { key: "bandwidth", label: "2006–2012", title: "Breaking the Bandwidth Bottleneck" },
  { key: "local", label: "2013–2019", title: "Broadband Becomes Mobile and Local" },
  { key: "divide", label: "2020–2026", title: "5G, New Mega-Cables and the Digital Divide" },
] as const;
export const prototypes = concepts.flatMap((concept) => eras.map((era) => ({
  key: `${concept.key}-${era.key}`, conceptKey: concept.key, conceptName: concept.name,
  eraKey: era.key, eraLabel: era.label, title: era.title,
  desktop: `/prototypes/${concept.key}/${era.key}/desktop.png`, mobile: `/prototypes/${concept.key}/${era.key}/mobile.png`,
})));

const rating = (id: string, text: string, scale: Scale = "quality", layoutType: LayoutType = "general"): Question => ({ id, text, type: "rating", required: true, min: 1, max: 5, scale, layoutType });
const choice = (id: string, text: string, options: string[], required = true): Question => ({ id, text, type: "choice", required, options });
const text = (id: string, textValue: string, required = false, stronglyEncouraged = false): Question => ({ id, text: textValue, type: "text", required, stronglyEncouraged });

export const consentStatement =
  "Your answers are used only for this Web Development coursework. Nothing is collected that identifies you: the nickname is optional and everything else is a rating or a comment about the designs. Taking part is voluntary and you can close the page at any point without submitting.";

/** The chapter every participant reviews, so the three websites are compared on
 *  identical content. The other two chapters are browsable but optional. */
export const primaryEra = eras[0];

export const globalQuestions: Question[] = [
  choice("participant_consent", "Please confirm before you begin.", ["Yes, I agree to take part"]),
  { id: "participant_name", text: "What name or nickname would you like to use?", type: "text" },
  choice("participant_device", "What device are you currently using to complete this survey?", ["Desktop computer", "Laptop", "Mobile phone", "Tablet", "Other"]),
  choice("website_experience", "How comfortable are you with using websites in general?", ["1 — Not very comfortable", "2 — Slightly comfortable", "3 — Comfortable", "4 — Very comfortable", "5 — Extremely comfortable"]),
];

/** Superseded ids. Kept so answers already collected still resolve, and so a
 *  saved draft from an older layout can drop them on restore. */
const retiredQuestions: Question[] = [
  rating("first_impression_visual", "Looking at this design for the first time, how visually appealing do you find it?"),
  choice("first_impression_purpose", "When you first look at this page, is it clear what the website is about?", ["Yes, immediately", "Mostly", "Somewhat", "Not really", "No"]),
  text("first_attention", "What is the first thing on the page that catches your attention?"),
  text("first_distraction", "Does anything on this page feel unnecessary, distracting or out of place?"),
  text("remove_from_site", "Is there anything you think should be removed from the website?"),
  text("add_to_site", "Is there anything you think should be added to the website?"),
  text("overall_confusing", "Was there anything that confused you while looking through the designs?"),
  ...eras.map((era) => text(`layouts_viewed_${era.key}`, `Which layouts did you look at for the ${era.label} designs?`)),
  ...eras.map((era) => text(`layouts_opened_${era.key}`, `Layouts actually opened for ${era.label}`)),
].map((question) => ({ ...question, required: false, hidden: true }));

/** How each website presents its material — the difference actually being
 *  tested, so it is asked in the terms of that website's own approach. */
const conveysQuestion = (conceptKey: string, conceptName: string): string =>
  conceptKey === "timeline"
    ? `Do the dated milestone cards in ${conceptName} make the story easy to follow in order?`
    : conceptKey === "editorial"
      ? `Does the long-form report layout in ${conceptName} make the story easy to follow?`
      : `Do the indicators, map and charts in ${conceptName} make the information easier to understand?`;

/** One confirmation per website that both layouts were looked at, plus a hidden
 *  companion the app fills in from the Desktop/Mobile toggle. */
export const layoutQuestions: Question[] = concepts.flatMap((concept) => [
  { ...choice(`layouts_viewed_${concept.key}`, `Which layouts of ${concept.name} did you look at?`, ["Both desktop and mobile", "Desktop only", "Mobile only"]), prototypeKey: `${concept.key}-${primaryEra.key}`, layoutType: "comparison" as LayoutType },
  { id: `layouts_opened_${concept.key}`, text: `Layouts actually opened for ${concept.name}`, type: "text", required: false, hidden: true, prototypeKey: `${concept.key}-${primaryEra.key}`, layoutType: "comparison" },
]);
export const layoutQuestionId = (conceptKey: string) => `layouts_viewed_${conceptKey}`;
export const layoutTrackingId = (conceptKey: string) => `layouts_opened_${conceptKey}`;

/**
 * The 2006-2012 chapter carries the required block, so every website is judged
 * on the same content. The other two chapters get a short optional block for
 * anyone who browses to them inside the mini site.
 */
export const screenQuestions = (prototypeKey: string, conceptKey: string, conceptName: string, eraLabel: string, eraKey: string = primaryEra.key): Question[] =>
  eraKey === primaryEra.key
    ? [
        { ...rating(`${conceptKey}_first_impression_visual`, `Looking at ${conceptName} for the first time, how visually appealing do you find it?`), prototypeKey },
        { ...choice(`${conceptKey}_purpose_clear`, `Looking at ${conceptName}, is it clear what the website is about?`, ["Yes, immediately", "Mostly", "Somewhat", "Not really", "No"]), prototypeKey },
        { ...rating(`${conceptKey}_ease_of_use`, `How easy would ${conceptName} be to use?`), prototypeKey },
        { ...choice(`${conceptKey}_conveys`, conveysQuestion(conceptKey, conceptName), ["Yes", "Mostly", "Somewhat", "Not really", "No"]), prototypeKey },
        { ...text(`${conceptKey}_first_attention`, `What is the first thing in ${conceptName} that catches your attention?`, true), prototypeKey },
        { ...text(`${conceptKey}_change`, `What would you change about ${conceptName}?`, true), prototypeKey },
        { ...text(`${conceptKey}_first_distraction`, `Does anything in ${conceptName} feel unnecessary, distracting, or out of place?`), prototypeKey },
      ]
    : [
        { ...rating(`${prototypeKey}_visual_appeal`, `How visually appealing is the ${conceptName} ${eraLabel} page?`), prototypeKey, required: false, stronglyEncouraged: true },
        { ...text(`${prototypeKey}_change`, `What would you change about the ${conceptName} ${eraLabel} page?`, false, true), prototypeKey },
      ];

const legacyOverallQuestions: Question[] = [
  rating("layout_glance", "How easy is the website to understand at a glance?", "clarity"),
  choice("layout_order", "Do you think the information is arranged in a logical order?", ["Yes", "Mostly", "Unsure", "Not really", "No"]),
  choice("layout_balance", "Does the page feel too empty, too crowded, or balanced?", ["Much too empty", "Slightly too empty", "Balanced", "Slightly too crowded", "Much too crowded"]),
  rating("navigation_clarity", "How clear is it how you would navigate to the different parts of the website?", "clarity"),
  text("navigation_change", "Is there anything about the navigation that you would change?"),
  rating("button_clarity", "How easy is it to identify the main buttons or actions?"),
  rating("readability", "How easy is the text on these designs to read?"),
  choice("text_too_small", "Does any text appear too small?", ["No", "Yes", "Unsure"]),
  text("text_too_small_details", "Which text appears too small?", false, false),
  choice("contrast", "Is there enough contrast between the text and its background?", ["Yes", "Mostly", "Unsure", "Not really", "No"]),
  rating("desktop_space", "How well do the desktop layouts use the available screen space?", "quality", "desktop"),
  text("desktop_change", "Would you change anything specifically about the desktop layouts?", false, true),
  rating("mobile_ease", "How easy are the mobile layouts to use?", "quality", "mobile"),
  choice("mobile_tap_targets", "Are the buttons and controls large enough to comfortably tap?", ["Yes", "Mostly", "Unsure", "Not really", "No"]),
  rating("mobile_navigation", "How easy is the mobile navigation to understand?", "quality", "mobile"),
  text("mobile_information", "Is any important information harder to find on mobile than on desktop?"),
  text("mobile_change", "What would you change specifically about the mobile designs?", false, true),
  choice("desktop_mobile_same", "Do the desktop and mobile versions feel like the same website?", ["Yes, definitely", "Mostly", "Somewhat", "Not really", "No"], true),
  choice("easier_version", "Which version do you think is easier to understand?", ["Desktop", "Mobile", "About the same", "Unsure"], false),
  choice("a11y_keyboard", "Using only the Tab key, could you reach all of the links and buttons?", ["Yes", "Mostly", "Not really", "I didn't try"], false),
  choice("a11y_focus_visible", "When you move through the page with the Tab key, is it easy to see which item is selected?", ["Yes", "Mostly", "Unsure", "No", "I didn't try"], false),
  choice("a11y_colour_only", "Is any information shown only by colour, with no label or shape to back it up?", ["No", "Possibly", "Yes", "Unsure"], false),
  text("accessibility_barrier", "Did you notice anything that could make the website hard to use for someone with a visual, motor or reading difficulty?"),
  rating("clickable_distinction", "How easy is it to tell clickable elements from ordinary content?"),
  choice("first_time_understanding", "Would someone using this website for the first time understand how to use it?", ["Yes", "Probably", "Unsure", "Probably not", "No"]),
  { id: "concept_ranking", text: "Rank the three visual concepts from your favourite to least favourite.", type: "ranking", required: true, options: concepts.map((c) => c.name) },
  text("concept_ranking_reason", "Why did you rank the concepts in that order?", true),
  rating("overall_visual_design", "Overall, how would you rate the visual design of the website?"),
  rating("overall_usability", "Overall, how would you rate the usability of the website?"),
  rating("overall_navigation", "Overall, how would you rate the navigation?"),
  rating("overall_readability", "Overall, how would you rate the readability?"),
  rating("overall_mobile_design", "Overall, how would you rate the mobile design?", "quality", "mobile"),
  text("liked_most", "What do you like most about the prototype designs?", true),
  text("liked_least", "What do you like least about the prototype designs?", true),
  text("add_or_remove", "Is there anything you would add to, or remove from, the website?"),
  text("most_important_improvement", "If you could make one change to improve these designs, what would you change and why?", true),
  text("final_comments", "Is there anything else you would like to say about the designs?"),
];

const retainedOverallIds = new Set([
  "concept_ranking",
  "concept_ranking_reason",
  "most_important_improvement",
  "add_or_remove",
  "final_comments",
]);
const retiredOverallQuestions = legacyOverallQuestions
  .filter((question) => !retainedOverallIds.has(question.id))
  .map((question) => ({ ...question, required: false, hidden: true }));

export const conceptPreferenceOptions = [
  ...concepts.map((concept) => concept.name),
  "No clear preference",
];

export const comparisonQuestions: Question[] = [
  {
    id: "concept_ranking",
    text: "Rank the three demos from the best foundation for the final website to the least suitable.",
    type: "ranking",
    required: true,
    options: concepts.map((concept) => concept.name),
  },
  text(
    "concept_ranking_reason",
    "What made your first-choice demo the strongest overall?",
    true,
  ),
  choice(
    "preferred_at_glance",
    "Which demo is easiest to understand at a glance?",
    conceptPreferenceOptions,
  ),
  choice(
    "preferred_first_time_use",
    "Which demo would be easiest for a first-time visitor to use?",
    conceptPreferenceOptions,
  ),
  choice(
    "preferred_visual_design",
    "Which demo has the strongest visual design?",
    conceptPreferenceOptions,
  ),
  choice(
    "preferred_navigation",
    "Which demo has the clearest navigation?",
    conceptPreferenceOptions,
  ),
  choice(
    "preferred_readability",
    "Which demo is easiest to read?",
    conceptPreferenceOptions,
  ),
  choice(
    "preferred_responsive_design",
    "Which demo works best across desktop and mobile?",
    conceptPreferenceOptions,
  ),
];

export const finalBuildQuestions: Question[] = [
  text(
    "preferred_concept_keep",
    "What should the final website keep from your first-choice demo?",
    true,
  ),
  text(
    "other_concepts_borrow",
    "Which ideas or features, if any, should it borrow from the other two demos?",
    true,
  ),
  text(
    "most_important_improvement",
    "If you could make one change before the final website is built, what would you change and why?",
    true,
  ),
  text(
    "add_or_remove",
    "Is there anything the final website should add or remove?",
  ),
  text("final_comments", "Is there anything else you would like to say about the final website?"),
];

export const retiredQuestionIds = new Set([
  ...retiredQuestions,
  ...retiredOverallQuestions,
].map((question) => question.id));

export const questions: Question[] = [
  ...globalQuestions,
  ...retiredQuestions,
  ...retiredOverallQuestions,
  ...prototypes.flatMap((p) => screenQuestions(p.key, p.conceptKey, p.conceptName, p.eraLabel, p.eraKey)),
  ...layoutQuestions,
  ...comparisonQuestions,
  ...finalBuildQuestions,
].map((q) => q.id === "text_too_small_details" ? { ...q, showWhen: { questionId: "text_too_small", equals: "Yes" } } : q);
export const questionMap = new Map(questions.map((q) => [q.id, q]));
export const getPrototype = (key: string) => prototypes.find((p) => p.key === key);

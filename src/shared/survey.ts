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
/** Per-demo feedback is invited, not compelled. */
const encouraged = (question: Question): Question => ({ ...question, required: false, stronglyEncouraged: true });

export const consentStatement =
  "Your answers are used only for this Web Development coursework. Nothing is collected that identifies you: the nickname is optional and everything else is a rating or a comment about the designs. Taking part is voluntary and you can close the page at any point without submitting.";

export const globalQuestions: Question[] = [
  choice("participant_consent", "Please confirm before you begin.", ["Yes, I agree to take part"]),
  { id: "participant_name", text: "What name or nickname would you like to use?", type: "text" },
  choice("participant_device", "What device are you currently using to complete this survey?", ["Desktop computer", "Laptop", "Mobile phone", "Tablet", "Other"]),
  choice("website_experience", "How comfortable are you with using websites in general?", ["1 — Not very comfortable", "2 — Slightly comfortable", "3 — Comfortable", "4 — Very comfortable", "5 — Extremely comfortable"]),
];

/** Superseded by the per-concept versions below. Kept so that answers already
 *  collected under these ids still resolve, and so saved drafts can drop them. */
const retiredQuestions: Question[] = [
  rating("first_impression_visual", "Looking at this design for the first time, how visually appealing do you find it?"),
  choice("first_impression_purpose", "When you first look at this page, is it clear what the website is about?", ["Yes, immediately", "Mostly", "Somewhat", "Not really", "No"]),
  text("first_attention", "What is the first thing on the page that catches your attention?"),
  text("first_distraction", "Does anything on this page feel unnecessary, distracting or out of place?"),
  text("remove_from_site", "Is there anything you think should be removed from the website?"),
  text("add_to_site", "Is there anything you think should be added to the website?"),
  text("overall_confusing", "Was there anything that confused you while looking through the designs?"),
].map((question) => ({ ...question, required: false, hidden: true }));
export const retiredQuestionIds = new Set(retiredQuestions.map((question) => question.id));

const conceptFirstImpressionQuestions = (concept: (typeof concepts)[number]): Question[] => {
  const prototypeKey = `${concept.key}-${eras[0].key}`;
  return [
    { ...rating(`${concept.key}_first_impression_visual`, `Looking at the ${concept.name} design for the first time, how visually appealing do you find it?`), prototypeKey },
    { ...text(`${concept.key}_first_attention`, `What is the first thing in the ${concept.name} design that catches your attention?`), prototypeKey },
    { ...text(`${concept.key}_first_distraction`, `Does anything in the ${concept.name} design feel unnecessary, distracting, or out of place?`), prototypeKey },
  ].map(encouraged);
};

/** One confirmation per era step that both layouts were looked at, plus a
 *  hidden companion the app fills in from the Desktop/Mobile toggle. */
export const layoutQuestions: Question[] = eras.flatMap((era) => [
  { ...choice(`layouts_viewed_${era.key}`, `Which layouts did you look at for the ${era.label} designs?`, ["Both desktop and mobile", "Desktop only", "Mobile only"]), layoutType: "comparison" as LayoutType },
  { id: `layouts_opened_${era.key}`, text: `Layouts actually opened for ${era.label}`, type: "text", required: false, hidden: true, layoutType: "comparison" },
]);
export const layoutQuestionId = (eraKey: string) => `layouts_viewed_${eraKey}`;
export const layoutTrackingId = (eraKey: string) => `layouts_opened_${eraKey}`;

/** The first era step asks the full block; later steps ask a short one, so the
 *  survey stays completable without losing per-screen coverage. */
export const screenQuestions = (prototypeKey: string, conceptKey: string, conceptName: string, eraLabel: string, isFirstEra = true): Question[] => [
  { ...rating(`${prototypeKey}_visual_appeal`, `How visually appealing is the ${conceptName} ${eraLabel} page?`), prototypeKey },
  { ...rating(`${prototypeKey}_ease_of_use`, `How easy would the ${conceptName} ${eraLabel} page be to use?`), prototypeKey },
  ...(isFirstEra ? [
    { ...choice(`${prototypeKey}_purpose_clear`, `Is the purpose of the ${conceptName} ${eraLabel} page clear?`, ["Yes", "Mostly", "Somewhat", "Not really", "No"]), prototypeKey },
    ...(conceptKey === "timeline" ? [
      { ...choice(`${prototypeKey}_timeline_flow`, `Are the dates and milestone cards in ${conceptName} ${eraLabel} easy to follow in order?`, ["Yes", "Mostly", "Somewhat", "Not really", "No"]), prototypeKey },
    ] : conceptKey === "editorial" ? [
      { ...choice(`${prototypeKey}_story_scan`, `Is it easy to scan the story sections and supporting archive content in ${conceptName} ${eraLabel}?`, ["Yes", "Mostly", "Somewhat", "Not really", "No"]), prototypeKey },
    ] : [
      { ...choice(`${prototypeKey}_data_scan`, `Do the indicators, map/chart, and event records in ${conceptName} ${eraLabel} make the information easier to understand?`, ["Yes", "Mostly", "Somewhat", "Not really", "No"]), prototypeKey },
    ]),
    { ...text(`${prototypeKey}_confusing`, `Is there anything in the ${conceptName} ${eraLabel} page that you found confusing?`), prototypeKey },
  ] : []),
  { ...text(`${prototypeKey}_change`, `What would you change about the ${conceptName} ${eraLabel} page?`, false, true), prototypeKey },
].map(encouraged);

export const crossConceptQuestions: Question[] = [
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

export const questions: Question[] = [
  ...globalQuestions,
  ...retiredQuestions,
  ...layoutQuestions,
  ...concepts.flatMap(conceptFirstImpressionQuestions),
  ...prototypes.flatMap((p) => screenQuestions(p.key, p.conceptKey, p.conceptName, p.eraLabel, p.eraKey === eras[0].key)),
  ...crossConceptQuestions,
].map((q) => q.id === "text_too_small_details" ? { ...q, showWhen: { questionId: "text_too_small", equals: "Yes" } } : q);
export const questionMap = new Map(questions.map((q) => [q.id, q]));
export const getPrototype = (key: string) => prototypes.find((p) => p.key === key);

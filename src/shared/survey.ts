export type AnswerType = "rating" | "choice" | "text" | "ranking";
export type LayoutType = "general" | "desktop" | "mobile" | "comparison";
export type Question = {
  id: string;
  text: string;
  type: AnswerType;
  required?: boolean;
  stronglyEncouraged?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  prototypeKey?: string;
  layoutType?: LayoutType;
  showWhen?: { questionId: string; equals: string };
};

export const concepts = [
  {
    key: "timeline",
    name: "Timeline History",
    tone: "Chronological milestones and infrastructure",
  },
  {
    key: "editorial",
    name: "Editorial Story",
    tone: "Long-form report and reference archive",
  },
  {
    key: "visual-data",
    name: "Visual Data",
    tone: "Indicators, maps, charts, and event logs",
  },
] as const;
export const eras = [
  {
    key: "bandwidth",
    label: "2006–2012",
    title: "Breaking the Bandwidth Bottleneck",
  },
  {
    key: "local",
    label: "2013–2019",
    title: "Broadband Becomes Mobile and Local",
  },
  {
    key: "divide",
    label: "2020–2026",
    title: "5G, New Mega-Cables and the Digital Divide",
  },
] as const;
export const prototypes = concepts.flatMap((concept) =>
  eras.map((era) => ({
    key: `${concept.key}-${era.key}`,
    conceptKey: concept.key,
    conceptName: concept.name,
    eraKey: era.key,
    eraLabel: era.label,
    title: era.title,
    desktop: `/prototypes/${concept.key}/${era.key}/desktop.png`,
    mobile: `/prototypes/${concept.key}/${era.key}/mobile.png`,
  })),
);

const rating = (id: string, text: string, layoutType: LayoutType = "general"): Question => ({
  id,
  text,
  type: "rating",
  required: true,
  min: 1,
  max: 5,
  layoutType,
});
const choice = (id: string, text: string, options: string[], required = true): Question => ({
  id,
  text,
  type: "choice",
  required,
  options,
});
const text = (
  id: string,
  textValue: string,
  required = false,
  stronglyEncouraged = false,
): Question => ({
  id,
  text: textValue,
  type: "text",
  required,
  stronglyEncouraged,
});

export const globalQuestions: Question[] = [
  {
    id: "participant_name",
    text: "What name or nickname would you like to use?",
    type: "text",
  },
  choice("participant_device", "What device are you currently using to complete this survey?", [
    "Desktop computer",
    "Laptop",
    "Mobile phone",
    "Tablet",
    "Other",
  ]),
  choice("website_experience", "How comfortable are you with using websites in general?", [
    "1 — Not very comfortable",
    "2 — Slightly comfortable",
    "3 — Comfortable",
    "4 — Very comfortable",
    "5 — Extremely comfortable",
  ]),
  rating(
    "first_impression_visual",
    "Looking at this design for the first time, how visually appealing do you find it?",
  ),
  choice(
    "first_impression_purpose",
    "When you first look at this page, is it clear what the website is about?",
    ["Yes, immediately", "Mostly", "Somewhat", "Not really", "No"],
  ),
  text("first_attention", "What is the first thing on the page that catches your attention?", true),
  text(
    "first_distraction",
    "Does anything on this page feel unnecessary, distracting or out of place?",
  ),
];

export const screenQuestions = (
  prototypeKey: string,
  conceptKey: string,
  eraLabel: string,
): Question[] => [
  {
    ...rating(`${prototypeKey}_visual_appeal`, `How visually appealing is this ${eraLabel} page?`),
    prototypeKey,
  },
  {
    ...rating(`${prototypeKey}_ease_of_use`, `How easy would this ${eraLabel} page be to use?`),
    prototypeKey,
  },
  {
    ...choice(`${prototypeKey}_purpose_clear`, "Is the purpose of this page clear?", [
      "Yes",
      "Mostly",
      "Somewhat",
      "Not really",
      "No",
    ]),
    prototypeKey,
  },
  {
    ...text(
      `${prototypeKey}_confusing`,
      "Is there anything on this page that you found confusing?",
    ),
    prototypeKey,
  },
  {
    ...text(`${prototypeKey}_change`, "What would you change about this page?", false, true),
    prototypeKey,
  },
  ...(conceptKey === "timeline"
    ? [
        {
          ...choice(
            `${prototypeKey}_timeline_flow`,
            "Are the dates and milestone cards easy to follow in order?",
            ["Yes", "Mostly", "Somewhat", "Not really", "No"],
          ),
          prototypeKey,
        },
      ]
    : conceptKey === "editorial"
      ? [
          {
            ...choice(
              `${prototypeKey}_story_scan`,
              "Is it easy to scan the story sections and supporting archive content?",
              ["Yes", "Mostly", "Somewhat", "Not really", "No"],
            ),
            prototypeKey,
          },
        ]
      : [
          {
            ...choice(
              `${prototypeKey}_data_scan`,
              "Do the indicators, map/chart, and event records make the information easier to understand?",
              ["Yes", "Mostly", "Somewhat", "Not really", "No"],
            ),
            prototypeKey,
          },
        ]),
];

export const crossConceptQuestions: Question[] = [
  rating("layout_glance", "How easy is the website to understand at a glance?"),
  choice("layout_order", "Do you think the information is arranged in a logical order?", [
    "Yes",
    "Mostly",
    "Unsure",
    "Not really",
    "No",
  ]),
  choice("layout_balance", "Does the page feel too empty, too crowded, or balanced?", [
    "Much too empty",
    "Slightly too empty",
    "Balanced",
    "Slightly too crowded",
    "Much too crowded",
  ]),
  text("layout_move", "Is there anything that you think should be moved to a different position?"),
  rating(
    "navigation_clarity",
    "Is it clear how you would navigate to the different parts of the website?",
  ),
  choice(
    "navigation_destination",
    "Without clicking anything, can you tell what the navigation options would take you to?",
    ["Yes, all of them", "Most of them", "Some of them", "Very few of them", "None of them"],
  ),
  text("navigation_change", "Is there anything about the navigation that you would change?"),
  text("navigation_missing", "Is anything you would expect to find in the navigation missing?"),
  rating("button_clarity", "Are the main buttons or actions easy to identify?"),
  choice("button_result", "Is it clear what would happen if you clicked the main buttons?", [
    "Yes",
    "Mostly",
    "Somewhat",
    "Not really",
    "No",
  ]),
  text("button_confusing", "Were there any buttons or controls that you found confusing?"),
  rating("readability", "How easy is the text on these designs to read?"),
  choice("text_too_small", "Does any text appear too small?", ["No", "Yes", "Unsure"]),
  text("text_too_small_details", "Which text appears too small?", false, false),
  choice("contrast", "Is there enough contrast between the text and its background?", [
    "Yes",
    "Mostly",
    "Unsure",
    "Not really",
    "No",
  ]),
  text(
    "readability_difficult",
    "Is anything difficult to read or distinguish from the background?",
  ),
  rating(
    "desktop_space",
    "How well do the desktop layouts use the available screen space?",
    "desktop",
  ),
  text(
    "desktop_scale",
    "Does anything on the desktop layouts feel too large or too small?",
    false,
    false,
  ),
  text(
    "desktop_change",
    "Would you change anything specifically about the desktop layouts?",
    false,
    true,
  ),
  rating("mobile_ease", "How easy do the mobile layouts look to use?", "mobile"),
  choice(
    "mobile_cramped",
    "Does anything appear too cramped on mobile?",
    ["No", "A little", "Yes", "Unsure"],
    false,
  ),
  choice(
    "mobile_tap_targets",
    "Do the buttons and controls appear large enough to comfortably tap?",
    ["Yes", "Mostly", "Unsure", "Not really", "No"],
  ),
  rating("mobile_navigation", "Is the mobile navigation easy to understand?", "mobile"),
  text(
    "mobile_information",
    "Is any important information harder to find on mobile than on desktop?",
  ),
  text(
    "mobile_change",
    "What would you change specifically about the mobile designs?",
    false,
    true,
  ),
  choice(
    "desktop_mobile_same",
    "Do the desktop and mobile versions feel like the same website?",
    ["Yes, definitely", "Mostly", "Somewhat", "Not really", "No"],
    true,
  ),
  choice(
    "easier_version",
    "Which version do you think is easier to understand?",
    ["Desktop", "Mobile", "About the same", "Unsure"],
    false,
  ),
  text(
    "mobile_information_lost",
    "Do you think anything important has been lost when moving from desktop to mobile?",
  ),
  text(
    "accessibility_barrier",
    "Did you notice anything that might make the website difficult for someone to use?",
  ),
  rating(
    "clickable_distinction",
    "Are clickable elements visually easy to distinguish from normal content?",
  ),
  choice(
    "first_time_understanding",
    "Would someone using this website for the first time understand how to use it?",
    ["Yes", "Probably", "Unsure", "Probably not", "No"],
  ),
  {
    id: "concept_ranking",
    text: "Rank the three visual concepts from your favourite to least favourite.",
    type: "ranking",
    required: true,
    options: concepts.map((c) => c.name),
  },
  text("concept_ranking_reason", "Why did you rank the concepts in that order?", true),
  rating("overall_visual_design", "Overall, how would you rate the visual design of the website?"),
  rating("overall_usability", "Overall, how would you rate the usability of the website?"),
  rating("overall_navigation", "Overall, how would you rate the navigation?"),
  rating("overall_readability", "Overall, how would you rate the readability?"),
  rating("overall_mobile_design", "Overall, how would you rate the mobile design?"),
  text("liked_most", "What do you like most about the prototype designs?", true),
  text("liked_least", "What do you like least about the prototype designs?", true),
  text(
    "overall_confusing",
    "Was there anything that confused you while looking through the designs?",
  ),
  text("remove_from_site", "Is there anything you think should be removed from the website?"),
  text("add_to_site", "Is there anything you think should be added to the website?"),
  text(
    "most_important_improvement",
    "If you could make one change to improve these designs, what would you change and why?",
    true,
  ),
  text("final_comments", "Is there anything else you would like to say about the designs?"),
];

export const questions: Question[] = [
  ...globalQuestions,
  ...prototypes.flatMap((p) => screenQuestions(p.key, p.conceptKey, p.eraLabel)),
  ...crossConceptQuestions,
].map((q) =>
  q.id === "text_too_small_details"
    ? { ...q, showWhen: { questionId: "text_too_small", equals: "Yes" } }
    : q,
);
export const questionMap = new Map(questions.map((q) => [q.id, q]));
export const getPrototype = (key: string) => prototypes.find((p) => p.key === key);

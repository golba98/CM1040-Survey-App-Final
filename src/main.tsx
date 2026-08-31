import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createRoot } from "react-dom/client";
import {
  concepts,
  comparisonQuestions,
  consentStatement,
  eras,
  finalBuildQuestions,
  globalQuestions,
  layoutQuestionId,
  layoutTrackingId,
  primaryEra,
  prototypes,
  questionMap,
  questions,
  retiredQuestionIds,
  type Question,
} from "./shared/survey";
import "./styles.css";
import "./admin.css";

type Answer = { numericAnswer?: number; textAnswer?: string };
type Answers = Record<string, Answer>;
type Step = {
  key: string;
  title: string;
  kind: "welcome" | "participant" | "prototype" | "comparison" | "final";
  prototypeKey?: string;
};
const draftKey = "cm1040-survey:draft:v2";
/** Stated completion time on the welcome step. The current instrument has 53
 *  visible prompts when every optional chapter is opened, with 35 required.
 *  Most of the comparison prompts are a single click. Recount before changing. */
const MINUTES = "10–15";
const participantIds = [
  "participant_consent",
  "participant_name",
  "participant_device",
  "website_experience",
];
const comparisonIds = comparisonQuestions.map((question) => question.id);
const finalIds = finalBuildQuestions.map((question) => question.id);

function makeSteps(): Step[] {
  return [
    { key: "welcome", title: "Welcome", kind: "welcome" },
    { key: "participant", title: "About you", kind: "participant" },
    ...concepts.map((concept) => ({
      key: concept.key,
      title: concept.name,
      kind: "prototype" as const,
      prototypeKey: `${concept.key}-${primaryEra.key}`,
    })),
    { key: "comparison", title: "Compare the demos", kind: "comparison" },
    { key: "final", title: "Shape the final website", kind: "final" },
  ];
}

function RadioScale({
  q,
  answer,
  setAnswer,
}: {
  q: Question;
  answer?: Answer;
  setAnswer: (a: Answer) => void;
}) {
  const labels =
    q.scale === "clarity"
      ? ["Very unclear", "Unclear", "Average", "Clear", "Very clear"]
      : ["Very poor", "Poor", "Average", "Good", "Excellent"];
  return (
    <div className="rating-options" role="radiogroup" aria-label={q.text}>
      {[1, 2, 3, 4, 5].map((n) => (
        <label className="rating-option" key={n}>
          <input
            type="radio"
            name={q.id}
            value={n}
            checked={answer?.numericAnswer === n}
            onChange={() => setAnswer({ numericAnswer: n })}
          />
          <span className="rating-number">{n}</span>
          <span>{labels[n - 1]}</span>
        </label>
      ))}
    </div>
  );
}

function QuestionField({
  q,
  answer,
  setAnswer,
  error,
}: {
  q: Question;
  answer?: Answer;
  setAnswer: (a: Answer) => void;
  error?: string;
}) {
  const id = `field-${q.id}`;
  const inputId = `${id}-input`;
  const isConsent = q.type === "choice" && q.options?.length === 1;
  return (
    <fieldset
      id={id}
      className={`question ${isConsent ? "consent" : ""} ${error ? "has-error" : ""}`}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend>
        {q.text}
        {q.required ? (
          <span className="required" aria-label="required">
            {" "}
            *
          </span>
        ) : (
          <span className="optional">Optional</span>
        )}
      </legend>
      {q.type === "rating" && (
        <RadioScale q={q} answer={answer} setAnswer={setAnswer} />
      )}
      {isConsent && (
        <div className="choice-options">
          <label>
            <input
              type="checkbox"
              checked={answer?.textAnswer === q.options![0]}
              onChange={(e) =>
                setAnswer({ textAnswer: e.target.checked ? q.options![0] : "" })
              }
            />{" "}
            <span>{q.options![0]}</span>
          </label>
        </div>
      )}
      {q.type === "choice" && !isConsent && (
        <div className="choice-options">
          {q.options?.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name={q.id}
                value={option}
                checked={answer?.textAnswer === option}
                onChange={() => setAnswer({ textAnswer: option })}
              />{" "}
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
      {q.type === "ranking" && (
        <div className="ranking-options">
          {q.options?.map((option, index) => (
            <label key={option}>
              <span className="ranking-position">
                {index === 0 ? "1st — Favourite" : index === 1 ? "2nd" : "3rd"}
              </span>
              <select
                aria-label={
                  index === 0
                    ? "First choice — favourite"
                    : index === 1
                      ? "Second choice"
                      : "Third choice"
                }
                value={
                  answer?.textAnswer
                    ? (JSON.parse(answer.textAnswer)[index] ?? "")
                    : ""
                }
                onChange={(e) => {
                  const current = answer?.textAnswer
                    ? JSON.parse(answer.textAnswer)
                    : ["", "", ""];
                  current[index] = e.target.value;
                  setAnswer({ textAnswer: JSON.stringify(current) });
                }}
              >
                <option value="">Choose a demo</option>
                {q.options?.map((item) => (
                  <option
                    key={item}
                    value={item}
                    disabled={currentRanking(answer, item, index)}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
      {q.type === "text" && (
        <textarea
          id={inputId}
          rows={
            q.id.includes("comment") ||
            q.id.includes("change") ||
            q.id.includes("liked") ||
            q.id.includes("improvement") ||
            q.id.includes("confusing")
              ? 5
              : 3
          }
          value={answer?.textAnswer ?? ""}
          onChange={(e) => setAnswer({ textAnswer: e.target.value })}
        />
      )}
      {error && (
        <p className="error-message" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
function currentRanking(
  answer: Answer | undefined,
  item: string,
  index: number,
) {
  const values = answer?.textAnswer
    ? (JSON.parse(answer.textAnswer) as string[])
    : [];
  return values.includes(item) && values[index] !== item;
}

// Screen viewport of each layout. 1440x810 is exactly 16:9 and stays above the
// prototypes' 860px breakpoint, so their era tabs remain in the header; 390x844
// is the phone the reference captures were taken at.
const DESIGN = {
  desktop: { w: 1440, h: 810 },
  mobile: { w: 390, h: 844 },
} as const;
// Device chrome insets. Declared once here and handed to CSS as custom
// properties so the scale maths and the stylesheet cannot drift apart.
const CHROME = {
  desktop: { bezel: 16, top: 16, chin: 38 },
  mobile: { bezel: 12, top: 32, chin: 30 },
} as const;
/** Below this viewport width a 1440px desktop page scales past readability, so
 *  the preview starts on mobile instead. */
const NARROW = 700;
/** Floor on the *zoomed* preview scale: below this the prototype's text is not
 *  legible, so the zoomed stage pans sideways rather than shrinking further.
 *  Fitting the whole layout in is the default; see `PrototypeViewer`. */
const MIN_SCALE = 0.42;

function isMissing(q: Question, a?: Answer) {
  if (!q.required) return false;
  if (!a) return true;
  if (q.type === "text") return !a.textAnswer?.trim();
  if (q.type === "rating") return !a.numericAnswer;
  if (q.type === "choice") return !a.textAnswer;
  if (q.type === "ranking")
    return (
      !a.textAnswer || (JSON.parse(a.textAnswer) as string[]).some((v) => !v)
    );
  return false;
}

/**
 * The prototypes are independent, same-origin sites with their own breakpoints,
 * so each is rendered at its real design viewport and scaled to fit inside a
 * monitor or phone mock-up. The prototype scrolls within its screen, but its
 * scrollbar is hidden so the survey page keeps the only visible one.
 */
function DeviceFrame({
  src,
  title,
  layout,
  scale,
  panning,
}: {
  src: string;
  title: string;
  layout: "desktop" | "mobile";
  scale: number;
  panning: boolean;
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const design = DESIGN[layout];
  const chrome = CHROME[layout];
  const onLoad = () => {
    // Presentational only: nothing about the design under review changes, the
    // scrollbar is just hidden so the preview shows one bar instead of two.
    // Era links inside the frame load a new document, so this re-runs.
    const doc = frameRef.current?.contentDocument;
    if (!doc?.head || doc.getElementById("cm1040-preview-style")) return;
    const style = doc.createElement("style");
    style.id = "cm1040-preview-style";
    style.textContent =
      "html{scrollbar-width:none;-ms-overflow-style:none}" +
      "html::-webkit-scrollbar,body::-webkit-scrollbar{width:0;height:0;display:none}";
    doc.head.appendChild(style);
  };
  return (
    <div className={`device ${layout} ${panning ? "panning" : ""}`}>
      <div
        className="device-bezel"
        style={
          {
            "--bezel": `${chrome.bezel}px`,
            "--bezel-top": `${chrome.top}px`,
            "--chin": `${chrome.chin}px`,
          } as CSSProperties
        }
      >
        {layout === "mobile" ? (
          <span className="phone-island" aria-hidden="true" />
        ) : null}
        <div
          className="device-screen"
          style={{ width: design.w * scale, height: design.h * scale }}
        >
          <iframe
            className="prototype-live"
            ref={frameRef}
            title={title}
            src={src}
            onLoad={onLoad}
            style={{
              width: design.w,
              height: design.h,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          />
        </div>
        <span
          className={layout === "mobile" ? "phone-indicator" : "monitor-dot"}
          aria-hidden="true"
        />
        {layout === "mobile" ? (
          <>
            <span className="phone-button volume-up" aria-hidden="true" />
            <span className="phone-button volume-down" aria-hidden="true" />
            <span className="phone-button power" aria-hidden="true" />
          </>
        ) : null}
      </div>
      {layout === "desktop" ? (
        <>
          <span className="monitor-neck" aria-hidden="true" />
          <span className="monitor-base" aria-hidden="true" />
        </>
      ) : null}
    </div>
  );
}

function PrototypeViewer({
  prototypeKey,
  onLayoutView,
  seenLayouts,
  embedded = false,
}: {
  prototypeKey: string;
  onLayoutView: (layout: "desktop" | "mobile") => void;
  seenLayouts: string[];
  embedded?: boolean;
}) {
  const active = prototypes.find((item) => item.key === prototypeKey)!;
  const { conceptKey, eraKey } = active;
  const [layout, setLayout] = useState<"desktop" | "mobile">(() =>
    typeof window !== "undefined" && window.innerWidth < NARROW
      ? "mobile"
      : "desktop",
  );
  /** Only ever true for the desktop layout on a phone: see `scale` below. */
  const [zoomed, setZoomed] = useState(false);
  const showLayout = (next: "desktop" | "mobile") => {
    setLayout(next);
    setZoomed(false);
    onLayoutView(next);
  };
  useEffect(() => onLayoutView(layout), [onLayoutView, layout]);
  const [stageWidth, setStageWidth] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const page =
    eraKey === "bandwidth"
      ? "index.html"
      : eraKey === "local"
        ? "mobile-local.html"
        : "digital-divide.html";
  const prototypeUrl = `/live-prototypes/${conceptKey}/${page}`;
  const design = DESIGN[layout];
  // The bezel sits outside the screen, so it comes off the width the prototype
  // gets to use. `+1` on each side is the bezel's own hairline border.
  const screenWidth = stageWidth - 2 * (CHROME[layout].bezel + 1);
  /* Fitting the whole layout into the stage is the default everywhere. On any
     viewport wide enough for `fitScale` to clear `MIN_SCALE` — every desktop and
     tablet width — the two branches below are the same number, so this only
     changes what a phone does with the 1440px desktop layout: it sees all of it
     at once, and opts in to the pannable half-size view with Zoom. */
  const fitScale = screenWidth > 0 ? Math.min(1, screenWidth / design.w) : 0;
  const scale = zoomed ? Math.max(MIN_SCALE, fitScale) : fitScale;
  const canZoom = fitScale > 0 && fitScale < MIN_SCALE;
  const panning = design.w * scale > screenWidth;
  const otherLayout = layout === "desktop" ? "mobile" : "desktop";
  const hint = panning
    ? "Half size · swipe the screen sideways to see the rest"
    : canZoom
      ? "The whole desktop layout at reduced size · tap Zoom to inspect the detail"
      : "";
  useLayoutEffect(() => {
    const node = stageRef.current;
    if (!node) return;
    setStageWidth(node.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) =>
      setStageWidth(entries[0].contentRect.width),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [layout]);
  return (
    <section
      className={`prototype-viewer ${embedded ? "embedded" : ""}`}
      aria-label={`${active.conceptName}, ${active.eraLabel} prototype`}
    >
      <div className="viewer-header">
        <div>
          <p className="eyebrow">Prototype screen</p>
          <h2>{active.eraLabel}</h2>
          <p>{active.title}</p>
        </div>
        <div className="viewer-controls">
          <div
            className="layout-toggle"
            role="group"
            aria-label="Choose prototype layout"
          >
            <button
              className={layout === "desktop" ? "active" : ""}
              onClick={() => showLayout("desktop")}
            >
              Desktop
            </button>
            <button
              className={layout === "mobile" ? "active" : ""}
              onClick={() => showLayout("mobile")}
            >
              Mobile
            </button>
          </div>
          {canZoom && (
            <button
              className="zoom-toggle"
              type="button"
              aria-pressed={zoomed}
              onClick={() => setZoomed((on) => !on)}
            >
              {zoomed ? "Fit" : "Zoom"}
            </button>
          )}
        </div>
      </div>
      {(hint || !seenLayouts.includes(otherLayout)) && (
        <p className="viewer-hint">
          {hint}
          {seenLayouts.includes(otherLayout) ? null : (
            <em>
              {hint ? " · " : ""}please also check the {otherLayout} layout
              before continuing
            </em>
          )}
        </p>
      )}
      <figure className={`prototype-frame ${layout}`}>
        <div className="prototype-stage" ref={stageRef}>
          {scale > 0 && (
            <DeviceFrame
              key={layout}
              src={prototypeUrl}
              title={`${active.conceptName} ${active.eraLabel} ${layout} prototype`}
              layout={layout}
              scale={scale}
              panning={panning}
            />
          )}
        </div>
        <figcaption>
          {layout === "desktop" ? "Desktop layout" : "Mobile layout"} · scroll
          inside the screen to explore the page
          {panning ? ", and swipe it sideways" : null}
        </figcaption>
      </figure>
    </section>
  );
}

function DemoReview({
  onLayoutView,
  layoutsOpened,
}: {
  onLayoutView: (
    conceptKey: string,
    layout: "desktop" | "mobile",
  ) => void;
  layoutsOpened: Record<string, string[]>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeConceptKey, setActiveConceptKey] = useState<string | null>(null);

  const openDemo = (conceptKey: string) => {
    setActiveConceptKey(conceptKey);
    requestAnimationFrame(() => {
      const dialog = dialogRef.current;
      if (dialog && !dialog.open) dialog.showModal();
    });
  };

  const closeDemo = () => dialogRef.current?.close();

  useEffect(() => {
    if (!activeConceptKey) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeConceptKey]);

  const activeConcept = concepts.find(
    (concept) => concept.key === activeConceptKey,
  );

  return (
    <section className="demo-review" aria-labelledby="demo-review-heading">
      <div className="demo-review-heading">
        <div>
          <p className="eyebrow">Need another look?</p>
          <h2 id="demo-review-heading">Review any demo without going back</h2>
        </div>
        <p>
          Your answers stay in place while you compare the live desktop and
          mobile designs.
        </p>
      </div>
      <div className="demo-review-grid">
        {concepts.map((concept) => {
          const preview = prototypes.find(
            (prototype) =>
              prototype.conceptKey === concept.key &&
              prototype.eraKey === primaryEra.key,
          )!;
          return (
            <article className="demo-review-card" key={concept.key}>
              <div className="demo-review-image">
                <img
                  src={preview.desktop}
                  alt={`Desktop preview of ${concept.name}`}
                />
              </div>
              <div className="demo-review-copy">
                <h3>{concept.name}</h3>
                <p>{concept.tone}</p>
                <button
                  className="secondary review-button"
                  type="button"
                  onClick={() => openDemo(concept.key)}
                >
                  Review {concept.name}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <dialog
        ref={dialogRef}
        className="demo-dialog"
        aria-labelledby="demo-dialog-title"
        onClose={() => setActiveConceptKey(null)}
      >
        {activeConcept && (
          <div className="demo-dialog-content">
            <header className="demo-dialog-header">
              <div>
                <p className="eyebrow">Compare the demos</p>
                <h2 id="demo-dialog-title">{activeConcept.name}</h2>
              </div>
              <button
                className="secondary dialog-close"
                type="button"
                onClick={closeDemo}
                aria-label="Close demo viewer"
              >
                Close
              </button>
            </header>
            <div
              className="concept-tabs"
              role="tablist"
              aria-label="Choose a demo to review"
            >
              {concepts.map((concept) => (
                <button
                  key={concept.key}
                  type="button"
                  role="tab"
                  aria-selected={concept.key === activeConceptKey}
                  className={concept.key === activeConceptKey ? "active" : ""}
                  onClick={() => setActiveConceptKey(concept.key)}
                >
                  {concept.name}
                </button>
              ))}
            </div>
            <PrototypeViewer
              key={activeConcept.key}
              prototypeKey={`${activeConcept.key}-${primaryEra.key}`}
              onLayoutView={(layout) =>
                onLayoutView(activeConcept.key, layout)
              }
              seenLayouts={layoutsOpened[activeConcept.key] ?? []}
              embedded
            />
          </div>
        )}
      </dialog>
    </section>
  );
}

function App() {
  const steps = useMemo(makeSteps, []);
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [responseUuid, setResponseUuid] = useState(crypto.randomUUID());
  const [startedAt] = useState(new Date().toISOString());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");
  const [pendingFocus, setPendingFocus] = useState("");
  // Which layouts the participant actually opened, per era step. Recorded
  // alongside their own answer so the two can be compared.
  const [layoutsOpened, setLayoutsOpened] = useState<Record<string, string[]>>(
    {},
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        const saved_answers = (draft.answers ?? {}) as Answers;
        const restoredAnswers = Object.fromEntries(
          Object.entries(saved_answers).filter(
            ([id]) => !retiredQuestionIds.has(id) && questionMap.has(id),
          ),
        ) as Answers;
        setAnswers(restoredAnswers);
        setLayoutsOpened(
          Object.fromEntries(
            concepts.map((concept) => [
              concept.key,
              (restoredAnswers[
                layoutTrackingId(concept.key)
              ]?.textAnswer?.split(", ") ?? []).filter(Boolean),
            ]),
          ),
        );
        setStepIndex(Math.min(draft.stepIndex ?? 0, steps.length - 1));
        setResponseUuid(draft.responseUuid ?? crypto.randomUUID());
      } catch {
        localStorage.removeItem(draftKey);
      }
    }
  }, [steps.length]);
  useEffect(() => {
    if (!submitted)
      localStorage.setItem(
        draftKey,
        JSON.stringify({ answers, stepIndex, responseUuid, startedAt }),
      );
  }, [answers, stepIndex, responseUuid, startedAt, submitted]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (!submitted && Object.keys(answers).length) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [answers, submitted]);
  const step = steps[stepIndex];
  useEffect(() => {
    headingRef.current?.focus();
  }, [stepIndex]);
  const recordLayout = useCallback(
    (conceptKey: string, layout: "desktop" | "mobile") =>
      setLayoutsOpened((previous) => {
        const seen = previous[conceptKey] ?? [];
        if (seen.includes(layout)) return previous;
        const next = [...seen, layout];
        setAnswers((current) => ({
          ...current,
          [layoutTrackingId(conceptKey)]: { textAnswer: next.join(", ") },
        }));
        return { ...previous, [conceptKey]: next };
      }),
    [],
  );
  const onLayoutView = useCallback(
    (layout: "desktop" | "mobile") => recordLayout(step.key, layout),
    [recordLayout, step.key],
  );
  useEffect(() => {
    if (!pendingFocus) return;
    document
      .getElementById(`field-${pendingFocus}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    setPendingFocus("");
  }, [pendingFocus]);
  const setAnswer = (id: string, answer: Answer) => {
    setAnswers((previous) => ({ ...previous, [id]: answer }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
  };
  const isVisible = (q: Question) =>
    !q.hidden &&
    (!q.showWhen ||
      answers[q.showWhen.questionId]?.textAnswer === q.showWhen.equals);
  /** Every question belonging to one website, across all three of its chapters. */
  const websiteQuestions = (conceptKey: string): Question[] =>
    questions.filter(
      (q) => q.prototypeKey?.startsWith(`${conceptKey}-`) && isVisible(q),
    );
  const visibleQuestions = (): Question[] => {
    const list =
      step.kind === "participant"
        ? participantIds.map((id) => questionMap.get(id)!)
        : step.kind === "prototype"
          ? websiteQuestions(step.key)
          : step.kind === "comparison"
            ? comparisonIds.map((id) => questionMap.get(id)!)
            : step.kind === "final"
              ? finalIds.map((id) => questionMap.get(id)!)
              : [];
    return list.filter(isVisible);
  };
  const validateStep = () => {
    const next: Record<string, string> = {};
    let focusId = "";
    for (const q of visibleQuestions()) {
      if (!isVisible(q) || !isMissing(q, answers[q.id])) continue;
      next[q.id] = "Please answer this question before continuing.";
      if (!focusId) focusId = q.id;
    }
    setErrors(next);
    if (!focusId) return true;
    setPendingFocus(focusId);
    return false;
  };
  const next = () => {
    if (validateStep()) { setStepIndex((i) => Math.min(steps.length - 1, i + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };
  const back = () => {
    setErrors({});
    setStepIndex((i) => Math.max(0, i - 1));
  };
  const submit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    setApiError("");
    const answerPayload = Object.entries(answers).map(([questionId, a]) => {
      const q = questionMap.get(questionId)!;
      const proto = q.prototypeKey;
      return {
        questionId,
        prototypeKey: proto,
        layoutType: q.layoutType ?? "general",
        answerType: q.type,
        numericAnswer: a.numericAnswer,
        textAnswer: a.textAnswer,
      };
    });
    try {
      const response = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemaVersion: 1,
          responseUuid,
          startedAt,
          participant: {
            name: answers.participant_name?.textAnswer,
            deviceType: answers.participant_device?.textAnswer,
            websiteExperience: Number(
              (answers.website_experience?.textAnswer ?? "").charAt(0),
            ),
          },
          answers: answerPayload,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.fields ?? {});
        throw new Error(data.error ?? "Submission failed");
      }
      setSubmitted(data.responseUuid);
      localStorage.removeItem(draftKey);
    } catch (e) {
      if (!Object.keys(errors).length)
        setApiError(
          e instanceof Error
            ? e.message
            : "We couldn't submit your feedback. Your answers have been kept. Please try again.",
        );
    } finally {
      setSubmitting(false);
    }
  };
  const stepQuestions = visibleQuestions();
  const isOtherChapter = (q: Question) =>
    !!q.prototypeKey && !q.prototypeKey.endsWith(`-${primaryEra.key}`);
  const primaryQuestions = stepQuestions
    .filter((q) => !isOtherChapter(q))
    .sort((a, b) => Number(!!b.required) - Number(!!a.required));
  const otherChapterQuestions = stepQuestions.filter(isOtherChapter);
  const websiteNumber = concepts.findIndex((c) => c.key === step.key) + 1;
  const otherEraLabels = eras
    .filter((era) => era.key !== primaryEra.key)
    .map((era) => era.label)
    .join(" or ");
  if (submitted)
    return (
      <main className="shell confirmation">
        <div className="confirmation-mark">✓</div>
        <p className="eyebrow">Response recorded</p>
        <h1>Thank you for your feedback.</h1>
        <p>
          Your feedback has been recorded successfully. Your anonymous response
          ID is <code>{submitted}</code>.
        </p>
      </main>
    );
  return (
    <>
      <header className="topbar">
        <span className="brand">
          <img src="/connected-sa-mark.svg?v=2" alt="" aria-hidden="true" />
          CM1040 <em>Prototype feedback</em>
        </span>
        <span className="counter">
          Step {stepIndex + 1} of {steps.length}
        </span>
      </header>
      <main className="shell">
        <div
          className="progress"
          role="progressbar"
          aria-label="Survey progress"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={stepIndex + 1}
          aria-valuetext={`Step ${stepIndex + 1} of ${steps.length}`}
        >
          <span
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
        {step.kind === "welcome" ? (
          <section className="welcome">
            <p className="eyebrow">Connected South Africa · design review</p>
            <h1 ref={headingRef} tabIndex={-1}>
              Help shape the final website.
            </h1>
            <p className="lead">
              I am testing prototype designs for a website being developed as
              part of my Web Development coursework. Please look through the
              designs and share what you notice about their appearance,
              usability, navigation, readability, and mobile layout.
            </p>
            <p>
              There are no right or wrong answers. Your feedback will be used to
              improve the designs before the final website is developed. This
              takes around {MINUTES} minutes.
            </p>
            <p className="consent-note">{consentStatement}</p>
            <button className="primary" onClick={next}>
              Begin survey <span>→</span>
            </button>
          </section>
        ) : (
          <>
            <div className="step-heading">
              <p className="eyebrow">
                {step.kind === "prototype"
                  ? `Website ${websiteNumber} of ${concepts.length}`
                  : step.title}
              </p>
              <h1 ref={headingRef} tabIndex={-1}>
                {step.kind === "comparison"
                  ? "Which direction works best?"
                  : step.kind === "final"
                    ? "What should the final version become?"
                    : step.title}
              </h1>
              {step.kind === "prototype" && (
                <p className="lead">
                  {concepts.find((c) => c.key === step.key)?.tone}. The
                  questions below are about its {primaryEra.label} page — the
                  same chapter on all three websites, so they can be compared
                  fairly.
                </p>
              )}
              {step.kind === "comparison" && (
                <p className="lead">
                  Choose the direction that should lead the final website, then
                  compare where each demo works best. You can reopen any demo
                  below without losing your place.
                </p>
              )}
              {step.kind === "final" && (
                <p className="lead">
                  Use your preferred demo as the starting point, then tell us
                  what the final website should keep, borrow, and improve.
                </p>
              )}
            </div>
            {step.kind === "prototype" && (
              <PrototypeViewer
                key={step.prototypeKey}
                prototypeKey={step.prototypeKey!}
                onLayoutView={onLayoutView}
                seenLayouts={layoutsOpened[step.key] ?? []}
              />
            )}
            {step.kind === "comparison" && (
              <DemoReview
                layoutsOpened={layoutsOpened}
                onLayoutView={recordLayout}
              />
            )}
            <div className="questions">
              {primaryQuestions.map((q) => (
                <QuestionField
                  key={q.id}
                  q={q}
                  answer={answers[q.id]}
                  error={errors[q.id]}
                  setAnswer={(a) => setAnswer(q.id, a)}
                />
              ))}
            </div>
            {otherChapterQuestions.length > 0 && (
              <details className="optional-block">
                <summary>
                  Other chapters — optional
                  <span>
                    If you browsed to {otherEraLabels} inside the website, you
                    can add a note about them here.
                  </span>
                </summary>
                <div className="questions">
                  {otherChapterQuestions.map((q) => (
                    <QuestionField
                      key={q.id}
                      q={q}
                      answer={answers[q.id]}
                      error={errors[q.id]}
                      setAnswer={(a) => setAnswer(q.id, a)}
                    />
                  ))}
                </div>
              </details>
            )}
            {apiError && (
              <p className="api-error" role="alert">
                {apiError}
              </p>
            )}
            <div className="actions">
              <button
                className="secondary"
                onClick={back}
                disabled={stepIndex === 0}
              >
                Back
              </button>
              {step.kind === "final" ? (
                <button
                  className="primary"
                  onClick={submit}
                  disabled={submitting}
                >
                  {submitting ? "Submitting…" : "Submit feedback"}
                </button>
              ) : (
                <button className="primary" onClick={next}>
                  Continue <span>→</span>
                </button>
              )}
            </div>
          </>
        )}
      </main>
      <footer className="footer">
        CM1040 Web Development · Prototype feedback is anonymous apart from the
        optional nickname.
      </footer>
    </>
  );
}

function Admin() {
  const [summary, setSummary] = useState<any>({
    total: 0,
    ratings: [],
    firstChoices: [],
    preferences: [],
  });
  const [responses, setResponses] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/summary").then((r) => r.json()),
      fetch("/api/admin/responses").then((r) => r.json()),
    ])
      .then(([s, r]) => {
        setSummary(s);
        setResponses(r);
      })
      .catch(() => setError("Results could not be loaded."));
  }, []);
  const preferenceCards = [
    ["preferred_at_glance", "Easiest at a glance"],
    ["preferred_first_time_use", "Easiest first visit"],
    ["preferred_visual_design", "Strongest visual design"],
    ["preferred_navigation", "Clearest navigation"],
    ["preferred_readability", "Easiest to read"],
    ["preferred_responsive_design", "Best desktop and mobile"],
  ] as const;
  const leadingPreference = (questionId: string) =>
    (summary.preferences ?? []).find(
      (item: any) => item.question_id === questionId,
    );
  const firstChoice = summary.firstChoices?.[0];
  return (
    <>
      <header className="topbar">
        <span className="brand">
          <img src="/connected-sa-mark.svg?v=2" alt="" aria-hidden="true" />
          CM1040 <em>Survey results</em>
        </span>
        <a className="admin-link" href="/">
          Open participant survey
        </a>
      </header>
      <main className="admin-shell">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">Private review area</p>
            <h1>Feedback dashboard</h1>
            <p>
              Use the comments and ratings below to connect an observed issue to
              a design improvement.
            </p>
          </div>
          <div className="export-actions">
            <a href="/api/admin/export?format=csv">Export CSV</a>
            <a href="/api/admin/export?format=json">Export JSON</a>
          </div>
        </div>
        {error && <p className="api-error">{error}</p>}
        <section className="stat-grid">
          <div className="stat-card">
            <span>Completed responses</span>
            <strong>{summary.total}</strong>
          </div>
          <div className="stat-card">
            <span>Overall favourite</span>
            <strong>{firstChoice?.option ?? "—"}</strong>
            {firstChoice && <small>{firstChoice.count} first-choice votes</small>}
          </div>
          {preferenceCards.map(([id, label]) => {
            const leader = leadingPreference(id);
            return (
              <div className="stat-card" key={id}>
                <span>{label}</span>
                <strong>{leader?.option ?? "—"}</strong>
                {leader && <small>{leader.count} responses</small>}
              </div>
            );
          })}
        </section>
        <section className="admin-panel">
          <h2>Responses</h2>
          {responses.length === 0 ? (
            <p className="empty-state">
              No completed responses yet. The dashboard will populate after
              participants submit feedback.
            </p>
          ) : (
            <div className="response-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Response ID</th>
                    <th>Nickname</th>
                    <th>Device</th>
                    <th>Experience</th>
                    <th>Submitted</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r) => (
                    <tr key={r.response_uuid}>
                      <td>
                        <code>{String(r.response_uuid).slice(0, 8)}…</code>
                      </td>
                      <td>{r.participant_name || "Anonymous"}</td>
                      <td>{r.device_type}</td>
                      <td>{r.website_experience}/5</td>
                      <td>{new Date(r.submitted_at).toLocaleString()}</td>
                      <td>
                        <button
                          className="row-button"
                          onClick={() =>
                            fetch(`/api/admin/responses/${r.response_uuid}`)
                              .then((x) => x.json())
                              .then(setSelected)
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        {selected && (
          <div className="detail-panel">
            <button className="detail-close" onClick={() => setSelected(null)}>
              Close
            </button>
            <h2>Response {selected.response?.response_uuid}</h2>
            <p>
              {selected.response?.participant_name || "Anonymous"} ·{" "}
              {selected.response?.device_type}
            </p>
            <div className="answer-list">
              {selected.answers?.map((a: any) => (
                <article key={a.id}>
                  <span>{a.question_id}</span>
                  <strong>{a.numeric_answer ?? a.text_answer}</strong>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  location.pathname.startsWith("/admin") ? <Admin /> : <App />,
);

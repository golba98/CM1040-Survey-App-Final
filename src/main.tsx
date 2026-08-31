import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  concepts,
  crossConceptQuestions,
  eras,
  globalQuestions,
  prototypes,
  questionMap,
  questions,
  retiredQuestionIds,
  type Question,
} from "./shared/survey";
import "./styles.css";
import "./admin.css";
import "./theme.css";

type Answer = { numericAnswer?: number; textAnswer?: string };
type Answers = Record<string, Answer>;
type Step = {
  key: string;
  title: string;
  kind: "welcome" | "participant" | "prototype" | "cross" | "final";
  prototypeKey?: string;
};
const draftKey = "cm1040-survey:draft:v1";
const participantIds = [
  "participant_name",
  "participant_device",
  "website_experience",
];
const finalIds = [
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
const crossIds = crossConceptQuestions
  .map((q) => q.id)
  .filter((id) => !finalIds.includes(id));

function makeSteps(): Step[] {
  return [
    { key: "welcome", title: "Welcome", kind: "welcome" },
    { key: "participant", title: "About you", kind: "participant" },
    ...eras.map((era) => ({
      key: era.key,
      title: era.label,
      kind: "prototype" as const,
      prototypeKey: `timeline-${era.key}`,
    })),
    { key: "cross", title: "Overall experience", kind: "cross" },
    { key: "final", title: "Final thoughts", kind: "final" },
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
    q.id.includes("clarity") ||
    q.id.includes("appeal") ||
    q.id.includes("ease") ||
    q.id.includes("readability") ||
    q.id.includes("space") ||
    q.id.includes("navigation") ||
    q.id.includes("mobile") ||
    q.id.includes("button") ||
    q.id.includes("overall") ||
    q.id.includes("clickable") ||
    q.id === "layout_glance"
      ? ["Very poor", "Poor", "Average", "Good", "Excellent"]
      : ["Very unclear", "Unclear", "Average", "Clear", "Very clear"];
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
  return (
    <fieldset
      id={id}
      className={`question ${error ? "has-error" : ""}`}
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
      {q.type === "choice" && (
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
              {index + 1}.{" "}
              <select
                aria-label={`Rank ${index + 1}`}
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
                <option value="">Choose a concept</option>
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
          id={id}
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

function PrototypeViewer({ prototypeKey, onSelectionChange }: { prototypeKey: string; onSelectionChange: (conceptKey: string, eraKey: string) => void }) {
  const p = prototypes.find((item) => item.key === prototypeKey)!;
  const [conceptKey, setConceptKey] = useState(p.conceptKey);
  const [eraKey, setEraKey] = useState(p.eraKey);
  const [layout, setLayout] = useState<"desktop" | "mobile">("desktop");
  const active = prototypes.find((item) => item.conceptKey === conceptKey && item.eraKey === eraKey)!;
  const page = eraKey === "bandwidth" ? "index.html" : eraKey === "local" ? "mobile-local.html" : "digital-divide.html";
  const prototypeUrl = `/live-prototypes/${conceptKey}/${page}`;
  return (
    <section
      className="prototype-viewer"
      aria-label={`${active.conceptName}, ${active.eraLabel} prototype`}
    >
      <div className="viewer-header">
        <div>
          <p className="eyebrow">Prototype screen</p>
          <h2>{active.conceptName}</h2>
          <p>
            {active.eraLabel} · {active.title}
          </p>
        </div>
        <div
          className="layout-toggle"
          role="group"
          aria-label="Choose prototype layout"
        >
          <button
            className={layout === "desktop" ? "active" : ""}
            onClick={() => setLayout("desktop")}
          >
            Desktop
          </button>
          <button
            className={layout === "mobile" ? "active" : ""}
            onClick={() => setLayout("mobile")}
          >
            Mobile
          </button>
        </div>
      </div>
      <div className="concept-tabs" role="tablist" aria-label="Prototype concepts">
        {concepts.map((concept) => <button key={concept.key} role="tab" aria-selected={conceptKey === concept.key} className={conceptKey === concept.key ? "active" : ""} onClick={() => { setConceptKey(concept.key); onSelectionChange(concept.key, eraKey); }}>{concept.name}</button>)}
      </div>
      <div className="era-tabs" role="tablist" aria-label={`${active.conceptName} chapters`}>
        {eras.map((era) => <button key={era.key} role="tab" aria-selected={eraKey === era.key} className={eraKey === era.key ? "active" : ""} onClick={() => { setEraKey(era.key); onSelectionChange(conceptKey, era.key); }}>{era.label}</button>)}
      </div>
      <figure className={`prototype-frame ${layout}`}>
        <iframe key={`${prototypeUrl}-${layout}`} className="prototype-live" title={`${active.conceptName} ${active.eraLabel} ${layout} prototype`} src={prototypeUrl} />
      </figure>
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
  const [activeConcept, setActiveConcept] = useState("timeline");
  const [activeEra, setActiveEra] = useState("bandwidth");
  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        const savedAnswers = (draft.answers ?? {}) as Answers;
        const restoredAnswers = Object.fromEntries(
          Object.entries(savedAnswers).filter(([id]) => !retiredQuestionIds.has(id)),
        ) as Answers;
        setAnswers(restoredAnswers);
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
    setActiveConcept("timeline");
    setActiveEra(step.prototypeKey?.replace("timeline-", "") ?? "bandwidth");
  }, [step.prototypeKey]);
  const setAnswer = (id: string, answer: Answer) => {
    setAnswers((previous) => ({ ...previous, [id]: answer }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[id];
      return next;
    });
  };
  const visibleQuestions = (): Question[] => {
    const list =
      step.kind === "participant"
        ? participantIds.map((id) => questionMap.get(id)!)
        : step.kind === "prototype"
          ? questions.filter((q) => q.prototypeKey === `${activeConcept}-${activeEra}`)
          : step.kind === "cross"
            ? crossIds.map((id) => questionMap.get(id)!)
            : step.kind === "final"
              ? finalIds.map((id) => questionMap.get(id)!)
              : [];
    return list.filter(
      (q) =>
        !q.showWhen ||
        answers[q.showWhen.questionId]?.textAnswer === q.showWhen.equals,
    );
  };
  const validateStep = () => {
    const next: Record<string, string> = {};
    for (const q of visibleQuestions()) {
      if (
        q.showWhen &&
        answers[q.showWhen.questionId]?.textAnswer !== q.showWhen.equals
      )
        continue;
      const a = answers[q.id];
      const missing =
        q.required &&
        (!a ||
          (q.type === "text" && !a.textAnswer?.trim()) ||
          (q.type === "rating" && !a.numericAnswer) ||
          (q.type === "choice" && !a.textAnswer) ||
          (q.type === "ranking" &&
            (!a.textAnswer ||
              (JSON.parse(a.textAnswer) as string[]).some((v) => !v))));
      if (missing)
        next[q.id] = "Please answer this question before continuing.";
    }
    setErrors(next);
    if (Object.keys(next).length) {
      document
        .getElementById(`field-${Object.keys(next)[0]}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
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
          <img src="/connected-sa-mark.svg" alt="" aria-hidden="true" />
          CM1040 <em>Prototype feedback</em>
        </span>
        <span className="counter">
          Step {stepIndex + 1} of {steps.length}
        </span>
      </header>
      <main className="shell">
        <div className="progress">
          <span
            style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
        {step.kind === "welcome" ? (
          <section className="welcome">
            <p className="eyebrow">Connected South Africa · design review</p>
            <h1>Help shape the final website.</h1>
            <p className="lead">
              I am testing prototype designs for a website being developed as
              part of my Web Development coursework. Please look through the
              designs and share what you notice about their appearance,
              usability, navigation, readability, and mobile layout.
            </p>
            <p>
              There are no right or wrong answers. Your feedback will be used to
              improve the designs before the final website is developed. This
              takes around 12–15 minutes.
            </p>
            <button className="primary" onClick={next}>
              Begin survey <span>→</span>
            </button>
          </section>
        ) : (
          <>
            <div className="step-heading">
              <p className="eyebrow">
                {step.kind === "prototype" ? "Screen review" : step.title}
              </p>
              <h1>{step.title}</h1>
              {step.kind === "cross" && (
                <p className="lead">
                  Now compare the designs as a whole and think about how a
                  first-time visitor would use them.
                </p>
              )}
              {step.kind === "final" && (
                <p className="lead">
                  Your most specific suggestion will help turn feedback into a
                  documented design improvement.
                </p>
              )}
            </div>
            {step.kind === "prototype" && (
              <PrototypeViewer
                key={step.prototypeKey}
                prototypeKey={step.prototypeKey!}
                onSelectionChange={(conceptKey, eraKey) => {
                  setActiveConcept(conceptKey);
                  setActiveEra(eraKey);
                }}
              />
            )}
            <div className="questions">
              {visibleQuestions().map((q) => (
                <QuestionField
                  key={q.id}
                  q={q}
                  answer={answers[q.id]}
                  error={errors[q.id]}
                  setAnswer={(a) => setAnswer(q.id, a)}
                />
              ))}
            </div>
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
  const [summary, setSummary] = useState<any>({ total: 0, ratings: [] });
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
  const ratingMap = new Map<string, any>(
    (summary.ratings ?? []).map(
      (r: any) => [r.question_id, r] as [string, any],
    ),
  );
  return (
    <>
      <header className="topbar">
        <span className="brand">
          <img src="/connected-sa-mark.svg" alt="" aria-hidden="true" />
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
          {[
            "overall_visual_design",
            "overall_usability",
            "overall_navigation",
            "overall_readability",
            "overall_mobile_design",
          ].map((id) => (
            <div className="stat-card" key={id}>
              <span>{id.replace("overall_", "").replaceAll("_", " ")}</span>
              <strong>
                {ratingMap.get(id)?.average ?? "—"}
                <small>/ 5</small>
              </strong>
            </div>
          ))}
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

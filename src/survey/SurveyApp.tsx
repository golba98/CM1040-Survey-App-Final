import { useEffect, useMemo, useState } from "react";
import { submitSurvey } from "../api/survey";
import { AppHeader } from "../components/AppHeader";
import { questionMap, questions, type Question } from "../shared/survey";
import { isAnswerMissing, visibleQuestions } from "../shared/survey-logic";
import type { Answer, Answers, SurveySubmissionResult } from "../shared/types";
import { PrototypeViewer } from "./PrototypeViewer";
import { QuestionField } from "./QuestionField";
import {
  crossQuestionIds,
  finalQuestionIds,
  firstQuestionIds,
  participantQuestionIds,
  surveySteps,
} from "./steps";

const draftKey = "cm1040-survey:draft:v1";

function questionsForStep(stepIndex: number): Question[] {
  const step = surveySteps[stepIndex];
  if (step.kind === "participant") return participantQuestionIds.map((id) => questionMap.get(id)!);
  if (step.kind === "prototype")
    return [
      ...(stepIndex === 2 ? firstQuestionIds.map((id) => questionMap.get(id)!) : []),
      ...questions.filter((question) => question.prototypeKey === step.prototypeKey),
    ];
  if (step.kind === "cross") return crossQuestionIds.map((id) => questionMap.get(id)!);
  if (step.kind === "final") return finalQuestionIds.map((id) => questionMap.get(id)!);
  return [];
}

function responseError(error: unknown) {
  if (typeof error === "object" && error && "error" in error) {
    return error as SurveySubmissionResult;
  }
  return {
    error: "We couldn't submit your feedback. Your answers have been kept. Please try again.",
  };
}

export function SurveyApp() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [responseUuid, setResponseUuid] = useState<string>(crypto.randomUUID());
  const [startedAt] = useState(new Date().toISOString());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");
  const step = surveySteps[stepIndex];
  const stepQuestions = useMemo(
    () => visibleQuestions(questionsForStep(stepIndex), answers),
    [answers, stepIndex],
  );

  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (!saved) return;
    try {
      const draft = JSON.parse(saved) as Partial<{
        answers: Answers;
        stepIndex: number;
        responseUuid: string;
      }>;
      setAnswers(draft.answers ?? {});
      setStepIndex(Math.min(draft.stepIndex ?? 0, surveySteps.length - 1));
      setResponseUuid(draft.responseUuid ?? crypto.randomUUID());
    } catch {
      localStorage.removeItem(draftKey);
    }
  }, []);

  useEffect(() => {
    if (!submitted)
      localStorage.setItem(
        draftKey,
        JSON.stringify({ answers, stepIndex, responseUuid, startedAt }),
      );
  }, [answers, responseUuid, startedAt, stepIndex, submitted]);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!submitted && Object.keys(answers).length) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [answers, submitted]);

  const setAnswer = (questionId: string, answer: Answer) => {
    setAnswers((current) => ({ ...current, [questionId]: answer }));
    setErrors((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
  };

  const validateCurrentStep = () => {
    const nextErrors: Record<string, string> = {};
    for (const question of stepQuestions) {
      if (isAnswerMissing(question, answers[question.id]))
        nextErrors[question.id] = "Please answer this question before continuing.";
    }
    setErrors(nextErrors);
    const firstErrorId = Object.keys(nextErrors)[0];
    if (firstErrorId) {
      document
        .getElementById(`field-${firstErrorId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  };

  const next = () => {
    if (validateCurrentStep())
      setStepIndex((current) => Math.min(surveySteps.length - 1, current + 1));
  };

  const back = () => {
    setErrors({});
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const submit = async () => {
    if (!validateCurrentStep()) return;
    setSubmitting(true);
    setApiError("");
    try {
      const result = await submitSurvey({
        schemaVersion: 1,
        responseUuid,
        startedAt,
        participant: {
          name: answers.participant_name?.textAnswer,
          deviceType: answers.participant_device?.textAnswer,
          websiteExperience: Number((answers.website_experience?.textAnswer ?? "").charAt(0)),
        },
        answers: Object.entries(answers).map(([questionId, answer]) => {
          const question = questionMap.get(questionId)!;
          return {
            questionId,
            prototypeKey: question.prototypeKey,
            layoutType: question.layoutType ?? "general",
            answerType: question.type,
            ...answer,
          };
        }),
      });
      setSubmitted(result.responseUuid ?? responseUuid);
      localStorage.removeItem(draftKey);
    } catch (error) {
      const result = responseError(error);
      setErrors(result.fields ?? {});
      setApiError(
        result.error ??
          "We couldn't submit your feedback. Your answers have been kept. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="shell confirmation">
        <div className="confirmation-mark">✓</div>
        <p className="eyebrow">Response recorded</p>
        <h1>Thank you for your feedback.</h1>
        <p>
          Your feedback has been recorded successfully. Your anonymous response ID is{" "}
          <code>{submitted}</code>.
        </p>
      </main>
    );
  }

  return (
    <>
      <AppHeader
        label="CM1040"
        accent="Prototype feedback"
        rightContent={
          <span className="counter">
            Step {stepIndex + 1} of {surveySteps.length}
          </span>
        }
      />
      <main className="shell">
        <div className="progress">
          <span
            style={{
              width: `${((stepIndex + 1) / surveySteps.length) * 100}%`,
            }}
          />
        </div>
        {step.kind === "welcome" ? (
          <section className="welcome">
            <p className="eyebrow">Connected South Africa · design review</p>
            <h1>Help shape the final website.</h1>
            <p className="lead">
              I am testing prototype designs for a website being developed as part of my Web
              Development coursework. Please look through the designs and share what you notice
              about their appearance, usability, navigation, readability, and mobile layout.
            </p>
            <p>
              There are no right or wrong answers. Your feedback will be used to improve the designs
              before the final website is developed. This takes around 12–15 minutes.
            </p>
            <button className="primary" onClick={next}>
              Begin survey <span>→</span>
            </button>
          </section>
        ) : (
          <>
            <div className="step-heading">
              <p className="eyebrow">{step.kind === "prototype" ? "Screen review" : step.title}</p>
              <h1>{step.title}</h1>
              {step.kind === "cross" && (
                <p className="lead">
                  Now compare the designs as a whole and think about how a first-time visitor would
                  use them.
                </p>
              )}
              {step.kind === "final" && (
                <p className="lead">
                  Your most specific suggestion will help turn feedback into a documented design
                  improvement.
                </p>
              )}
            </div>
            {step.kind === "prototype" && step.prototypeKey && (
              <PrototypeViewer prototypeKey={step.prototypeKey} />
            )}
            <div className="questions">
              {stepQuestions.map((question) => (
                <QuestionField
                  key={question.id}
                  question={question}
                  answer={answers[question.id]}
                  error={errors[question.id]}
                  onChange={(answer) => setAnswer(question.id, answer)}
                />
              ))}
            </div>
            {apiError && (
              <p className="api-error" role="alert">
                {apiError}
              </p>
            )}
            <div className="actions">
              <button className="secondary" onClick={back} disabled={stepIndex === 0}>
                Back
              </button>
              {step.kind === "final" ? (
                <button className="primary" onClick={submit} disabled={submitting}>
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
        CM1040 Web Development · Prototype feedback is anonymous apart from the optional nickname.
      </footer>
    </>
  );
}

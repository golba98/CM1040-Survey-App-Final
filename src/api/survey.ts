import type { SurveySubmission, SurveySubmissionResult } from "../shared/types";

export async function submitSurvey(payload: SurveySubmission): Promise<SurveySubmissionResult> {
  const response = await fetch("/api/survey/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json()) as SurveySubmissionResult;
  if (!response.ok) throw data;
  return data;
}

import { questionMap } from "../src/shared/survey";
import { clean, json, type Env } from "./http";
import { validateSubmission } from "./validation";

type SubmissionPayload = {
  responseUuid: string;
  startedAt?: unknown;
  participant?: {
    name?: unknown;
    deviceType: string;
    websiteExperience: unknown;
  };
  answers: Array<{
    questionId: string;
    prototypeKey?: unknown;
    layoutType?: unknown;
    answerType?: unknown;
    numericAnswer?: unknown;
    textAnswer?: unknown;
  }>;
};

export async function submitSurvey(request: Request, env: Env) {
  if (request.method !== "POST")
    return json({ error: "Method not allowed" }, 405);
  const raw = await request.text();
  if (raw.length > 180_000)
    return json({ error: "The survey submission is too large." }, 413);

  let payload: SubmissionPayload;
  try {
    payload = JSON.parse(raw) as SubmissionPayload;
  } catch {
    return json({ error: "Please send valid survey data." }, 400);
  }
  const errors = validateSubmission(payload);
  if (Object.keys(errors).length)
    return json(
      { error: "Please correct the highlighted answers.", fields: errors },
      422,
    );

  let existing: unknown;
  try {
    existing = await env.DB.prepare(
      "SELECT response_uuid FROM survey_responses WHERE response_uuid = ? AND status = 'submitted'",
    )
      .bind(payload.responseUuid)
      .first();
  } catch (error) {
    // Without this the participant sees the raw HTML error page as
    // "Unexpected token '<'" instead of a message they can act on.
    console.error("duplicate check failed", error);
    return json(
      {
        error:
          "We couldn't submit your feedback. Your answers have been kept. Please try again.",
      },
      500,
    );
  }
  if (existing)
    return json({
      ok: true,
      duplicate: true,
      responseUuid: payload.responseUuid,
    });

  const answers = payload.answers.filter((answer) =>
    questionMap.has(answer.questionId),
  );
  const statements = [
    env.DB.prepare(
      "INSERT INTO survey_responses (response_uuid, participant_name, device_type, website_experience, started_at, submitted_at, status) VALUES (?, ?, ?, ?, ?, datetime('now'), 'submitted')",
    ).bind(
      payload.responseUuid,
      clean(payload.participant?.name, 80) || null,
      payload.participant?.deviceType,
      Number(payload.participant?.websiteExperience),
      clean(payload.startedAt, 80) || new Date().toISOString(),
    ),
    ...answers.map((answer) =>
      env.DB.prepare(
        "INSERT INTO survey_answers (response_uuid, question_id, prototype_key, layout_type, answer_type, numeric_answer, text_answer, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))",
      ).bind(
        payload.responseUuid,
        answer.questionId,
        clean(answer.prototypeKey, 80) || null,
        clean(answer.layoutType, 30) || "general",
        answer.answerType === "rating"
          ? "rating"
          : answer.answerType === "ranking"
            ? "ranking"
            : answer.numericAnswer != null
              ? "rating"
              : "text",
        Number.isInteger(answer.numericAnswer) ? answer.numericAnswer : null,
        clean(answer.textAnswer),
      ),
    ),
  ];
  try {
    await env.DB.batch(statements);
  } catch (error) {
    console.error("survey submission failed", error);
    return json(
      {
        error:
          "We couldn't submit your feedback. Your answers have been kept. Please try again.",
      },
      500,
    );
  }
  return json({ ok: true, responseUuid: payload.responseUuid });
}

import { questionMap } from "../src/shared/survey";
import {
  exportQuestions,
  parseStoredAnswers,
  type StoredAnswer,
} from "./answers";
import { json, type Env } from "./http";

const metadataHeaders = [
  "response_id",
  "timestamp",
  "participant_name",
  "device",
  "website_experience",
];
const exportHeaders = [
  ...metadataHeaders,
  ...exportQuestions.map((question) => question.id),
];

function exportValue(value: unknown) {
  return Array.isArray(value) ? JSON.stringify(value) : value;
}

function escapeCsv(value: unknown) {
  const text = String(exportValue(value) ?? "").replaceAll('"', '""');
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

async function exportResponses(url: URL, env: Env) {
  const result = await env.DB.prepare(
    "SELECT response_uuid, submitted_at, participant_name, device_type, website_experience, answers_json FROM survey_responses WHERE status='submitted' ORDER BY submitted_at",
  ).all<Record<string, unknown>>();
  const rows: Array<Record<string, unknown>> = result.results.map((row) => ({
    response_id: row.response_uuid,
    timestamp: row.submitted_at,
    participant_name: row.participant_name,
    device: row.device_type,
    website_experience: row.website_experience,
    ...parseStoredAnswers(row.answers_json),
  }));

  if (url.searchParams.get("format") === "json") return json(rows);
  const csv = [
    exportHeaders,
    ...rows.map((row) =>
      exportHeaders.map((header) => `"${escapeCsv(row[header])}"`),
    ),
  ]
    .map((row) => row.join(","))
    .join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=cm1040-survey.csv",
      "Cache-Control": "no-store",
    },
  });
}

function displayAnswer(questionId: string, answer: StoredAnswer) {
  const question = questionMap.get(questionId);
  return {
    questionId,
    questionText: question?.text ?? questionId,
    answerType: question?.type ?? typeof answer,
    value: answer,
  };
}

export async function handleAdminRequest(request: Request, env: Env) {
  const url = new URL(request.url);
  if (url.pathname === "/api/admin/summary") {
    const [count, ratings, firstChoices, preferences] = await Promise.all([
      env.DB.prepare(
        "SELECT COUNT(*) AS total FROM survey_responses WHERE status='submitted'",
      ).first<{ total: number }>(),
      env.DB.prepare(
        "SELECT answer.key AS question_id, ROUND(AVG(CAST(answer.value AS REAL)), 2) AS average, COUNT(*) AS count FROM survey_responses AS response JOIN json_each(response.answers_json) AS answer WHERE response.status='submitted' AND answer.type IN ('integer', 'real') GROUP BY answer.key",
      ).all(),
      env.DB.prepare(
        "SELECT json_extract(answers_json, '$.concept_ranking[0]') AS option, COUNT(*) AS count FROM survey_responses WHERE status='submitted' AND json_extract(answers_json, '$.concept_ranking[0]') IS NOT NULL GROUP BY option ORDER BY count DESC, option",
      ).all(),
      env.DB.prepare(
        "SELECT answer.key AS question_id, answer.value AS option, COUNT(*) AS count FROM survey_responses AS response JOIN json_each(response.answers_json) AS answer WHERE response.status='submitted' AND answer.key IN ('preferred_at_glance', 'preferred_first_time_use', 'preferred_visual_design', 'preferred_navigation', 'preferred_readability', 'preferred_responsive_design') GROUP BY answer.key, answer.value ORDER BY answer.key, count DESC, answer.value",
      ).all(),
    ]);
    return json({
      total: count?.total ?? 0,
      ratings: ratings.results,
      firstChoices: firstChoices.results,
      preferences: preferences.results,
    });
  }
  if (url.pathname === "/api/admin/responses") {
    const limit = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get("limit") || 50)),
    );
    const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
    const result = await env.DB.prepare(
      "SELECT response_uuid, participant_name, device_type, website_experience, submitted_at FROM survey_responses WHERE status='submitted' ORDER BY submitted_at DESC LIMIT ? OFFSET ?",
    )
      .bind(limit, offset)
      .all();
    return json(result.results);
  }
  if (url.pathname.startsWith("/api/admin/responses/")) {
    const responseUuid = url.pathname.split("/").pop();
    const response = await env.DB.prepare(
      "SELECT response_uuid, participant_name, device_type, website_experience, started_at, submitted_at, status, answers_json FROM survey_responses WHERE response_uuid = ? AND status='submitted'",
    )
      .bind(responseUuid)
      .first<Record<string, unknown>>();
    if (!response) return json({ error: "Response not found" }, 404);
    const answers = Object.entries(parseStoredAnswers(response.answers_json)).map(
      ([questionId, answer]) => displayAnswer(questionId, answer),
    );
    const { answers_json: _answersJson, ...metadata } = response;
    return json({ response: metadata, answers });
  }
  if (url.pathname === "/api/admin/comments") {
    const questionId = url.searchParams.get("questionId");
    if (questionId && !questionMap.has(questionId))
      return json({ error: "Question not found" }, 404);
    const statement = questionId
      ? env.DB.prepare(
          "SELECT response.response_uuid, answer.key AS question_id, answer.value AS text_answer, response.submitted_at AS created_at FROM survey_responses AS response JOIN json_each(response.answers_json) AS answer WHERE response.status='submitted' AND answer.key = ? AND answer.type = 'text' AND answer.value != '' ORDER BY response.submitted_at DESC",
        ).bind(questionId)
      : env.DB.prepare(
          "SELECT response.response_uuid, answer.key AS question_id, answer.value AS text_answer, response.submitted_at AS created_at FROM survey_responses AS response JOIN json_each(response.answers_json) AS answer WHERE response.status='submitted' AND answer.type = 'text' AND answer.value != '' ORDER BY response.submitted_at DESC",
        );
    const result = await statement.all<Record<string, unknown>>();
    return json(
      result.results.map((row) => ({
        ...row,
        prototype_key: questionMap.get(String(row.question_id))?.prototypeKey,
      })),
    );
  }
  if (url.pathname === "/api/admin/export") return exportResponses(url, env);
  return json({ error: "Not found" }, 404);
}

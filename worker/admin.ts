import { questionMap } from "../src/shared/survey";
import { json, type Env } from "./http";

const exportHeaders = [
  "response_id",
  "timestamp",
  "participant_name",
  "device",
  "prototype",
  "layout",
  "question_id",
  "question_text",
  "answer_type",
  "numeric_answer",
  "text_answer",
];

function escapeCsv(value: unknown) {
  const text = String(value ?? "").replaceAll('"', '""');
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

async function exportResponses(url: URL, env: Env) {
  const rows = await env.DB.prepare(
    "SELECT r.response_uuid AS response_id, r.submitted_at AS timestamp, r.participant_name, r.device_type AS device, a.prototype_key, a.layout_type, a.question_id, a.answer_type, a.numeric_answer, a.text_answer FROM survey_responses r JOIN survey_answers a ON a.response_uuid=r.response_uuid WHERE r.status='submitted' ORDER BY r.submitted_at, a.id",
  ).all<Record<string, unknown>>();
  const enriched: Array<Record<string, unknown>> = rows.results.map((row) => ({
    ...row,
    question_text:
      questionMap.get(String(row.question_id))?.text ?? row.question_id,
  }));
  if (url.searchParams.get("format") === "json") return json(enriched);
  const csv = [
    exportHeaders,
    ...enriched.map((row) =>
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

export async function handleAdminRequest(request: Request, env: Env) {
  const url = new URL(request.url);
  if (url.pathname === "/api/admin/summary") {
    const [count, ratings] = await Promise.all([
      env.DB.prepare(
        "SELECT COUNT(*) AS total FROM survey_responses WHERE status='submitted'",
      ).first<{ total: number }>(),
      env.DB.prepare(
        "SELECT question_id, ROUND(AVG(numeric_answer), 2) AS average, COUNT(*) AS count FROM survey_answers WHERE numeric_answer IS NOT NULL GROUP BY question_id",
      ).all(),
    ]);
    return json({ total: count?.total ?? 0, ratings: ratings.results });
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
      "SELECT * FROM survey_responses WHERE response_uuid = ? AND status='submitted'",
    )
      .bind(responseUuid)
      .first();
    if (!response) return json({ error: "Response not found" }, 404);
    const answers = await env.DB.prepare(
      "SELECT * FROM survey_answers WHERE response_uuid = ? ORDER BY id",
    )
      .bind(responseUuid)
      .all();
    return json({ response, answers: answers.results });
  }
  if (url.pathname === "/api/admin/comments") {
    const questionId = url.searchParams.get("questionId");
    const statement = questionId
      ? env.DB.prepare(
          "SELECT response_uuid, prototype_key, text_answer, created_at FROM survey_answers WHERE question_id = ? AND text_answer IS NOT NULL AND text_answer != '' ORDER BY created_at DESC",
        ).bind(questionId)
      : env.DB.prepare(
          "SELECT response_uuid, question_id, prototype_key, text_answer, created_at FROM survey_answers WHERE text_answer IS NOT NULL AND text_answer != '' ORDER BY created_at DESC",
        );
    return json((await statement.all()).results);
  }
  if (url.pathname === "/api/admin/export") return exportResponses(url, env);
  return json({ error: "Not found" }, 404);
}

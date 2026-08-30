import { questionMap, questions } from "../src/shared/survey";

interface Env { DB: D1Database; ASSETS: Fetcher; }
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
const clean = (value: unknown, max = 4000) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validUuid = (value: unknown) => typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

function validate(payload: any) {
  const errors: Record<string, string> = {};
  if (!validUuid(payload?.responseUuid)) errors.responseUuid = "A valid response ID is required.";
  const participant = payload?.participant ?? {};
  if (!["Desktop computer", "Laptop", "Mobile phone", "Tablet", "Other"].includes(participant.deviceType)) errors.participant_device = "Please select the device you are using.";
  if (!/^[1-5]$/.test(String(participant.websiteExperience))) errors.website_experience = "Please select your website experience level.";
  const answers = Array.isArray(payload?.answers) ? payload.answers : [];
  const seen = new Set<string>();
  for (const answer of answers) {
    const q = questionMap.get(answer?.questionId);
    if (!q || seen.has(answer.questionId)) { errors[answer?.questionId || "answers"] = "This answer is not recognised."; continue; }
    seen.add(answer.questionId);
    if (q.showWhen && answers.find((a: any) => a.questionId === q.showWhen?.questionId)?.textAnswer !== q.showWhen.equals) continue;
    if (q.required && answer.answerType !== "ranking" && answer.numericAnswer == null && !clean(answer.textAnswer)) errors[q.id] = `Please answer: ${q.text}`;
    if (q.type === "rating" && (!Number.isInteger(answer.numericAnswer) || answer.numericAnswer < 1 || answer.numericAnswer > 5)) errors[q.id] = `Please select a rating for: ${q.text}`;
    if (q.type === "choice" && !q.options?.includes(clean(answer.textAnswer))) errors[q.id] = `Please choose one of the available options for: ${q.text}`;
    if (q.type === "ranking") { let ranking: unknown; try { ranking = JSON.parse(clean(answer.textAnswer)); } catch { ranking = null; } if (!Array.isArray(ranking) || ranking.length !== q.options?.length || new Set(ranking).size !== ranking.length || ranking.some((item) => !q.options?.includes(item))) errors[q.id] = `Please rank all of the concepts for: ${q.text}`; }
    if (q.type === "text" && clean(answer.textAnswer).length > 4000) errors[q.id] = "Please keep this response under 4,000 characters.";
  }
  for (const q of questions) {
    if (!q.required || q.id === "participant_name" || q.id === "text_too_small_details") continue;
    const answer = answers.find((a: any) => a.questionId === q.id);
    if (!answer || (q.type === "text" && !clean(answer.textAnswer)) || (q.type !== "text" && answer.numericAnswer == null && !clean(answer.textAnswer))) errors[q.id] ??= `Please answer: ${q.text}`;
  }
  return errors;
}

async function submit(request: Request, env: Env) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const raw = await request.text();
  if (raw.length > 180_000) return json({ error: "The survey submission is too large." }, 413);
  let payload: any; try { payload = JSON.parse(raw); } catch { return json({ error: "Please send valid survey data." }, 400); }
  const errors = validate(payload);
  if (Object.keys(errors).length) return json({ error: "Please correct the highlighted answers.", fields: errors }, 422);
  const uuid = payload.responseUuid as string;
  const existing = await env.DB.prepare("SELECT response_uuid FROM survey_responses WHERE response_uuid = ? AND status = 'submitted'").bind(uuid).first();
  if (existing) return json({ ok: true, duplicate: true, responseUuid: uuid });
  const answers = (payload.answers as any[]).filter((a) => questionMap.has(a.questionId));
  const statements = [env.DB.prepare("INSERT INTO survey_responses (response_uuid, participant_name, device_type, website_experience, started_at, submitted_at, status) VALUES (?, ?, ?, ?, ?, datetime('now'), 'submitted')").bind(uuid, clean(payload.participant?.name, 80) || null, payload.participant.deviceType, Number(payload.participant.websiteExperience), clean(payload.startedAt, 80) || new Date().toISOString()), ...answers.map((a) => env.DB.prepare("INSERT INTO survey_answers (response_uuid, question_id, prototype_key, layout_type, answer_type, numeric_answer, text_answer, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))").bind(uuid, a.questionId, clean(a.prototypeKey, 80) || null, clean(a.layoutType, 30) || "general", a.answerType === "rating" ? "rating" : a.answerType === "ranking" ? "ranking" : a.numericAnswer != null ? "rating" : "text", Number.isInteger(a.numericAnswer) ? a.numericAnswer : null, clean(a.textAnswer)))];
  try { await env.DB.batch(statements); } catch (error) { console.error("survey submission failed", error); return json({ error: "We couldn't submit your feedback. Your answers have been kept. Please try again." }, 500); }
  return json({ ok: true, responseUuid: uuid });
}

async function admin(request: Request, env: Env) {
  const url = new URL(request.url); const path = url.pathname;
  if (path === "/api/admin/summary") {
    const [count, ratings] = await Promise.all([env.DB.prepare("SELECT COUNT(*) AS total FROM survey_responses WHERE status='submitted'").first(), env.DB.prepare("SELECT question_id, ROUND(AVG(numeric_answer), 2) AS average, COUNT(*) AS count FROM survey_answers WHERE numeric_answer IS NOT NULL GROUP BY question_id").all()]);
    return json({ total: count?.total ?? 0, ratings: ratings.results });
  }
  if (path === "/api/admin/responses") {
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") || 50))); const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
    const result = await env.DB.prepare("SELECT response_uuid, participant_name, device_type, website_experience, submitted_at FROM survey_responses WHERE status='submitted' ORDER BY submitted_at DESC LIMIT ? OFFSET ?").bind(limit, offset).all(); return json(result.results);
  }
  if (path.startsWith("/api/admin/responses/")) {
    const uuid = path.split("/").pop(); const response = await env.DB.prepare("SELECT * FROM survey_responses WHERE response_uuid = ? AND status='submitted'").bind(uuid).first(); if (!response) return json({ error: "Response not found" }, 404);
    const answers = await env.DB.prepare("SELECT * FROM survey_answers WHERE response_uuid = ? ORDER BY id").bind(uuid).all(); return json({ response, answers: answers.results });
  }
  if (path === "/api/admin/comments") {
    const questionId = url.searchParams.get("questionId"); const result = questionId ? await env.DB.prepare("SELECT response_uuid, prototype_key, text_answer, created_at FROM survey_answers WHERE question_id = ? AND text_answer IS NOT NULL AND text_answer != '' ORDER BY created_at DESC").bind(questionId).all() : await env.DB.prepare("SELECT response_uuid, question_id, prototype_key, text_answer, created_at FROM survey_answers WHERE text_answer IS NOT NULL AND text_answer != '' ORDER BY created_at DESC").all(); return json(result.results);
  }
  if (path === "/api/admin/export") {
    const rows = await env.DB.prepare("SELECT r.response_uuid AS response_id, r.submitted_at AS timestamp, r.participant_name, r.device_type AS device, a.prototype_key, a.layout_type, a.question_id, a.answer_type, a.numeric_answer, a.text_answer FROM survey_responses r JOIN survey_answers a ON a.response_uuid=r.response_uuid WHERE r.status='submitted' ORDER BY r.submitted_at, a.id").all();
    const enriched = rows.results.map((row: any) => ({ ...row, question_text: questionMap.get(row.question_id)?.text ?? row.question_id }));
    if (url.searchParams.get("format") === "json") return json(enriched);
    const headers = ["response_id", "timestamp", "participant_name", "device", "prototype", "layout", "question_id", "question_text", "answer_type", "numeric_answer", "text_answer"];
    const safe = (v: unknown) => { const s = String(v ?? "").replaceAll('"', '""'); return /^[=+\-@]/.test(s) ? `'${s}` : s; }; const csv = [headers, ...enriched.map((r: any) => headers.map((h) => `"${safe(r[h])}"`))].map((r) => r.join(",")).join("\n"); return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=cm1040-survey.csv", "Cache-Control": "no-store" } });
  }
  return json({ error: "Not found" }, 404);
}

export default { async fetch(request: Request, env: Env): Promise<Response> { const url = new URL(request.url); if (url.pathname === "/api/survey/submit") return submit(request, env); if (url.pathname.startsWith("/api/admin/")) return admin(request, env); return env.ASSETS ? env.ASSETS.fetch(request) : new Response("Not found", { status: 404 }); } } satisfies ExportedHandler<Env>;

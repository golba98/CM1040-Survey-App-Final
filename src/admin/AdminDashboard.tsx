import { useEffect, useMemo, useState } from "react";
import { getAdminSummary, getResponseDetail, getResponses } from "../api/admin";
import { AppHeader } from "../components/AppHeader";
import type { AdminSummary, ResponseDetail, SurveyResponse } from "../shared/types";

const overallRatingIds = [
  "overall_visual_design",
  "overall_usability",
  "overall_navigation",
  "overall_readability",
  "overall_mobile_design",
];

export function AdminDashboard() {
  const [summary, setSummary] = useState<AdminSummary>({
    total: 0,
    ratings: [],
  });
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [selected, setSelected] = useState<ResponseDetail | null>(null);
  const [error, setError] = useState("");
  const ratings = useMemo(
    () => new Map(summary.ratings.map((rating) => [rating.question_id, rating])),
    [summary.ratings],
  );

  useEffect(() => {
    Promise.all([getAdminSummary(), getResponses()])
      .then(([nextSummary, nextResponses]) => {
        setSummary(nextSummary);
        setResponses(nextResponses);
      })
      .catch(() => setError("Results could not be loaded."));
  }, []);

  return (
    <>
      <AppHeader
        label="CM1040"
        accent="Survey results"
        rightContent={
          <a className="admin-link" href="/">
            Open participant survey
          </a>
        }
      />
      <main className="admin-shell">
        <div className="admin-heading">
          <div>
            <p className="eyebrow">Private review area</p>
            <h1>Feedback dashboard</h1>
            <p>
              Use the comments and ratings below to connect an observed issue to a design
              improvement.
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
          {overallRatingIds.map((id) => (
            <div className="stat-card" key={id}>
              <span>{id.replace("overall_", "").replaceAll("_", " ")}</span>
              <strong>
                {ratings.get(id)?.average ?? "—"}
                <small>/ 5</small>
              </strong>
            </div>
          ))}
        </section>
        <section className="admin-panel">
          <h2>Responses</h2>
          {responses.length === 0 ? (
            <p className="empty-state">
              No completed responses yet. The dashboard will populate after participants submit
              feedback.
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
                  {responses.map((response) => (
                    <tr key={response.response_uuid}>
                      <td>
                        <code>{response.response_uuid.slice(0, 8)}…</code>
                      </td>
                      <td>{response.participant_name || "Anonymous"}</td>
                      <td>{response.device_type}</td>
                      <td>{response.website_experience}/5</td>
                      <td>{new Date(response.submitted_at).toLocaleString()}</td>
                      <td>
                        <button
                          className="row-button"
                          onClick={() =>
                            getResponseDetail(response.response_uuid)
                              .then(setSelected)
                              .catch(() => setError("Response details could not be loaded."))
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
              {selected.answers?.map((answer) => (
                <article key={answer.id}>
                  <span>{answer.question_id}</span>
                  <strong>{answer.numeric_answer ?? answer.text_answer}</strong>
                </article>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

CREATE TABLE IF NOT EXISTS survey_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  response_uuid TEXT NOT NULL UNIQUE,
  participant_name TEXT,
  device_type TEXT NOT NULL,
  website_experience INTEGER NOT NULL CHECK (website_experience BETWEEN 1 AND 5),
  started_at TEXT NOT NULL,
  submitted_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted'))
);

CREATE TABLE IF NOT EXISTS survey_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  response_uuid TEXT NOT NULL REFERENCES survey_responses(response_uuid) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  prototype_key TEXT,
  layout_type TEXT NOT NULL DEFAULT 'general',
  answer_type TEXT NOT NULL,
  numeric_answer INTEGER,
  text_answer TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_responses_submitted ON survey_responses(status, submitted_at);
CREATE INDEX IF NOT EXISTS idx_answers_question ON survey_answers(question_id, prototype_key, layout_type);
CREATE INDEX IF NOT EXISTS idx_answers_response ON survey_answers(response_uuid);

UPDATE survey_responses
SET answers_json = COALESCE(
  (
    SELECT json_group_object(
      question_id,
      CASE
        WHEN numeric_answer IS NOT NULL THEN numeric_answer
        WHEN answer_type = 'ranking' AND json_valid(text_answer) THEN json(text_answer)
        ELSE text_answer
      END
    )
    FROM survey_answers
    WHERE survey_answers.response_uuid = survey_responses.response_uuid
      AND question_id NOT IN (
        'participant_name',
        'participant_device',
        'website_experience'
      )
  ),
  '{}'
)
WHERE answers_json = '{}'
  AND EXISTS (
    SELECT 1
    FROM survey_answers
    WHERE survey_answers.response_uuid = survey_responses.response_uuid
  );

DROP TABLE survey_answers;

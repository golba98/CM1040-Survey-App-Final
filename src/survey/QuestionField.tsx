import type { Question } from "../shared/survey";
import { isRankingItemTaken, parseRanking } from "../shared/survey-logic";
import type { Answer } from "../shared/types";

type QuestionFieldProps = {
  question: Question;
  answer?: Answer;
  error?: string;
  onChange: (answer: Answer) => void;
};

const appealLabels = ["Very poor", "Poor", "Average", "Good", "Excellent"];
const clarityLabels = ["Very unclear", "Unclear", "Average", "Clear", "Very clear"];

function ratingLabels(questionId: string) {
  const usesAppealScale =
    [
      "clarity",
      "appeal",
      "ease",
      "readability",
      "space",
      "navigation",
      "mobile",
      "button",
      "overall",
      "clickable",
    ].some((term) => questionId.includes(term)) || questionId === "layout_glance";
  return usesAppealScale ? appealLabels : clarityLabels;
}

function RatingField({ question, answer, onChange }: QuestionFieldProps) {
  const labels = ratingLabels(question.id);
  return (
    <div className="rating-options" role="radiogroup" aria-label={question.text}>
      {[1, 2, 3, 4, 5].map((value) => (
        <label className="rating-option" key={value}>
          <input
            type="radio"
            name={question.id}
            value={value}
            checked={answer?.numericAnswer === value}
            onChange={() => onChange({ numericAnswer: value })}
          />
          <span className="rating-number">{value}</span>
          <span>{labels[value - 1]}</span>
        </label>
      ))}
    </div>
  );
}

function RankingField({ question, answer, onChange }: QuestionFieldProps) {
  const ranking = parseRanking(answer?.textAnswer);
  return (
    <div className="ranking-options">
      {question.options?.map((option, index) => (
        <label key={option}>
          {index + 1}.{" "}
          <select
            aria-label={`Rank ${index + 1}`}
            value={ranking[index]}
            onChange={(event) => {
              const nextRanking = [...ranking];
              nextRanking[index] = event.target.value;
              onChange({ textAnswer: JSON.stringify(nextRanking) });
            }}
          >
            <option value="">Choose a concept</option>
            {question.options?.map((item) => (
              <option key={item} value={item} disabled={isRankingItemTaken(answer, item, index)}>
                {item}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

function textRows(questionId: string) {
  return ["comment", "change", "liked", "improvement", "confusing"].some((term) =>
    questionId.includes(term),
  )
    ? 5
    : 3;
}

export function QuestionField({ question, answer, error, onChange }: QuestionFieldProps) {
  const id = `field-${question.id}`;
  return (
    <fieldset
      id={id}
      className={`question ${error ? "has-error" : ""}`}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend>
        {question.text}
        {question.required ? (
          <span className="required" aria-label="required">
            {" "}
            *
          </span>
        ) : (
          <span className="optional">Optional</span>
        )}
      </legend>
      {question.type === "rating" && (
        <RatingField question={question} answer={answer} onChange={onChange} />
      )}
      {question.type === "choice" && (
        <div className="choice-options">
          {question.options?.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={answer?.textAnswer === option}
                onChange={() => onChange({ textAnswer: option })}
              />{" "}
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
      {question.type === "ranking" && (
        <RankingField question={question} answer={answer} onChange={onChange} />
      )}
      {question.type === "text" && (
        <textarea
          id={id}
          rows={textRows(question.id)}
          value={answer?.textAnswer ?? ""}
          onChange={(event) => onChange({ textAnswer: event.target.value })}
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

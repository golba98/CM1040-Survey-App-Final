import type { AnswerType, LayoutType } from "./survey";

export type Answer = {
  numericAnswer?: number;
  textAnswer?: string;
};

export type Answers = Record<string, Answer>;

export type StepKind = "welcome" | "participant" | "prototype" | "cross" | "final";

export type Step = {
  key: string;
  title: string;
  kind: StepKind;
  prototypeKey?: string;
};

export type AnswerPayload = {
  questionId: string;
  prototypeKey?: string;
  layoutType: LayoutType;
  answerType: AnswerType;
  numericAnswer?: number;
  textAnswer?: string;
};

export type SurveySubmission = {
  schemaVersion: number;
  responseUuid: string;
  startedAt: string;
  participant: {
    name?: string;
    deviceType?: string;
    websiteExperience: number;
  };
  answers: AnswerPayload[];
};

export type SurveySubmissionResult = {
  ok?: boolean;
  responseUuid?: string;
  error?: string;
  fields?: Record<string, string>;
};

export type AdminRating = {
  question_id: string;
  average: number;
  count: number;
};

export type AdminSummary = { total: number; ratings: AdminRating[] };

export type SurveyResponse = {
  response_uuid: string;
  participant_name?: string | null;
  device_type: string;
  website_experience: number;
  submitted_at: string;
};

export type StoredAnswer = {
  id: number;
  question_id: string;
  numeric_answer?: number | null;
  text_answer?: string | null;
};

export type ResponseDetail = {
  response?: SurveyResponse;
  answers?: StoredAnswer[];
};

import type { AdminSummary, ResponseDetail, SurveyResponse } from "../shared/types";

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Request failed");
  return response.json() as Promise<T>;
}

export const getAdminSummary = () => getJson<AdminSummary>("/api/admin/summary");
export const getResponses = () => getJson<SurveyResponse[]>("/api/admin/responses");
export const getResponseDetail = (responseUuid: string) =>
  getJson<ResponseDetail>(`/api/admin/responses/${responseUuid}`);

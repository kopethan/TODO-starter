"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@todo/api-client";

export type { ReportDetail, ReportModerationInput, ReportSummary } from "@todo/types";
import type { ReportDetail, ReportModerationInput, ReportSummary } from "@todo/types";

export function useReports(filters: Record<string, string> = {}) {
  return useQuery({ queryKey: ["reports", filters], queryFn: () => apiRequest<ReportSummary[]>("/reports", undefined, filters) });
}
export function useReport(id: string) {
  return useQuery({ queryKey: ["report", id], queryFn: () => apiRequest<ReportDetail>(`/reports/${id}`), enabled: Boolean(id) });
}
export function useUpdateReport(id: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: ReportModerationInput) => apiRequest<ReportDetail>(`/reports/${id}`, { method: "PATCH", body: JSON.stringify(payload) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["report", id] }); qc.invalidateQueries({ queryKey: ["reports"] }); } });
}

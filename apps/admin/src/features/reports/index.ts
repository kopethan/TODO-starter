"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@todo/api-client";
import type {
  BulkReportModerationInput,
  BulkReportModerationResult,
  PaginatedResponse,
  ReportDetail,
  ReportModerationInput,
  ReportSummary
} from "@todo/types";
import { adminQueryKeys } from "@/lib/query-keys";

export type {
  BulkReportModerationInput,
  BulkReportModerationResult,
  PaginatedResponse,
  ReportDetail,
  ReportModerationInput,
  ReportSummary
} from "@todo/types";

export function useReports(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: adminQueryKeys.reports.list(filters),
    queryFn: () => apiRequest<PaginatedResponse<ReportSummary>>("/reports", undefined, filters),
    placeholderData: keepPreviousData
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: adminQueryKeys.reports.detail(id),
    queryFn: () => apiRequest<ReportDetail>(`/reports/${id}`),
    enabled: Boolean(id)
  });
}

export function useUpdateReport(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReportModerationInput) => apiRequest<ReportDetail>(`/reports/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports.detail(id) });
    }
  });
}

export function useBulkUpdateReports() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkReportModerationInput) =>
      apiRequest<BulkReportModerationResult>("/reports/bulk-moderation", {
        method: "POST",
        body: JSON.stringify(payload)
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports.all });
      variables.reportIds.forEach((id) => {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.reports.detail(id) });
      });
    }
  });
}

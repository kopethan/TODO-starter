"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@todo/api-client";
import type { ReportDetail, ReportSummary } from "@todo/types";

export type { ReportDetail, ReportSummary } from "@todo/types";

export function useReports(filters: Record<string, string> = {}) {
  return useQuery({ queryKey: ["reports", filters], queryFn: () => apiRequest<ReportSummary[]>("/reports", undefined, filters) });
}

export function useReport(id: string) {
  return useQuery({ queryKey: ["report", id], queryFn: () => apiRequest<ReportDetail>(`/reports/${id}`), enabled: Boolean(id) });
}

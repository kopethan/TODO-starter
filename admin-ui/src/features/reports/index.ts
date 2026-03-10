"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";

export type ReportType = "NORMAL_EXPERIENCE" | "BAD_EXPERIENCE" | "SCAM_ATTEMPT" | "SAFETY_INCIDENT" | "MISUSE_CASE" | "QUALITY_ISSUE" | "FRAUD_LOSS" | "WARNING";
export type VerificationState = "UNVERIFIED" | "PARTIALLY_VERIFIED" | "VERIFIED" | "REJECTED";
export type ModerationState = "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED" | "REMOVED";
export type SeverityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ReportOutcome = "SAFE" | "RESOLVED" | "NOT_RESOLVED" | "MONEY_LOST" | "TIME_LOST" | "ACCOUNT_COMPROMISED" | "ITEM_DAMAGED" | "INJURY" | "NEAR_MISS" | "UNKNOWN";

export type ReportSummary = {
  id: string;
  entityId: string;
  reportType: ReportType;
  title: string;
  narrative: string;
  happenedAt?: string | null;
  outcome?: ReportOutcome | null;
  severityLevel: SeverityLevel;
  moderationState: ModerationState;
  verificationState: VerificationState;
  reportedAt?: string;
  entity?: { id: string; title: string; slug: string; entityType: string };
};

export type ReportDetail = ReportSummary & { countryCode?: string | null; region?: string | null; city?: string | null; channel?: string | null; moneyLostAmount?: number | null; currency?: string | null; isAnonymous?: boolean; isPublic?: boolean; updatedAt?: string; };
export type ReportModerationInput = { verificationState?: VerificationState; moderationState?: ModerationState; severityLevel?: SeverityLevel; outcome?: ReportOutcome; };

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

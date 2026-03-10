import { apiFetch } from "@/lib/api/client";
import { toQueryString } from "@/lib/utils";
import type {
  ReportDetail,
  ReportListItem,
  ReportModerationPayload
} from "@/types/report";

export async function listReports(filters: {
  entityId?: string;
  reportType?: string;
  moderationState?: string;
  verificationState?: string;
}) {
  return apiFetch<ReportListItem[]>(
    `/reports${toQueryString({
      entityId: filters.entityId,
      reportType: filters.reportType,
      moderationState: filters.moderationState,
      verificationState: filters.verificationState
    })}`
  );
}

export async function getReport(reportId: string) {
  return apiFetch<ReportDetail>(`/reports/${reportId}`);
}

export async function updateReport(reportId: string, payload: Partial<ReportModerationPayload>) {
  return apiFetch<ReportDetail>(`/reports/${reportId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

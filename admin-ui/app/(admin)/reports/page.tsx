import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableWrapper, Td, Th } from "@/components/ui/data-table";
import { listReports } from "@/lib/api/reports";
import { formatDateTime } from "@/lib/format";
import { sentenceCase } from "@/lib/utils";
import { ReportFilters } from "@/features/reports/components/report-filters";
import {
  ModerationBadge,
  SeverityBadge,
  VerificationBadge
} from "@/features/reports/components/report-badges";

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const reports = await listReports({
    entityId: typeof params.entityId === "string" ? params.entityId : undefined,
    reportType: typeof params.reportType === "string" ? params.reportType : undefined,
    moderationState:
      typeof params.moderationState === "string" ? params.moderationState : undefined,
    verificationState:
      typeof params.verificationState === "string" ? params.verificationState : undefined
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Review user-submitted experiences and moderate their verification and moderation state."
      />

      <ReportFilters />

      {reports.length === 0 ? (
        <EmptyState
          title="No reports found"
          description="Try clearing filters or wait for more community submissions to arrive."
        />
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Report</Th>
                <Th>Entity</Th>
                <Th>Type</Th>
                <Th>Severity</Th>
                <Th>Verification</Th>
                <Th>Moderation</Th>
                <Th>Reported</Th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-[var(--border)]">
                  <Td>
                    <Link href={`/reports/${report.id}`} className="block space-y-1 hover:opacity-80">
                      <div className="font-medium text-[var(--text-strong)]">{report.title}</div>
                      <div className="text-sm text-[var(--text-muted)]">{report.outcome ? sentenceCase(report.outcome) : "No outcome yet"}</div>
                    </Link>
                  </Td>
                  <Td>
                    <div className="font-medium text-[var(--text-strong)]">{report.entity.title}</div>
                    <div className="text-xs text-[var(--text-soft)]">{sentenceCase(report.entity.entityType)}</div>
                  </Td>
                  <Td>{sentenceCase(report.reportType)}</Td>
                  <Td><SeverityBadge value={report.severityLevel} /></Td>
                  <Td><VerificationBadge value={report.verificationState} /></Td>
                  <Td><ModerationBadge value={report.moderationState} /></Td>
                  <Td>{formatDateTime(report.reportedAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </div>
  );
}

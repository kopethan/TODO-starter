"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ModerationBadge, SeverityBadge, VerificationBadge } from "@/components/status/badges";
import { ReportModerationForm } from "@/features/reports/form";
import { useReport, useUpdateReport } from "@/features/reports";
import { formatDate, formatEnum } from "@/lib/utils/format";

export default function AdminReportDetailPage() {
  const params = useParams<{ id: string }>();
  const report = useReport(params.id);
  const update = useUpdateReport(params.id);

  if (report.isLoading) return <div>Loading report...</div>;
  if (!report.data) return <div>Report not found.</div>;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <PageHeader title={report.data.title} subtitle={report.data.entity?.title ? `Attached to ${report.data.entity.title}` : "Experience report"} actions={<><VerificationBadge value={report.data.verificationState} /><ModerationBadge value={report.data.moderationState} /><SeverityBadge value={report.data.severityLevel} /></>} />
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-base font-semibold">Summary</h2>
            <dl className="mt-4 grid gap-4 md:grid-cols-2 text-sm"><div><dt className="text-[var(--text-muted)]">Entity</dt><dd className="mt-1">{report.data.entity ? <Link className="font-medium hover:underline" href={`/admin/entities/${report.data.entity.id}`}>{report.data.entity.title}</Link> : '—'}</dd></div><div><dt className="text-[var(--text-muted)]">Report type</dt><dd className="mt-1">{formatEnum(report.data.reportType)}</dd></div><div><dt className="text-[var(--text-muted)]">Reported</dt><dd className="mt-1">{formatDate(report.data.reportedAt)}</dd></div><div><dt className="text-[var(--text-muted)]">Happened at</dt><dd className="mt-1">{formatDate(report.data.happenedAt)}</dd></div></dl>
          </Card>
          <Card className="p-5"><h2 className="text-base font-semibold">Narrative</h2><p className="mt-4 whitespace-pre-wrap text-[var(--text-secondary)]">{report.data.narrative}</p></Card>
          <Card className="p-5"><h2 className="text-base font-semibold">Context</h2><dl className="mt-4 grid gap-4 md:grid-cols-2 text-sm"><div><dt className="text-[var(--text-muted)]">Channel</dt><dd className="mt-1">{formatEnum(report.data.channel)}</dd></div><div><dt className="text-[var(--text-muted)]">Outcome</dt><dd className="mt-1">{formatEnum(report.data.outcome)}</dd></div><div><dt className="text-[var(--text-muted)]">Location</dt><dd className="mt-1">{[report.data.city, report.data.region, report.data.countryCode].filter(Boolean).join(', ') || '—'}</dd></div><div><dt className="text-[var(--text-muted)]">Anonymous</dt><dd className="mt-1">{report.data.isAnonymous ? 'Yes' : 'No'}</dd></div></dl></Card>
        </div>
      </div>
      <div className="space-y-4">
        <ReportModerationForm report={report.data} loading={update.isPending} onSubmit={async (values) => { await update.mutateAsync(values); }} />
        <Card className="p-5"><h2 className="text-base font-semibold">Meta</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-[var(--text-muted)]">Report ID</dt><dd className="mt-1 break-all">{report.data.id}</dd></div><div><dt className="text-[var(--text-muted)]">Updated</dt><dd className="mt-1">{formatDate(report.data.updatedAt)}</dd></div></dl></Card>
      </div>
    </div>
  );
}

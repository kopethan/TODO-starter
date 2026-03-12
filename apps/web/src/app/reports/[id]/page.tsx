"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Card, ModerationBadge, SeverityBadge, VerificationBadge, formatDate, formatEnum } from "@todo/ui";
import { useReport } from "@/features/reports";

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const report = useReport(params.id);

  if (report.isLoading) return <div className="mx-auto max-w-4xl px-4 py-10">Loading report...</div>;
  if (!report.data) return <div className="mx-auto max-w-4xl px-4 py-10">Report not found.</div>;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <Link href="/reports" className="inline-flex w-fit text-sm font-medium text-[var(--theme-700)] hover:underline">Back to reports</Link>

      <Card className="rounded-[1.75rem] p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="default" className="tracking-[0.16em]">REPORT</Badge>
          <SeverityBadge value={report.data.severityLevel} />
          <VerificationBadge value={report.data.verificationState} />
          <ModerationBadge value={report.data.moderationState} />
        </div>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{report.data.title}</h1>
        {report.data.entity ? (
          <Link href={`/entities/${report.data.entity.slug}`} className="mt-3 inline-flex text-sm font-medium text-[var(--theme-700)] hover:underline">
            Related entity: {report.data.entity.title}
          </Link>
        ) : null}
        <div className="mt-5 grid gap-3 text-sm text-[var(--text-secondary)] sm:grid-cols-2 lg:grid-cols-4">
          <MetaBlock label="Type" value={formatEnum(report.data.reportType)} />
          <MetaBlock label="Date" value={formatDate(report.data.happenedAt ?? report.data.reportedAt)} />
          <MetaBlock label="Outcome" value={formatEnum(report.data.outcome) || "Unknown"} />
          <MetaBlock label="Location" value={report.data.city || report.data.region || report.data.countryCode || "Not shared"} />
        </div>
      </Card>

      <Card className="rounded-[1.75rem] p-6">
        <h2 className="text-2xl font-semibold tracking-tight">Summary</h2>
        <p className="mt-4 whitespace-pre-wrap text-[var(--text-secondary)]">{report.data.narrative}</p>
      </Card>

      <Card className="rounded-[1.75rem] p-6">
        <h2 className="text-2xl font-semibold tracking-tight">Extra details</h2>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <MetaBlock label="Channel" value={formatEnum(report.data.channel) || "Not shared"} />
          <MetaBlock label="Anonymous" value={report.data.isAnonymous ? "Yes" : "No"} />
          <MetaBlock label="Money lost" value={report.data.moneyLostAmount && report.data.currency ? `${report.data.moneyLostAmount} ${report.data.currency}` : "Not shared"} />
          <MetaBlock label="Updated" value={formatDate(report.data.updatedAt ?? report.data.reportedAt)} />
        </div>
      </Card>
    </div>
  );
}

function MetaBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] bg-[var(--bg-surface-muted)] p-4 shadow-[inset_0_0_0_1px_rgba(15,23,32,0.03)] dark:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-sm text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

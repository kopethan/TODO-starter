import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getReport } from "@/lib/api/reports";
import { formatDateTime, formatMoney } from "@/lib/format";
import { sentenceCase } from "@/lib/utils";
import { ModerationForm } from "@/features/reports/components/moderation-form";
import {
  ModerationBadge,
  SeverityBadge,
  VerificationBadge
} from "@/features/reports/components/report-badges";

export default async function ReportDetailPage({
  params
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;
  const report = await getReport(reportId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={report.title}
        description="Review the claim narrative and update moderation decisions carefully."
        actions={
          <div className="flex flex-wrap gap-2">
            <VerificationBadge value={report.verificationState} />
            <ModerationBadge value={report.moderationState} />
            <SeverityBadge value={report.severityLevel} />
            <Link href="/reports" className={buttonClasses({ variant: "ghost" })}>Back to reports</Link>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report narrative</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-[var(--border)] p-4">
                <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text)]">{report.narrative}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Context</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Entity</div>
                <div className="font-medium text-[var(--text-strong)]">{report.entity.title}</div>
                <div className="text-[var(--text-muted)]">{sentenceCase(report.entity.entityType)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Report type</div>
                <div className="font-medium text-[var(--text-strong)]">{sentenceCase(report.reportType)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Reported at</div>
                <div className="font-medium text-[var(--text-strong)]">{formatDateTime(report.reportedAt)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Happened at</div>
                <div className="font-medium text-[var(--text-strong)]">{formatDateTime(report.happenedAt)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Location</div>
                <div className="font-medium text-[var(--text-strong)]">
                  {[report.city, report.region, report.countryCode].filter(Boolean).join(", ") || "—"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Channel</div>
                <div className="font-medium text-[var(--text-strong)]">{report.channel ? sentenceCase(report.channel) : "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Outcome</div>
                <div className="font-medium text-[var(--text-strong)]">{report.outcome ? sentenceCase(report.outcome) : "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wide text-[var(--text-soft)]">Money lost</div>
                <div className="font-medium text-[var(--text-strong)]">{formatMoney(report.moneyLostAmount, report.currency)}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <ModerationForm report={report} />

          <Card>
            <CardHeader>
              <CardTitle>Submission visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--text-muted)]">
              <div className="flex items-center justify-between gap-4">
                <span>Anonymous</span>
                <span className="text-[var(--text-strong)]">{report.isAnonymous ? "Yes" : "No"}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Public</span>
                <span className="text-[var(--text-strong)]">{report.isPublic ? "Yes" : "No"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

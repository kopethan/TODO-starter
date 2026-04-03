"use client";

import Link from "next/link";
import { Button, Card, ModerationBadge, SeverityBadge, VerificationBadge, formatDate, formatEnum } from "@todo/ui";
import type { ModerationState, ReportSummary } from "@todo/types";
import { useToast } from "@/components/shared/toast-provider";
import { useUpdateReport } from "@/features/reports";

export function QueueReportCard({
  report,
  selected,
  onSelectedChange
}: {
  report: ReportSummary;
  selected: boolean;
  onSelectedChange: (checked: boolean) => void;
}) {
  const updateReport = useUpdateReport(report.id);
  const { pushToast } = useToast();

  async function applyModerationState(nextState: ModerationState) {
    try {
      await updateReport.mutateAsync({ moderationState: nextState });
      pushToast({
        tone: "success",
        title: "Queue updated",
        description: `${report.title} is now ${formatEnum(nextState).toLowerCase()}.`
      });
    } catch (error) {
      pushToast({
        tone: "danger",
        title: "Could not update report",
        description: error instanceof Error ? error.message : "The moderation change did not save."
      });
    }
  }

  return (
    <Card className="border border-[var(--border-default)] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <label className="mt-1 flex shrink-0 items-start">
            <input
              type="checkbox"
              checked={selected}
              onChange={(event) => onSelectedChange(event.target.checked)}
              aria-label={`Select ${report.title}`}
              className="mt-1 h-4 w-4 rounded border-[var(--border-default)] accent-[var(--theme-600)]"
            />
          </label>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/reports/${report.id}`} className="text-base font-semibold hover:underline">
                {report.title}
              </Link>
              <SeverityBadge value={report.severityLevel} />
              <VerificationBadge value={report.verificationState} />
              <ModerationBadge value={report.moderationState} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
              <span>{report.entity?.title ?? "Unknown entity"}</span>
              <span>•</span>
              <span>{formatEnum(report.reportType)}</span>
              <span>•</span>
              <span>Reported {formatDate(report.reportedAt)}</span>
            </div>

            <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">
              {report.narrative}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 lg:w-[220px]">
          <Link href={`/reports/${report.id}`}>
            <Button variant="secondary" className="w-full">
              Open review
            </Button>
          </Link>
          <Button
            variant="primary"
            className="w-full"
            disabled={updateReport.isPending || report.moderationState === "APPROVED"}
            onClick={() => applyModerationState("APPROVED")}
          >
            {updateReport.isPending && report.moderationState !== "APPROVED" ? "Saving..." : "Approve"}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            disabled={updateReport.isPending || report.moderationState === "FLAGGED"}
            onClick={() => applyModerationState("FLAGGED")}
          >
            Flag for review
          </Button>
          <Button
            variant="danger"
            className="w-full"
            disabled={updateReport.isPending || report.moderationState === "REJECTED"}
            onClick={() => applyModerationState("REJECTED")}
          >
            Reject
          </Button>
        </div>
      </div>
    </Card>
  );
}

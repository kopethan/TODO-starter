"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Card, EntityTypeBadge, ModerationBadge, PageHeader, SeverityBadge, VerificationBadge, formatDate, formatEnum } from "@todo/ui";
import { KeyValueList } from "@/components/shared/key-value-list";
import { PageSection } from "@/components/shared/page-section";
import { useToast } from "@/components/shared/toast-provider";
import { ReportModerationForm } from "@/features/reports/form";
import { useReport, useUpdateReport } from "@/features/reports";

function formatMoney(value?: number | null, currency?: string | null) {
  return typeof value === "number" ? (currency ? `${value.toLocaleString()} ${currency}` : value.toLocaleString()) : "—";
}

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const report = useReport(id);
  const updateReport = useUpdateReport(id);
  const { pushToast } = useToast();

  if (report.isLoading) {
    return <p className="text-sm text-[var(--text-secondary)]">Loading report…</p>;
  }

  if (report.error || !report.data) {
    return <p className="text-sm text-[var(--danger-text)]">{report.error?.message ?? "Report not found."}</p>;
  }

  const item = report.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={item.title}
        subtitle="Read the experience in full, then update moderation and verification states."
        actions={
          <Link href="/reports">
            <Button variant="secondary">Back to reports</Button>
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2">
        <SeverityBadge value={item.severityLevel} />
        <VerificationBadge value={item.verificationState} />
        <ModerationBadge value={item.moderationState} />
        {item.entity ? <EntityTypeBadge value={item.entity.entityType} /> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <PageSection title="Summary" description="Core report metadata and entity context.">
            <KeyValueList
              items={[
                {
                  label: "Entity",
                  value: item.entity ? (
                    <Link className="underline decoration-[var(--border-default)] underline-offset-4" href={`/entities/${item.entity.id}`}>
                      {item.entity.title}
                    </Link>
                  ) : (
                    "—"
                  )
                },
                { label: "Report type", value: formatEnum(item.reportType) },
                { label: "Outcome", value: formatEnum(item.outcome) },
                { label: "Reported", value: formatDate(item.reportedAt) },
                { label: "Happened", value: formatDate(item.happenedAt) }
              ]}
            />
          </PageSection>

          <PageSection title="Narrative" description="The user-submitted experience, preserved in reading order.">
            <Card className="border border-[var(--border-default)] bg-[var(--bg-surface-muted)] p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--text-primary)]">{item.narrative}</p>
            </Card>
          </PageSection>

          <PageSection title="Context" description="Supplemental details that may affect moderation or trust interpretation.">
            <KeyValueList
              items={[
                { label: "Channel", value: formatEnum(item.channel) },
                { label: "Country", value: item.countryCode ?? "—" },
                { label: "Region", value: item.region ?? "—" },
                { label: "City", value: item.city ?? "—" },
                { label: "Money lost", value: formatMoney(item.moneyLostAmount, item.currency) },
                { label: "Anonymous", value: item.isAnonymous ? "Yes" : "No" },
                { label: "Public", value: item.isPublic ? "Yes" : "No" }
              ]}
            />
          </PageSection>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <ReportModerationForm
            report={item}
            loading={updateReport.isPending}
            onSubmit={async (values) => {
              try {
                const updated = await updateReport.mutateAsync(values);
                pushToast({
                  tone: "success",
                  title: "Moderation saved",
                  description: `${updated.title} now reflects the latest moderation decision.`
                });
              } catch (error) {
                pushToast({
                  tone: "danger",
                  title: "Could not save moderation",
                  description: error instanceof Error ? error.message : "The moderation update failed."
                });
                throw error;
              }
            }}
          />

          <PageSection title="Record metadata" description="Useful reference values while reviewing.">
            <KeyValueList
              items={[
                { label: "Report id", value: item.id },
                { label: "Entity slug", value: item.entity?.slug ?? "—" },
                { label: "Updated", value: formatDate(item.updatedAt) }
              ]}
            />
          </PageSection>
        </div>
      </div>
    </div>
  );
}

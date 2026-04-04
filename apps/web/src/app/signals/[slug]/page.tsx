"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Card, EntityTypeBadge, SeverityBadge, VerificationBadge, formatDate, formatEnum } from "@todo/ui";
import { useSignalBySlug } from "@/features/signals";

export default function SignalDetailPage() {
  const params = useParams<{ slug: string }>();
  const signal = useSignalBySlug(params.slug);

  if (signal.isLoading) {
    return <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">Loading signal...</div>;
  }

  if (!signal.data) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-10 sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">Public signal</p>
        <h1 className="text-3xl font-semibold tracking-tight">Signal not found</h1>
        <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
          This signal is not public, may no longer be active, or the link is out of date.
        </p>
        <Link href="/signals" className="inline-flex text-sm font-medium text-[var(--theme-700)] hover:underline">
          Back to signal archive
        </Link>
      </div>
    );
  }

  const detail = signal.data;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
          <Link href="/signals" className="font-medium text-[var(--theme-700)] hover:underline">Signals</Link>
          <span className="text-[var(--text-muted)]">/</span>
          <span>{detail.title}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={detail.sourceKind === "PATTERN_CARD" ? "theme" : detail.sourceKind === "ENTITY_GUIDANCE" ? "info" : "warning"}>
            {formatEnum(detail.sourceKind)}
          </Badge>
          <SeverityBadge value={detail.severityLevel} />
          <Badge>{formatEnum(detail.signalType)}</Badge>
          <Badge>{detail.evidenceCount} evidence</Badge>
          <Badge tone="info">{detail.strengthLabel}</Badge>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-700)]">Public signal</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{detail.title}</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">{detail.summary}</p>
        </div>

        {detail.entity ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <EntityTypeBadge value={detail.entity.entityType} />
            <Link href={`/entities/${detail.entity.slug}`} className="font-medium text-[var(--text-primary)] hover:text-[var(--theme-700)]">
              {detail.entity.title}
            </Link>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">
          <span>{detail.firstSeenAt ? `First seen ${formatDate(detail.firstSeenAt)}` : "First seen unknown"}</span>
          <span>{detail.lastSeenAt ? `Latest signal ${formatDate(detail.lastSeenAt)}` : "No latest date yet"}</span>
        </div>
      </section>

      <Card className="rounded-[1.75rem] p-6">
        <h2 className="text-xl font-semibold tracking-tight">Why this signal exists</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{detail.explanation}</p>
      </Card>

      <Card className="rounded-[1.75rem] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Evidence behind this signal</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Lightweight supporting evidence attached to the public signal contract.
            </p>
          </div>
          <div className="text-sm text-[var(--text-muted)]">{detail.evidenceCount} supporting items</div>
        </div>

        <div className="mt-5 space-y-6">
          {detail.relatedReports.length > 0 ? (
            <section>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Related reports</h3>
                {detail.entity ? (
                  <Link href={`/reports?entityId=${detail.entity.id}`} className="text-sm font-medium text-[var(--theme-700)] hover:underline">
                    Open report archive
                  </Link>
                ) : null}
              </div>
              <div className="mt-3 divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
                {detail.relatedReports.map((report) => (
                  <div key={report.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge value={report.severityLevel} />
                      <VerificationBadge value={report.verificationState} />
                      <Badge>{formatEnum(report.reportType)}</Badge>
                    </div>
                    <h4 className="mt-3 text-lg font-semibold">
                      <Link href={`/reports/${report.id}`} className="hover:text-[var(--theme-700)]">
                        {report.title}
                      </Link>
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{report.narrativeSnippet}</p>
                    <p className="mt-2 text-sm text-[var(--text-muted)]">{formatDate(report.happenedAt ?? report.reportedAt)}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {detail.relatedSections.length > 0 ? (
            <section>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Structured guidance</h3>
              <div className="mt-3 divide-y divide-[var(--border-default)] border-y border-[var(--border-default)]">
                {detail.relatedSections.map((section) => (
                  <div key={section.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="theme">{formatEnum(section.sectionType)}</Badge>
                    </div>
                    <h4 className="mt-3 text-lg font-semibold">{section.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{section.contentSnippet}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {detail.relatedReports.length === 0 && detail.relatedSections.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)]">This public signal does not expose additional lightweight evidence yet.</p>
          ) : null}
        </div>
      </Card>

      <section className="flex flex-wrap items-center gap-4 border-t border-[var(--border-default)] pt-4 text-sm">
        {detail.entity ? (
          <Link href={`/entities/${detail.entity.slug}`} className="font-medium text-[var(--theme-700)] hover:underline">
            Open entity detail
          </Link>
        ) : null}
        <Link href="/signals" className="font-medium text-[var(--theme-700)] hover:underline">
          Back to signal archive
        </Link>
      </section>
    </div>
  );
}

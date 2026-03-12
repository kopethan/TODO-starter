"use client";

import Link from "next/link";
import { Badge, Button, Card, EntityTypeBadge, Input, SeverityBadge, VerificationBadge, formatDate, formatEnum } from "@todo/ui";
import { useEntities } from "@/features/entities";
import { type ReportSummary, useReports } from "@/features/reports";

const patternCards = [
  {
    slug: "payment-pressure",
    label: "SIGNAL",
    title: "Payment pressure",
    summary: "Messages push the payment outside the normal flow before basic verification is done.",
    context: "Tags: off-platform • advance payment • refund pressure",
    href: "/reports?q=payment"
  },
  {
    slug: "identity-mismatch",
    label: "SIGNAL",
    title: "Identity mismatch",
    summary: "Names, profile details, or contact points change across the conversation or shared documents.",
    context: "Tags: new phone • different name • profile switch",
    href: "/reports?q=identity"
  },
  {
    slug: "urgency-without-proof",
    label: "SIGNAL",
    title: "Urgency without proof",
    summary: "A decision is pushed forward quickly while receipts, account history, or ownership proof stay unclear.",
    context: "Tags: act now • limited time • missing proof",
    href: "/reports?q=urgency"
  }
];

const severityRank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

export function PublicHomePage({ q }: { q: string }) {
  const entities = useEntities({ status: "PUBLISHED", visibility: "PUBLIC", q });
  const reports = useReports({ moderationState: "APPROVED" });
  const normalizedQuery = q.trim().toLowerCase();

  const visibleReports = [...(reports.data ?? [])]
    .filter((report) => {
      if (!normalizedQuery) return true;
      return [report.title, report.narrative, report.entity?.title]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedQuery));
    })
    .sort((a, b) => {
      const severityDelta = (severityRank[b.severityLevel] ?? 0) - (severityRank[a.severityLevel] ?? 0);
      if (severityDelta !== 0) return severityDelta;
      return new Date(b.reportedAt ?? 0).getTime() - new Date(a.reportedAt ?? 0).getTime();
    })
    .slice(0, 8);

  const visibleEntities = (entities.data ?? []).slice(0, q ? 4 : 3);
  const feed = buildFeed({ reports: visibleReports, entities: visibleEntities });

  return (
    <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="space-y-3">
        <form action="/" className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search reports, entities, or signals"
            className="h-14 rounded-full px-5 text-base"
          />
          <Button type="submit" variant="primary" className="h-14 rounded-full px-6 text-sm font-semibold">
            Search
          </Button>
        </form>
        {q ? <p className="px-2 text-sm text-[var(--text-secondary)]">Showing feed results for “{q}”.</p> : null}
      </section>

      <div className="space-y-4 pb-4">
        {feed.map((item) => {
          if (item.kind === "report") {
            return <ReportFeedCard key={`report-${item.report.id}`} report={item.report} />;
          }

          if (item.kind === "entity") {
            return <EntityFeedCard key={`entity-${item.entity.id}`} entity={item.entity} />;
          }

          return <SignalFeedCard key={`signal-${item.signal.slug}`} signal={item.signal} />;
        })}

        {!entities.isLoading && !reports.isLoading && feed.length === 0 ? (
          <Card className="rounded-[1.75rem] p-5 text-sm text-[var(--text-secondary)]">
            No feed items match this search yet.
          </Card>
        ) : null}
      </div>
    </div>
  );
}

type EntityCardItem = NonNullable<ReturnType<typeof useEntities>["data"]>[number];
type FeedItem =
  | { kind: "report"; report: ReportSummary }
  | { kind: "entity"; entity: EntityCardItem }
  | { kind: "signal"; signal: (typeof patternCards)[number] };

function buildFeed({ reports, entities }: { reports: ReportSummary[]; entities: EntityCardItem[] }) {
  const items: FeedItem[] = [];

  const max = Math.max(reports.length, entities.length, patternCards.length);

  for (let index = 0; index < max; index += 1) {
    if (reports[index]) items.push({ kind: "report", report: reports[index] });
    if (index < entities.length && (index === 0 || index === 2)) items.push({ kind: "entity", entity: entities[index] });
    if (index < patternCards.length && index < 2) items.push({ kind: "signal", signal: patternCards[index] });
  }

  if (entities[1]) items.splice(Math.min(3, items.length), 0, { kind: "entity", entity: entities[1] });
  if (patternCards[2]) items.splice(Math.min(6, items.length), 0, { kind: "signal", signal: patternCards[2] });

  return items.slice(0, 12);
}

function ReportFeedCard({ report }: { report: ReportSummary }) {
  return (
    <Link href={`/reports/${report.id}`} className="block">
      <Card className="group rounded-[1.8rem] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <Badge tone="default" className="tracking-[0.16em]">REPORT</Badge>
          <div className="shrink-0"><SeverityBadge value={report.severityLevel} /></div>
        </div>
        <h2 className="mt-4 text-[1.35rem] font-semibold tracking-tight text-[var(--text-primary)]">{report.title}</h2>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{report.narrative}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-[var(--text-secondary)]">
          {report.entity ? <span className="font-medium text-[var(--text-primary)]">Related: {report.entity.title}</span> : <span className="font-medium text-[var(--text-primary)]">Related: General case</span>}
          <VerificationBadge value={report.verificationState} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
          <span>{formatEnum(report.reportType)}</span>
          <span>{formatDate(report.happenedAt ?? report.reportedAt)}</span>
        </div>
      </Card>
    </Link>
  );
}

function EntityFeedCard({ entity }: { entity: NonNullable<ReturnType<typeof useEntities>["data"]>[number] }) {
  return (
    <Link href={`/entities/${entity.slug}`} className="block">
      <Card className="group rounded-[1.8rem] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <Badge tone="default" className="tracking-[0.16em]">ENTITY</Badge>
          <EntityTypeBadge value={entity.entityType} />
        </div>
        <h2 className="mt-4 text-[1.35rem] font-semibold tracking-tight text-[var(--text-primary)]">{entity.title}</h2>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{entity.shortDescription}</p>
        <p className="mt-4 text-sm font-medium text-[var(--text-primary)]">Includes normal flow, common risks, and related public reports.</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
          <span>{formatEnum(entity.status)}</span>
          <span>{entity._count?.reports ?? 0} linked reports</span>
        </div>
      </Card>
    </Link>
  );
}

function SignalFeedCard({ signal }: { signal: (typeof patternCards)[number] }) {
  return (
    <Link href={signal.href} className="block">
      <Card className="group rounded-[1.8rem] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <Badge tone="default" className="tracking-[0.16em]">{signal.label}</Badge>
        </div>
        <h2 className="mt-4 text-[1.35rem] font-semibold tracking-tight text-[var(--text-primary)]">{signal.title}</h2>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-secondary)]">{signal.summary}</p>
        <p className="mt-4 text-sm font-medium text-[var(--text-primary)]">{signal.context}</p>
        <div className="mt-4 text-sm text-[var(--text-muted)]">Open the archive to read linked cases and compare details.</div>
      </Card>
    </Link>
  );
}

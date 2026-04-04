"use client";

import Link from "next/link";
import { Badge, EntityTypeBadge, SeverityBadge, formatDate, formatEnum } from "@todo/ui";
import { entityTypes, type EntitySummary, type ReportSummary } from "@todo/types";
import { useEntities } from "@/features/entities";
import { useReports } from "@/features/reports";

const severityRank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
const entityPageSize = 8;
const reportPreviewPageSize = 40;

export function PublicHomePage({ q, type }: { q: string; type: string }) {
  const activeType = entityTypes.includes(type as (typeof entityTypes)[number]) ? type : "";

  const entities = useEntities({
    status: "PUBLISHED",
    visibility: "PUBLIC",
    q,
    ...(activeType ? { type: activeType } : {}),
    page: "1",
    pageSize: String(entityPageSize)
  });
  const reports = useReports({
    moderationState: "APPROVED",
    q,
    page: "1",
    pageSize: String(reportPreviewPageSize)
  });

  const entityItems = entities.data?.items ?? [];
  const reportItems = reports.data?.items ?? [];
  const feedItems = buildEntityFeed(entityItems, reportItems);
  const hasResults = feedItems.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="space-y-5">
        <div className="space-y-3">
          <Badge tone="theme" className="rounded-none border-0 bg-transparent px-0 py-0 tracking-[0.2em] text-[var(--theme-700)]">
            PUBLIC FEED
          </Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2.2rem]">
              What to look at right now
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
              The feed stays entity-first. Filters now run through real URL state, so the dock can refine this page without falling back to placeholder UI.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("todo:open-public-dock", { detail: { tool: "search" } }))}
            className="font-medium text-[var(--text-primary)] transition hover:text-[var(--theme-700)]"
          >
            Open search
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("todo:open-public-dock", { detail: { tool: "filter" } }))}
            className="font-medium text-[var(--text-primary)] transition hover:text-[var(--theme-700)]"
          >
            Open filter
          </button>
          <Link
            href="/reports"
            className="font-medium text-[var(--text-primary)] transition hover:text-[var(--theme-700)]"
          >
            Open reports archive
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {q ? <Badge>Query: {q}</Badge> : null}
          {activeType ? <Badge tone="theme">Type: {formatEnum(activeType)}</Badge> : null}
          {!q && !activeType ? <Badge>No feed filter applied</Badge> : null}
        </div>

        {q || activeType ? (
          <p className="text-sm text-[var(--text-secondary)]">
            Feed results stay grounded in the current URL filters. Use the bottom dock to change scope, refine entity type, or move into report-specific filtering.
          </p>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">
            Discovery stays lightweight here. Use the bottom dock for Search, Filter, and Ask AI, then go deeper on each entity page.
          </p>
        )}
      </section>

      <section className="space-y-4 pb-4">
        {feedItems.map((item, index) => (
          <div key={item.entity.id} className="space-y-4">
            {index > 0 ? <Divider /> : null}
            <EntityFeedCard item={item} />
          </div>
        ))}

        {!entities.isLoading && !reports.isLoading && !hasResults ? (
          <div className="space-y-4">
            <Divider />
            <div className="space-y-3 py-1">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">No entities match this filter set yet.</h2>
              <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                Try a broader search, clear the current entity type filter, or open the reports archive for a report-first read.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <Link href="/" className="font-medium text-[var(--theme-700)] transition hover:opacity-80">
                  Clear filters
                </Link>
                <button
                  type="button"
                  className="font-medium text-[var(--theme-700)] transition hover:opacity-80"
                  onClick={() => window.dispatchEvent(new CustomEvent("todo:open-public-dock", { detail: { tool: "filter" } }))}
                >
                  Refine in dock
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

type EntityFeedItem = {
  entity: EntitySummary;
  relatedReports: ReportSummary[];
  latestReport?: ReportSummary;
  highestSeverity?: ReportSummary["severityLevel"];
};

function buildEntityFeed(entities: EntitySummary[], reports: ReportSummary[]): EntityFeedItem[] {
  const reportsByEntityId = new Map<string, ReportSummary[]>();

  for (const report of reports) {
    const list = reportsByEntityId.get(report.entityId) ?? [];
    list.push(report);
    reportsByEntityId.set(report.entityId, list);
  }

  return entities.map((entity) => {
    const relatedReports = [...(reportsByEntityId.get(entity.id) ?? [])].sort(compareReports);
    const latestReport = [...relatedReports].sort(compareNewest)[0];
    const highestSeverity = relatedReports[0]?.severityLevel;

    return {
      entity,
      relatedReports,
      latestReport,
      highestSeverity
    };
  });
}

function EntityFeedCard({ item }: { item: EntityFeedItem }) {
  const linkedReportCount = item.entity._count?.reports ?? 0;
  const latestReportDate = item.latestReport?.happenedAt ?? item.latestReport?.reportedAt ?? item.entity.updatedAt;

  return (
    <article className="grid gap-6 py-2 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-8">
      <div className="min-w-0 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="default" className="tracking-[0.16em]">ENTITY</Badge>
          <EntityTypeBadge value={item.entity.entityType} />
          {item.highestSeverity ? <SeverityBadge value={item.highestSeverity} /> : <Badge tone="default">No approved reports</Badge>}
        </div>

        <div className="space-y-2">
          <h2 className="text-[1.45rem] font-semibold tracking-tight text-[var(--text-primary)]">
            {item.entity.title}
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-[0.95rem]">
            {item.entity.shortDescription}
          </p>
        </div>

        <div className="grid gap-4 text-sm sm:grid-cols-3 sm:gap-6">
          <Fact label="Linked reports" value={String(linkedReportCount)} detail="Across this entity record." />
          <Fact
            label="Risk snapshot"
            value={item.highestSeverity ? formatRiskCopy(item.highestSeverity) : "No public signal yet"}
            detail={item.highestSeverity ? "Derived from approved report severity." : "No approved reports surfaced in the current feed preview."}
          />
          <Fact label="Last updated" value={formatDate(item.entity.updatedAt)} detail="Entity record freshness." />
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href={`/entities/${item.entity.slug}`} className="font-medium text-[var(--theme-700)] transition hover:opacity-80">
            Open entity
          </Link>
          <span className="text-[var(--text-muted)]">Feed preview stays shallow by design.</span>
        </div>
      </div>

      <aside className="space-y-2 lg:pt-0.5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Latest approved report</p>
        {item.latestReport ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge value={item.latestReport.severityLevel} />
              <span className="text-xs text-[var(--text-muted)]">{formatDate(latestReportDate)}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{item.latestReport.title}</p>
              <p className="mt-2 line-clamp-4 text-sm leading-6 text-[var(--text-secondary)]">
                {item.latestReport.narrative}
              </p>
            </div>
            <Link href={`/reports/${item.latestReport.id}`} className="inline-flex text-sm font-medium text-[var(--theme-700)] transition hover:opacity-80">
              Read report
            </Link>
          </div>
        ) : (
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            No approved report preview is available for this entity yet. Open the entity page for structured context and future additions.
          </p>
        )}
      </aside>
    </article>
  );
}

function Fact({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <p className="text-sm font-semibold text-[var(--text-primary)]">{value}</p>
      <p className="text-xs leading-5 text-[var(--text-secondary)]">{detail}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(47,91,234,0.22),transparent)]" />;
}

function compareReports(a: ReportSummary, b: ReportSummary) {
  const severityDelta = (severityRank[b.severityLevel] ?? 0) - (severityRank[a.severityLevel] ?? 0);
  if (severityDelta !== 0) return severityDelta;
  return compareNewest(a, b);
}

function compareNewest(a: ReportSummary, b: ReportSummary) {
  return new Date(b.happenedAt ?? b.reportedAt ?? 0).getTime() - new Date(a.happenedAt ?? a.reportedAt ?? 0).getTime();
}

function formatRiskCopy(value: ReportSummary["severityLevel"]) {
  switch (value) {
    case "CRITICAL":
      return "Critical public risk";
    case "HIGH":
      return "High public risk";
    case "MEDIUM":
      return "Moderate public risk";
    default:
      return "Low public risk";
  }
}

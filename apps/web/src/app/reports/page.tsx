"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge, Button, Card, Input, ModerationBadge, Select, SeverityBadge, VerificationBadge, formatDate, formatEnum } from "@todo/ui";
import { useEntities } from "@/features/entities";
import { type ReportSummary, useReports } from "@/features/reports";
import { reportTypes, severityLevels, verificationStates } from "@todo/types";

const severityRank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
const verificationRank: Record<string, number> = { VERIFIED: 3, PARTIALLY_VERIFIED: 2, UNVERIFIED: 1, REJECTED: 0 };
const defaultFilters = { q: "", entityId: "", reportType: "", severityLevel: "", verificationState: "", sort: "signal" };

export default function ReportsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(defaultFilters);
  const [draftQuery, setDraftQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const reports = useReports({
    entityId: filters.entityId,
    reportType: filters.reportType,
    severityLevel: filters.severityLevel,
    verificationState: filters.verificationState,
    moderationState: "APPROVED",
    q: filters.q,
    page: "1",
    pageSize: "100"
  });
  const entities = useEntities({ status: "PUBLISHED", visibility: "PUBLIC", page: "1", pageSize: "100" });
  const reportItems = reports.data?.items ?? [];
  const entityItems = entities.data?.items ?? [];

  const activeFilters = summarizeFilters(filters, entityItems);
  const hasAdvancedFilters = Boolean(filters.entityId || filters.reportType || filters.severityLevel || filters.verificationState || filters.sort !== "signal");

  useEffect(() => {
    const nextFilters = readFiltersFromSearchParams(searchParams);
    setFilters(nextFilters);
    setDraftQuery(nextFilters.q);
  }, [searchParams]);

  const visibleReports = useMemo(() => {
    return [...reportItems].sort((a, b) => sortReports(a, b, filters.sort));
  }, [filters.sort, reportItems]);

  function applyUrlFilters(nextFilters: typeof defaultFilters) {
    const params = buildReportSearchParams(nextFilters);
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl);
  }

  function applySearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyUrlFilters({ ...filters, q: draftQuery.trim() });
  }

  return (
    <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="space-y-3">
        <form onSubmit={applySearch} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Input
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="Search reports, entities, or situations"
            className="h-14 rounded-full px-5 text-base"
          />
          <Button type="submit" variant="primary" className="h-14 rounded-full px-6 text-sm font-semibold">
            Search
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-14 rounded-full px-6 text-sm font-semibold"
            onClick={() => setFiltersOpen((value) => !value)}
          >
            {filtersOpen || hasAdvancedFilters ? "Hide filters" : "Filters"}
          </Button>
        </form>

        {(filtersOpen || hasAdvancedFilters) ? (
          <Card className="rounded-[1.75rem] p-4 sm:p-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <Select value={filters.entityId} onChange={(e) => setFilters((v) => ({ ...v, entityId: e.target.value }))} className="rounded-full bg-[var(--bg-surface-muted)] px-5 shadow-none">
                <option value="">All entities</option>
                {entityItems.map((entity) => <option key={entity.id} value={entity.id}>{entity.title}</option>)}
              </Select>
              <Select value={filters.severityLevel} onChange={(e) => setFilters((v) => ({ ...v, severityLevel: e.target.value }))} className="rounded-full bg-[var(--bg-surface-muted)] px-5 shadow-none">
                <option value="">All severity</option>
                {severityLevels.map((value) => <option key={value} value={value}>{formatEnum(value)}</option>)}
              </Select>
              <Select value={filters.verificationState} onChange={(e) => setFilters((v) => ({ ...v, verificationState: e.target.value }))} className="rounded-full bg-[var(--bg-surface-muted)] px-5 shadow-none">
                <option value="">All verification</option>
                {verificationStates.map((value) => <option key={value} value={value}>{formatEnum(value)}</option>)}
              </Select>
              <Select value={filters.reportType} onChange={(e) => setFilters((v) => ({ ...v, reportType: e.target.value }))} className="rounded-full bg-[var(--bg-surface-muted)] px-5 shadow-none">
                <option value="">All report types</option>
                {reportTypes.map((value) => <option key={value} value={value}>{formatEnum(value)}</option>)}
              </Select>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((item) => <Badge key={item}>{item}</Badge>)}
                {activeFilters.length === 0 ? <Badge>No extra filters applied</Badge> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <Select value={filters.sort} onChange={(e) => setFilters((v) => ({ ...v, sort: e.target.value }))} className="rounded-full bg-[var(--bg-surface-muted)] px-5 shadow-none sm:w-52">
                  <option value="signal">Sort by signal</option>
                  <option value="newest">Sort by newest</option>
                  <option value="verification">Sort by verification</option>
                </Select>
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-full px-4 text-sm font-semibold"
                  onClick={() => applyUrlFilters(filters)}
                >
                  Apply filters
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-full px-4 text-[var(--text-secondary)]"
                  onClick={() => {
                    const cleared = { ...defaultFilters, q: filters.q };
                    setFilters(cleared);
                    applyUrlFilters(cleared);
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        <div className="px-1 text-sm text-[var(--text-secondary)]">
          Approved reports from the public archive. Filters now map to real URL state, so the dock and this page stay aligned.
        </div>
      </section>

      <div className="space-y-4 pb-4">
        {visibleReports.map((report) => <ReportArchiveCard key={report.id} report={report} />)}
        {!reports.isLoading && visibleReports.length === 0 ? (
          <Card className="rounded-[1.75rem] p-5 text-sm text-[var(--text-secondary)]">
            No approved reports match these filters.
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function ReportArchiveCard({ report }: { report: ReportSummary }) {
  return (
    <Link href={`/reports/${report.id}`} className="block">
      <Card className="rounded-[1.8rem] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="default" className="tracking-[0.16em]">REPORT</Badge>
          <SeverityBadge value={report.severityLevel} />
          <VerificationBadge value={report.verificationState} />
          <ModerationBadge value={report.moderationState} />
        </div>
        <h2 className="mt-4 text-[1.35rem] font-semibold tracking-tight">{report.title}</h2>
        {report.entity ? <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">Related: {report.entity.title}</p> : null}
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--text-secondary)]">{report.narrative}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
          <span>{formatEnum(report.reportType)}</span>
          <span>{formatDate(report.happenedAt ?? report.reportedAt)}</span>
        </div>
      </Card>
    </Link>
  );
}

function sortReports(a: ReportSummary, b: ReportSummary, sort: string) {
  if (sort === "newest") {
    return new Date(b.reportedAt ?? 0).getTime() - new Date(a.reportedAt ?? 0).getTime();
  }

  if (sort === "verification") {
    const verificationDelta = (verificationRank[b.verificationState] ?? 0) - (verificationRank[a.verificationState] ?? 0);
    if (verificationDelta !== 0) return verificationDelta;
  }

  const severityDelta = (severityRank[b.severityLevel] ?? 0) - (severityRank[a.severityLevel] ?? 0);
  if (severityDelta !== 0) return severityDelta;
  return new Date(b.reportedAt ?? 0).getTime() - new Date(a.reportedAt ?? 0).getTime();
}

function summarizeFilters(
  filters: { q: string; entityId: string; reportType: string; severityLevel: string; verificationState: string; sort: string },
  entities: { id: string; title: string }[]
) {
  const entity = entities.find((item) => item.id === filters.entityId);

  return [
    filters.q && `Query: ${filters.q}`,
    entity && `Entity: ${entity.title}`,
    filters.reportType && formatEnum(filters.reportType),
    filters.severityLevel && formatEnum(filters.severityLevel),
    filters.verificationState && formatEnum(filters.verificationState),
    filters.sort !== "signal" && `Sort: ${formatEnum(filters.sort)}`
  ].filter(Boolean) as string[];
}

function readFiltersFromSearchParams(searchParams: ReturnType<typeof useSearchParams>) {
  return {
    q: searchParams.get("q") ?? "",
    entityId: searchParams.get("entityId") ?? "",
    reportType: searchParams.get("reportType") ?? "",
    severityLevel: searchParams.get("severityLevel") ?? "",
    verificationState: searchParams.get("verificationState") ?? "",
    sort: searchParams.get("sort") ?? "signal"
  };
}

function buildReportSearchParams(filters: typeof defaultFilters) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.entityId) params.set("entityId", filters.entityId);
  if (filters.reportType) params.set("reportType", filters.reportType);
  if (filters.severityLevel) params.set("severityLevel", filters.severityLevel);
  if (filters.verificationState) params.set("verificationState", filters.verificationState);
  if (filters.sort && filters.sort !== "signal") params.set("sort", filters.sort);

  return params;
}

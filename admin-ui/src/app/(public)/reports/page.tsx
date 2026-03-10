"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ModerationBadge, SeverityBadge, VerificationBadge } from "@/components/status/badges";
import { useEntities } from "@/features/entities";
import { useReports } from "@/features/reports";
import { reportTypes, severityLevels, verificationStates } from "@/lib/data/enums";
import { formatDate, formatEnum } from "@/lib/utils/format";

export default function ReportsPage() {
  const [filters, setFilters] = useState({ q: "", entityId: "", reportType: "", severityLevel: "", verificationState: "" });
  const reports = useReports({ entityId: filters.entityId, reportType: filters.reportType, verificationState: filters.verificationState });
  const entities = useEntities({ status: "PUBLISHED", visibility: "PUBLIC" });
  const visibleReports = (reports.data ?? []).filter((report) => {
    const query = filters.q.trim().toLowerCase();
    const matchesQuery = !query || report.title.toLowerCase().includes(query) || report.narrative.toLowerCase().includes(query) || report.entity?.title.toLowerCase().includes(query);
    const matchesSeverity = !filters.severityLevel || report.severityLevel === filters.severityLevel;
    return matchesQuery && matchesSeverity;
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-2 max-w-3xl text-[var(--text-secondary)]">Browse structured experiences. Verification and moderation states are shown separately so claims do not get mistaken for canonical facts.</p>
      </section>
      <Card className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-5">
        <Input placeholder="Search reports" value={filters.q} onChange={(e) => setFilters((v) => ({ ...v, q: e.target.value }))} />
        <Select value={filters.entityId} onChange={(e) => setFilters((v) => ({ ...v, entityId: e.target.value }))}>
          <option value="">All entities</option>
          {(entities.data ?? []).map((entity) => <option key={entity.id} value={entity.id}>{entity.title}</option>)}
        </Select>
        <Select value={filters.reportType} onChange={(e) => setFilters((v) => ({ ...v, reportType: e.target.value }))}>
          <option value="">All report types</option>
          {reportTypes.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}
        </Select>
        <Select value={filters.severityLevel} onChange={(e) => setFilters((v) => ({ ...v, severityLevel: e.target.value }))}>
          <option value="">All severity</option>
          {severityLevels.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}
        </Select>
        <Select value={filters.verificationState} onChange={(e) => setFilters((v) => ({ ...v, verificationState: e.target.value }))}>
          <option value="">All verification</option>
          {verificationStates.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}
        </Select>
      </Card>
      <div className="space-y-3 pb-8">
        {visibleReports.map((report) => (
          <Card key={report.id} className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{report.title}</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{report.entity?.title}</p>
                <p className="mt-3 line-clamp-3 text-sm text-[var(--text-secondary)]">{report.narrative}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <SeverityBadge value={report.severityLevel} />
                <VerificationBadge value={report.verificationState} />
                <ModerationBadge value={report.moderationState} />
              </div>
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">{formatDate(report.reportedAt)}</p>
          </Card>
        ))}
        {!reports.isLoading && visibleReports.length === 0 ? <Card className="p-6 text-sm text-[var(--text-secondary)]">No reports match the current filters.</Card> : null}
      </div>
    </div>
  );
}

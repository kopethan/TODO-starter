"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ModerationBadge, SeverityBadge, VerificationBadge } from "@/components/status/badges";
import { useEntities } from "@/features/entities";
import { useReports } from "@/features/reports";
import { moderationStates, reportTypes, verificationStates } from "@/lib/data/enums";
import { formatDate, formatEnum } from "@/lib/utils/format";

export default function AdminReportsPage() {
  const [filters, setFilters] = useState({ q: "", entityId: "", reportType: "", moderationState: "", verificationState: "" });
  const reports = useReports({ entityId: filters.entityId, reportType: filters.reportType, moderationState: filters.moderationState, verificationState: filters.verificationState });
  const entities = useEntities({});
  const visible = (reports.data ?? []).filter((report) => {
    const q = filters.q.trim().toLowerCase();
    return !q || report.title.toLowerCase().includes(q) || report.narrative.toLowerCase().includes(q) || report.entity?.title.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader title="Reports" subtitle="Review submitted experiences and moderation state." />
      <Card className="mb-5 grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-5">
        <Input placeholder="Search reports" value={filters.q} onChange={(e) => setFilters((v) => ({ ...v, q: e.target.value }))} />
        <Select value={filters.entityId} onChange={(e) => setFilters((v) => ({ ...v, entityId: e.target.value }))}><option value="">All entities</option>{(entities.data ?? []).map((entity) => <option key={entity.id} value={entity.id}>{entity.title}</option>)}</Select>
        <Select value={filters.reportType} onChange={(e) => setFilters((v) => ({ ...v, reportType: e.target.value }))}><option value="">All report types</option>{reportTypes.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}</Select>
        <Select value={filters.verificationState} onChange={(e) => setFilters((v) => ({ ...v, verificationState: e.target.value }))}><option value="">All verification</option>{verificationStates.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}</Select>
        <Select value={filters.moderationState} onChange={(e) => setFilters((v) => ({ ...v, moderationState: e.target.value }))}><option value="">All moderation</option>{moderationStates.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}</Select>
      </Card>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--border-default)] text-sm">
            <thead className="bg-[var(--bg-surface-muted)] text-left text-[var(--text-secondary)]"><tr><th className="px-4 py-3 font-medium">Title</th><th className="px-4 py-3 font-medium">Entity</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Severity</th><th className="px-4 py-3 font-medium">Verification</th><th className="px-4 py-3 font-medium">Moderation</th><th className="px-4 py-3 font-medium">Reported</th></tr></thead>
            <tbody className="divide-y divide-[var(--border-default)]">{visible.map((report) => <tr key={report.id} className="hover:bg-[var(--bg-surface-muted)]"><td className="px-4 py-3"><Link href={`/admin/reports/${report.id}`} className="font-medium hover:underline">{report.title}</Link><p className="mt-1 max-w-md text-xs text-[var(--text-secondary)]">{report.narrative}</p></td><td className="px-4 py-3 text-[var(--text-secondary)]">{report.entity?.title}</td><td className="px-4 py-3 text-[var(--text-secondary)]">{formatEnum(report.reportType)}</td><td className="px-4 py-3"><SeverityBadge value={report.severityLevel} /></td><td className="px-4 py-3"><VerificationBadge value={report.verificationState} /></td><td className="px-4 py-3"><ModerationBadge value={report.moderationState} /></td><td className="px-4 py-3 text-[var(--text-secondary)]">{formatDate(report.reportedAt)}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  Input,
  ModerationBadge,
  PageHeader,
  Select,
  SeverityBadge,
  VerificationBadge,
  formatDate,
  formatEnum
} from "@todo/ui";
import { moderationStates, reportTypes, verificationStates } from "@todo/types";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatGrid } from "@/components/shared/stat-grid";
import { useEntities } from "@/features/entities";
import { useReports } from "@/features/reports";
import { hasActiveFilters, parsePositiveInteger, toSearchString } from "@/lib/search-params";

export default function AdminReportsPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [filters, setFilters] = useState({
    q: searchParams.get("q") ?? "",
    entityId: searchParams.get("entityId") ?? "",
    reportType: searchParams.get("reportType") ?? "",
    moderationState: searchParams.get("moderationState") ?? "",
    verificationState: searchParams.get("verificationState") ?? "",
    page: String(parsePositiveInteger(searchParams.get("page"), 1)),
    pageSize: String(parsePositiveInteger(searchParams.get("pageSize"), 10))
  });

  useEffect(() => {
    const next = toSearchString(filters);
    if (next !== searchParams.toString()) {
      router.replace(next ? `${pathname}?${next}` : pathname);
    }
  }, [filters, pathname, router, searchParams]);

  const reports = useReports(filters);
  const entities = useEntities({ page: "1", pageSize: "100" });
  const visible = useMemo(() => reports.data?.items ?? [], [reports.data]);
  const page = reports.data?.page ?? Number(filters.page);
  const pageSize = reports.data?.pageSize ?? Number(filters.pageSize);
  const totalItems = reports.data?.totalItems ?? 0;
  const totalPages = reports.data?.totalPages ?? 1;

  const updateFilter = (
    key: "q" | "entityId" | "reportType" | "moderationState" | "verificationState",
    value: string
  ) => {
    setFilters((current) => ({ ...current, [key]: value, page: "1" }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Review submitted experiences and update verification or moderation states."
        actions={
          <Link href="/reports/queue">
            <Button variant="secondary">Moderation queue</Button>
          </Link>
        }
      />

      <StatGrid
        items={[
          { label: "Matching reports", value: String(totalItems), hint: "Across all pages." },
          { label: "Shown on page", value: String(visible.length), hint: `Page ${page} of ${totalPages}.` },
          {
            label: "Pending on page",
            value: String(visible.filter((report) => report.moderationState === "PENDING").length),
            hint: "Current slice only."
          },
          {
            label: "Verified on page",
            value: String(visible.filter((report) => report.verificationState === "VERIFIED").length),
            hint: "Current slice only."
          }
        ]}
      />

      <Card className="grid gap-4 border border-[var(--border-default)] p-4 md:grid-cols-2 xl:grid-cols-5">
        <Input placeholder="Search reports" value={filters.q} onChange={(event) => updateFilter("q", event.target.value)} />
        <Select value={filters.entityId} onChange={(event) => updateFilter("entityId", event.target.value)}>
          <option value="">All entities</option>
          {(entities.data?.items ?? []).map((entity) => (
            <option key={entity.id} value={entity.id}>
              {entity.title}
            </option>
          ))}
        </Select>
        <Select value={filters.reportType} onChange={(event) => updateFilter("reportType", event.target.value)}>
          <option value="">All report types</option>
          {reportTypes.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
        <Select value={filters.verificationState} onChange={(event) => updateFilter("verificationState", event.target.value)}>
          <option value="">All verification</option>
          {verificationStates.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
        <Select value={filters.moderationState} onChange={(event) => updateFilter("moderationState", event.target.value)}>
          <option value="">All moderation</option>
          {moderationStates.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
        {hasActiveFilters({
          q: filters.q,
          entityId: filters.entityId,
          reportType: filters.reportType,
          moderationState: filters.moderationState,
          verificationState: filters.verificationState
        }) ? (
          <div className="md:col-span-2 xl:col-span-5">
            <Button
              variant="ghost"
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  q: "",
                  entityId: "",
                  reportType: "",
                  moderationState: "",
                  verificationState: "",
                  page: "1"
                }))
              }
            >
              Clear filters
            </Button>
          </div>
        ) : null}
      </Card>

      {visible.length === 0 ? (
        <EmptyState title="No reports found" description="Try removing one of the filters or broaden the free-text search." />
      ) : (
        <>
          <Card className="overflow-hidden border border-[var(--border-default)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border-default)] text-sm">
                <thead className="bg-[var(--bg-surface-muted)] text-left text-[var(--text-secondary)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Entity</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Severity</th>
                    <th className="px-4 py-3 font-medium">Verification</th>
                    <th className="px-4 py-3 font-medium">Moderation</th>
                    <th className="px-4 py-3 font-medium">Reported</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {visible.map((report) => (
                    <tr key={report.id} className="hover:bg-[var(--bg-surface-muted)]">
                      <td className="px-4 py-3 align-top">
                        <Link href={`/reports/${report.id}`} className="font-medium hover:underline">
                          {report.title}
                        </Link>
                        <p className="mt-1 max-w-md text-xs text-[var(--text-secondary)]">{report.narrative}</p>
                      </td>
                      <td className="px-4 py-3 align-top text-[var(--text-secondary)]">{report.entity?.title}</td>
                      <td className="px-4 py-3 align-top text-[var(--text-secondary)]">{formatEnum(report.reportType)}</td>
                      <td className="px-4 py-3 align-top">
                        <SeverityBadge value={report.severityLevel} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <VerificationBadge value={report.verificationState} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <ModerationBadge value={report.moderationState} />
                      </td>
                      <td className="px-4 py-3 align-top text-[var(--text-secondary)]">{formatDate(report.reportedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <PaginationControls
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            currentCount={visible.length}
            itemLabel="reports"
            onPageChange={(nextPage) => setFilters((current) => ({ ...current, page: String(nextPage) }))}
            onPageSizeChange={(nextPageSize) =>
              setFilters((current) => ({
                ...current,
                page: "1",
                pageSize: String(nextPageSize)
              }))
            }
          />
        </>
      )}
    </div>
  );
}

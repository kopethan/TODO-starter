"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Card, Input, PageHeader, Select, formatEnum } from "@todo/ui";
import { verificationStates } from "@todo/types";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatGrid } from "@/components/shared/stat-grid";
import { useToast } from "@/components/shared/toast-provider";
import { useEntities } from "@/features/entities";
import { BulkModerationActions } from "@/features/reports/bulk-actions-bar";
import { QueueReportCard } from "@/features/reports/queue-card";
import { useBulkUpdateReports, useReports } from "@/features/reports";
import { hasActiveFilters, parsePositiveInteger, toSearchString } from "@/lib/search-params";

const queueViews = [
  { value: "PENDING", label: "Pending" },
  { value: "FLAGGED", label: "Flagged" }
] as const;

export default function ModerationQueuePage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { pushToast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    queue: searchParams.get("queue") || "PENDING",
    q: searchParams.get("q") || "",
    entityId: searchParams.get("entityId") || "",
    verificationState: searchParams.get("verificationState") || "",
    page: String(parsePositiveInteger(searchParams.get("page"), 1)),
    pageSize: String(parsePositiveInteger(searchParams.get("pageSize"), 10))
  });

  useEffect(() => {
    const next = toSearchString(filters);
    if (next !== searchParams.toString()) {
      router.replace(next ? `${pathname}?${next}` : pathname);
    }
  }, [filters, pathname, router, searchParams]);

  const entities = useEntities({ page: "1", pageSize: "100" });
  const queueReports = useReports({
    moderationState: filters.queue,
    q: filters.q,
    entityId: filters.entityId,
    verificationState: filters.verificationState,
    page: filters.page,
    pageSize: filters.pageSize
  });
  const pendingReports = useReports({ moderationState: "PENDING", page: "1", pageSize: "1" });
  const flaggedReports = useReports({ moderationState: "FLAGGED", page: "1", pageSize: "1" });
  const bulkUpdateReports = useBulkUpdateReports();

  const visibleReports = useMemo(() => queueReports.data?.items ?? [], [queueReports.data]);
  const visibleIds = useMemo(() => visibleReports.map((report) => report.id), [visibleReports]);
  const page = queueReports.data?.page ?? Number(filters.page);
  const pageSize = queueReports.data?.pageSize ?? Number(filters.pageSize);
  const totalItems = queueReports.data?.totalItems ?? 0;
  const totalPages = queueReports.data?.totalPages ?? 1;

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => visibleIds.includes(id)));
  }, [visibleIds]);

  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => !["queue", "page", "pageSize"].includes(key) && value.trim()).length;

  const updateFilter = (key: "queue" | "q" | "entityId" | "verificationState", value: string) => {
    setSelectedIds([]);
    setFilters((current) => ({ ...current, [key]: value, page: "1" }));
  };

  const toggleReportSelection = (reportId: string, checked: boolean) => {
    setSelectedIds((current) => {
      if (checked) {
        return current.includes(reportId) ? current : [...current, reportId];
      }
      return current.filter((id) => id !== reportId);
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id));
      }
      return Array.from(new Set([...current, ...visibleIds]));
    });
  };

  async function applyBulkUpdate(
    payload: { moderationState?: "APPROVED" | "FLAGGED" | "REJECTED"; verificationState?: "VERIFIED" | "UNVERIFIED" },
    successLabel: string
  ) {
    if (selectedIds.length === 0) return;

    try {
      const result = await bulkUpdateReports.mutateAsync({
        reportIds: selectedIds,
        ...payload
      });

      setSelectedIds([]);

      pushToast({
        tone: "success",
        title: successLabel,
        description:
          result.missingIds.length > 0
            ? `${result.updatedCount} reports updated. ${result.missingIds.length} could not be found anymore.`
            : `${result.updatedCount} reports updated successfully.`
      });
    } catch (error) {
      pushToast({
        tone: "danger",
        title: "Bulk update failed",
        description: error instanceof Error ? error.message : "The selected reports could not be updated."
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moderation queue"
        subtitle="Review the reports that still need a decision, then move them out of the queue quickly."
        actions={
          <>
            <Link href="/reports">
              <Button variant="secondary">All reports</Button>
            </Link>
          </>
        }
      />

      <StatGrid
        items={[
          {
            label: "Pending",
            value: String(pendingReports.data?.totalItems ?? 0),
            hint: "Awaiting first moderation decision."
          },
          {
            label: "Flagged",
            value: String(flaggedReports.data?.totalItems ?? 0),
            hint: "Needs closer review before approval or rejection."
          },
          {
            label: "Visible now",
            value: String(visibleReports.length),
            hint: `Page ${page} of ${totalPages}.`
          },
          {
            label: "Selected",
            value: String(selectedIds.length),
            hint: selectedIds.length ? "Ready for bulk action." : "Use checkboxes to review in batches."
          }
        ]}
      />

      <Card className="grid gap-4 border border-[var(--border-default)] p-4 md:grid-cols-2 xl:grid-cols-4">
        <Select value={filters.queue} onChange={(event) => updateFilter("queue", event.target.value)}>
          {queueViews.map((view) => (
            <option key={view.value} value={view.value}>
              {view.label} queue
            </option>
          ))}
        </Select>
        <Input placeholder="Search within this queue" value={filters.q} onChange={(event) => updateFilter("q", event.target.value)} />
        <Select value={filters.entityId} onChange={(event) => updateFilter("entityId", event.target.value)}>
          <option value="">All entities</option>
          {(entities.data?.items ?? []).map((entity) => (
            <option key={entity.id} value={entity.id}>
              {entity.title}
            </option>
          ))}
        </Select>
        <Select value={filters.verificationState} onChange={(event) => updateFilter("verificationState", event.target.value)}>
          <option value="">All verification states</option>
          {verificationStates.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
        {hasActiveFilters({ q: filters.q, entityId: filters.entityId, verificationState: filters.verificationState }) ? (
          <div className="md:col-span-2 xl:col-span-4">
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedIds([]);
                setFilters((current) => ({
                  ...current,
                  q: "",
                  entityId: "",
                  verificationState: "",
                  page: "1"
                }));
              }}
            >
              Clear extra filters
            </Button>
          </div>
        ) : null}
      </Card>

      <BulkModerationActions
        selectedCount={selectedIds.length}
        visibleCount={visibleReports.length}
        allVisibleSelected={allVisibleSelected}
        loading={bulkUpdateReports.isPending}
        onToggleSelectAll={toggleSelectAllVisible}
        onClearSelection={() => setSelectedIds([])}
        onApprove={() => applyBulkUpdate({ moderationState: "APPROVED" }, "Reports approved")}
        onFlag={() => applyBulkUpdate({ moderationState: "FLAGGED" }, "Reports flagged")}
        onReject={() => applyBulkUpdate({ moderationState: "REJECTED" }, "Reports rejected")}
        onMarkVerified={() => applyBulkUpdate({ verificationState: "VERIFIED" }, "Reports marked verified")}
        onMarkUnverified={() => applyBulkUpdate({ verificationState: "UNVERIFIED" }, "Reports marked unverified")}
      />

      {queueReports.isLoading ? (
        <p className="text-sm text-[var(--text-secondary)]">Loading moderation queue…</p>
      ) : visibleReports.length === 0 ? (
        <EmptyState
          title={`No ${filters.queue === "PENDING" ? "pending" : "flagged"} reports found`}
          description="Try removing a filter or switch queue views to continue moderation."
        />
      ) : (
        <>
          <div className="space-y-4">
            {visibleReports.map((report) => (
              <QueueReportCard
                key={report.id}
                report={report}
                selected={selectedIds.includes(report.id)}
                onSelectedChange={(checked) => toggleReportSelection(report.id, checked)}
              />
            ))}
          </div>

          <PaginationControls
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            currentCount={visibleReports.length}
            itemLabel="reports"
            onPageChange={(nextPage) => {
              setSelectedIds([]);
              setFilters((current) => ({ ...current, page: String(nextPage) }));
            }}
            onPageSizeChange={(nextPageSize) => {
              setSelectedIds([]);
              setFilters((current) => ({
                ...current,
                page: "1",
                pageSize: String(nextPageSize)
              }));
            }}
          />
        </>
      )}
    </div>
  );
}

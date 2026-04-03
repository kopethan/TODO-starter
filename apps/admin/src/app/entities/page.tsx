"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Button,
  Card,
  EntityStatusBadge,
  EntityTypeBadge,
  Input,
  PageHeader,
  Select,
  VisibilityBadge,
  formatDate,
  formatEnum
} from "@todo/ui";
import { entityStatuses, entityTypes, visibilityOptions } from "@todo/types";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatGrid } from "@/components/shared/stat-grid";
import { useEntities } from "@/features/entities";
import { hasActiveFilters, parsePositiveInteger, toSearchString } from "@/lib/search-params";

export default function AdminEntitiesPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [filters, setFilters] = useState({
    q: searchParams.get("q") ?? "",
    type: searchParams.get("type") ?? "",
    status: searchParams.get("status") ?? "",
    visibility: searchParams.get("visibility") ?? "",
    page: String(parsePositiveInteger(searchParams.get("page"), 1)),
    pageSize: String(parsePositiveInteger(searchParams.get("pageSize"), 10))
  });

  useEffect(() => {
    const next = toSearchString(filters);
    if (next !== searchParams.toString()) {
      router.replace(next ? `${pathname}?${next}` : pathname);
    }
  }, [filters, pathname, router, searchParams]);

  const entities = useEntities(filters);
  const visible = useMemo(() => entities.data?.items ?? [], [entities.data]);
  const page = entities.data?.page ?? Number(filters.page);
  const pageSize = entities.data?.pageSize ?? Number(filters.pageSize);
  const totalItems = entities.data?.totalItems ?? 0;
  const totalPages = entities.data?.totalPages ?? 1;

  const updateFilter = (key: "q" | "type" | "status" | "visibility", value: string) => {
    setFilters((current) => ({ ...current, [key]: value, page: "1" }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entities"
        subtitle="Manage canonical objects, services, situations, and trust-oriented explanatory content."
        actions={
          <Link href="/entities/new">
            <Button variant="primary">New entity</Button>
          </Link>
        }
      />

      <StatGrid
        items={[
          { label: "Matching entities", value: String(totalItems), hint: "Across all pages." },
          { label: "Shown on page", value: String(visible.length), hint: `Page ${page} of ${totalPages}.` },
          { label: "Page size", value: String(pageSize), hint: "Rows per page." },
          {
            label: "Published on page",
            value: String(visible.filter((entity) => entity.status === "PUBLISHED").length),
            hint: "Within the current slice."
          }
        ]}
      />

      <Card className="grid gap-4 border border-[var(--border-default)] p-4 md:grid-cols-2 xl:grid-cols-4">
        <Input placeholder="Search entities" value={filters.q} onChange={(event) => updateFilter("q", event.target.value)} />
        <Select value={filters.type} onChange={(event) => updateFilter("type", event.target.value)}>
          <option value="">All types</option>
          {entityTypes.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
        <Select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
          <option value="">All status</option>
          {entityStatuses.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
        <Select value={filters.visibility} onChange={(event) => updateFilter("visibility", event.target.value)}>
          <option value="">All visibility</option>
          {visibilityOptions.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
        {hasActiveFilters({ q: filters.q, type: filters.type, status: filters.status, visibility: filters.visibility }) ? (
          <div className="md:col-span-2 xl:col-span-4">
            <Button
              variant="ghost"
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  q: "",
                  type: "",
                  status: "",
                  visibility: "",
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
        <EmptyState
          title="No entities found"
          description="Try broadening the search or create the first canonical entity record."
          actionLabel="Create entity"
          onAction={() => {
            window.location.href = "/entities/new";
          }}
        />
      ) : (
        <>
          <Card className="overflow-hidden border border-[var(--border-default)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border-default)] text-sm">
                <thead className="bg-[var(--bg-surface-muted)] text-left text-[var(--text-secondary)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Visibility</th>
                    <th className="px-4 py-3 font-medium">Sections</th>
                    <th className="px-4 py-3 font-medium">Reports</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-default)]">
                  {visible.map((entity) => (
                    <tr key={entity.id} className="hover:bg-[var(--bg-surface-muted)]">
                      <td className="px-4 py-3 align-top">
                        <Link href={`/entities/${entity.id}`} className="font-medium hover:underline">
                          {entity.title}
                        </Link>
                        <p className="mt-1 max-w-md text-xs text-[var(--text-secondary)]">{entity.shortDescription}</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <EntityTypeBadge value={entity.entityType} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <EntityStatusBadge value={entity.status} />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <VisibilityBadge value={entity.visibility} />
                      </td>
                      <td className="px-4 py-3 align-top text-[var(--text-secondary)]">{entity._count?.sections ?? 0}</td>
                      <td className="px-4 py-3 align-top text-[var(--text-secondary)]">{entity._count?.reports ?? 0}</td>
                      <td className="px-4 py-3 align-top text-[var(--text-secondary)]">{formatDate(entity.updatedAt)}</td>
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
            itemLabel="entities"
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

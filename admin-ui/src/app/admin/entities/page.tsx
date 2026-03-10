"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EntityStatusBadge, EntityTypeBadge, VisibilityBadge } from "@/components/status/badges";
import { entityStatuses, entityTypes, visibilityOptions } from "@/lib/data/enums";
import { formatDate, formatEnum } from "@/lib/utils/format";
import { useEntities } from "@/features/entities";

export default function AdminEntitiesPage() {
  const [filters, setFilters] = useState({ q: "", type: "", status: "", visibility: "" });
  const entities = useEntities(filters);

  return (
    <div>
      <PageHeader title="Entities" subtitle="Manage canonical objects, services, and situations." actions={<Link href="/admin/entities/new"><Button variant="primary">New entity</Button></Link>} />
      <Card className="mb-5 grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        <Input placeholder="Search entities" value={filters.q} onChange={(e) => setFilters((v) => ({ ...v, q: e.target.value }))} />
        <Select value={filters.type} onChange={(e) => setFilters((v) => ({ ...v, type: e.target.value }))}>
          <option value="">All types</option>
          {entityTypes.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}
        </Select>
        <Select value={filters.status} onChange={(e) => setFilters((v) => ({ ...v, status: e.target.value }))}>
          <option value="">All status</option>
          {entityStatuses.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}
        </Select>
        <Select value={filters.visibility} onChange={(e) => setFilters((v) => ({ ...v, visibility: e.target.value }))}>
          <option value="">All visibility</option>
          {visibilityOptions.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}
        </Select>
      </Card>
      <Card className="overflow-hidden">
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
              {(entities.data ?? []).map((entity) => (
                <tr key={entity.id} className="hover:bg-[var(--bg-surface-muted)]">
                  <td className="px-4 py-3 align-top"><Link href={`/admin/entities/${entity.id}`} className="font-medium hover:underline">{entity.title}</Link><p className="mt-1 max-w-md text-xs text-[var(--text-secondary)]">{entity.shortDescription}</p></td>
                  <td className="px-4 py-3 align-top"><EntityTypeBadge value={entity.entityType} /></td>
                  <td className="px-4 py-3 align-top"><EntityStatusBadge value={entity.status} /></td>
                  <td className="px-4 py-3 align-top"><VisibilityBadge value={entity.visibility} /></td>
                  <td className="px-4 py-3 align-top text-[var(--text-secondary)]">{entity._count?.sections ?? 0}</td>
                  <td className="px-4 py-3 align-top text-[var(--text-secondary)]">{entity._count?.reports ?? 0}</td>
                  <td className="px-4 py-3 align-top text-[var(--text-secondary)]">{formatDate(entity.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

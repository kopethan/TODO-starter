import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableWrapper, Td, Th } from "@/components/ui/data-table";
import { listEntities } from "@/lib/api/entities";
import { formatDateTime } from "@/lib/format";
import { sentenceCase } from "@/lib/utils";
import { EntityFilters } from "@/features/entities/components/entity-filters";
import {
  EntityStatusBadge,
  VisibilityBadge
} from "@/features/entities/components/entity-badges";

export default async function EntitiesPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const entities = await listEntities({
    q: typeof params.q === "string" ? params.q : undefined,
    type: typeof params.type === "string" ? params.type : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    visibility: typeof params.visibility === "string" ? params.visibility : undefined
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entities"
        description="Manage canonical knowledge pages and their structured sections."
        actions={<Link href="/entities/new" className={buttonClasses({ variant: "primary" })}>New entity</Link>}
      />

      <EntityFilters />

      {entities.length === 0 ? (
        <EmptyState
          title="No entities found"
          description="Try another filter or create the first entity for the platform."
          actionHref="/entities/new"
          actionLabel="Create entity"
        />
      ) : (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>Entity</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Visibility</Th>
                <Th>Sections</Th>
                <Th>Reports</Th>
                <Th>Updated</Th>
              </tr>
            </thead>
            <tbody>
              {entities.map((entity) => (
                <tr key={entity.id} className="border-t border-[var(--border)]">
                  <Td>
                    <Link href={`/entities/${entity.id}`} className="block space-y-1 hover:opacity-80">
                      <div className="font-medium text-[var(--text-strong)]">{entity.title}</div>
                      <div className="max-w-xl text-sm text-[var(--text-muted)]">{entity.shortDescription}</div>
                    </Link>
                  </Td>
                  <Td>{sentenceCase(entity.entityType)}</Td>
                  <Td><EntityStatusBadge value={entity.status} /></Td>
                  <Td><VisibilityBadge value={entity.visibility} /></Td>
                  <Td>{entity._count.sections}</Td>
                  <Td>{entity._count.reports}</Td>
                  <Td>{formatDateTime(entity.updatedAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}
    </div>
  );
}

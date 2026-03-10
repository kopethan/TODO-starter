import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEntityById } from "@/lib/api/entities";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/layout/page-header";
import { EntityForm } from "@/features/entities/components/entity-form";
import { EntitySectionsManager } from "@/features/entities/components/entity-sections-manager";
import {
  EntityStatusBadge,
  VisibilityBadge
} from "@/features/entities/components/entity-badges";

export default async function EntityDetailPage({
  params
}: {
  params: Promise<{ entityId: string }>;
}) {
  const { entityId } = await params;
  const entity = await getEntityById(entityId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={entity.title}
        description="Edit entity metadata, maintain structured sections, and keep the canonical page accurate."
        actions={
          <div className="flex flex-wrap gap-2">
            <EntityStatusBadge value={entity.status} />
            <VisibilityBadge value={entity.visibility} />
            <Link href="/entities" className={buttonClasses({ variant: "ghost" })}>Back to entities</Link>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <EntityForm entity={entity} />
          <EntitySectionsManager entityId={entity.id} sections={entity.sections} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Entity metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--text-muted)]">
              <div className="flex items-center justify-between gap-4">
                <span>Slug</span>
                <span className="text-right text-[var(--text-strong)]">{entity.slug}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Reports linked</span>
                <span className="text-right text-[var(--text-strong)]">{entity._count.reports}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Created</span>
                <span className="text-right text-[var(--text-strong)]">{formatDateTime(entity.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Updated</span>
                <span className="text-right text-[var(--text-strong)]">{formatDateTime(entity.updatedAt)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Published</span>
                <span className="text-right text-[var(--text-strong)]">{formatDateTime(entity.publishedAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What this page is for</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--text-muted)]">
              <p>Facts and claims stay separate. This page handles the stable entity knowledge only.</p>
              <p>Reports are reviewed as incoming claims in the dedicated reports workspace.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

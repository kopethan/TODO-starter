"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Dialog, EntityStatusBadge, EntityTypeBadge, PageHeader, VisibilityBadge, formatDate, formatEnum } from "@todo/ui";
import { type EntitySection, sectionTypes } from "@todo/types";
import { EmptyState } from "@/components/shared/empty-state";
import { KeyValueList } from "@/components/shared/key-value-list";
import { PageSection } from "@/components/shared/page-section";
import { StatGrid } from "@/components/shared/stat-grid";
import { useToast } from "@/components/shared/toast-provider";
import { EntityForm } from "@/features/entities/form";
import { EntitySectionForm } from "@/features/entities/section-form";
import { useCreateSection, useDeleteSection, useEntity, useUpdateEntity, useUpdateSection } from "@/features/entities";
import { useReports } from "@/features/reports";

const emptySection = {
  sectionType: sectionTypes[0],
  title: "",
  content: "",
  sortOrder: 0
} as const;

export default function EntityDetailPage() {
  const params = useParams<{ id: string }>();
  const id = String(params.id);
  const entity = useEntity(id);
  const updateEntity = useUpdateEntity(id);
  const createSection = useCreateSection(id);
  const updateSection = useUpdateSection(id);
  const deleteSection = useDeleteSection(id);
  const reports = useReports({ entityId: id, page: "1", pageSize: "6" });
  const { pushToast } = useToast();
  const [editingSection, setEditingSection] = useState<EntitySection | null>(null);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);

  const visibleReports = useMemo(() => reports.data?.items ?? [], [reports.data]);

  if (entity.isLoading) {
    return <p className="text-sm text-[var(--text-secondary)]">Loading entity…</p>;
  }

  if (entity.error || !entity.data) {
    return <p className="text-sm text-[var(--danger-text)]">{entity.error?.message ?? "Entity not found."}</p>;
  }

  const record = entity.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title={record.title}
        subtitle="Canonical record editing for identity, explanatory copy, and structured sections."
        actions={
          <>
            <Link href="/entities">
              <Button variant="secondary">Back to entities</Button>
            </Link>
            <Link href={`/reports?entityId=${record.id}`}>
              <Button variant="ghost">View reports</Button>
            </Link>
          </>
        }
      />

      <StatGrid
        items={[
          { label: "Entity type", value: <EntityTypeBadge value={record.entityType} /> },
          { label: "Status", value: <EntityStatusBadge value={record.status} /> },
          { label: "Visibility", value: <VisibilityBadge value={record.visibility} /> },
          { label: "Reports", value: String(record._count?.reports ?? 0), hint: "Experience reports linked to this entity." }
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <EntityForm
            initialValues={{
              title: record.title,
              slug: record.slug,
              entityType: record.entityType,
              shortDescription: record.shortDescription,
              longDescription: record.longDescription ?? "",
              status: record.status,
              visibility: record.visibility
            }}
            submitLabel="Save entity"
            loading={updateEntity.isPending}
            onSubmit={async (values) => {
              try {
                const updated = await updateEntity.mutateAsync(values);
                pushToast({
                  tone: "success",
                  title: "Entity saved",
                  description: `${updated.title} has been updated.`
                });
              } catch (error) {
                pushToast({
                  tone: "danger",
                  title: "Could not save entity",
                  description: error instanceof Error ? error.message : "The entity changes were not saved."
                });
                throw error;
              }
            }}
          />

          <PageSection
            title="Entity sections"
            description="Structured explanation blocks such as definition, normal process, dangers, and red flags."
            action={
              <Button
                variant="primary"
                onClick={() => {
                  setEditingSection(null);
                  setSectionDialogOpen(true);
                }}
              >
                Add section
              </Button>
            }
          >
            <div className="space-y-4">
              {record.sections.length === 0 ? (
                <EmptyState
                  title="No sections yet"
                  description="Add the first section to describe how this entity normally works, where risk appears, and what users should watch for."
                  actionLabel="Add first section"
                  onAction={() => {
                    setEditingSection(null);
                    setSectionDialogOpen(true);
                  }}
                />
              ) : (
                record.sections.map((section) => (
                  <div key={section.id} className="rounded-xl border border-[var(--border-default)] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">
                          {formatEnum(section.sectionType)} · Order {section.sortOrder}
                        </p>
                        <h3 className="mt-1 text-base font-semibold">{section.title}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEditingSection(section);
                            setSectionDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          onClick={async () => {
                            if (!window.confirm(`Delete section "${section.title}"?`)) {
                              return;
                            }

                            try {
                              await deleteSection.mutateAsync(section.id);
                              if (editingSection?.id === section.id) {
                                setEditingSection(null);
                              }
                              pushToast({
                                tone: "success",
                                title: "Section deleted",
                                description: `${section.title} has been removed from this entity.`
                              });
                            } catch (error) {
                              pushToast({
                                tone: "danger",
                                title: "Could not delete section",
                                description: error instanceof Error ? error.message : "The section could not be removed."
                              });
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]">{section.content}</p>
                  </div>
                ))
              )}
            </div>
          </PageSection>

          <PageSection title="Linked reports" description="Recent experience reports for moderation or cross-checking.">
            {reports.isLoading ? (
              <p className="text-sm text-[var(--text-secondary)]">Loading reports…</p>
            ) : visibleReports.length === 0 ? (
              <EmptyState title="No reports linked" description="This entity does not have any related experience reports yet." />
            ) : (
              <div className="space-y-3">
                {visibleReports.map((report) => (
                  <Link
                    key={report.id}
                    href={`/reports/${report.id}`}
                    className="block rounded-xl border border-[var(--border-default)] p-4 transition hover:bg-[var(--bg-surface-muted)]"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold">{report.title}</span>
                      <span className="text-xs text-[var(--text-muted)]">{formatEnum(report.reportType)}</span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm text-[var(--text-secondary)]">{report.narrative}</p>
                    <p className="mt-2 text-xs text-[var(--text-muted)]">Reported {formatDate(report.reportedAt)}</p>
                  </Link>
                ))}
              </div>
            )}
          </PageSection>
        </div>

        <div className="space-y-6">
          <PageSection title="Record metadata" description="Useful reference information while editing.">
            <KeyValueList
              items={[
                { label: "Slug", value: record.slug },
                { label: "Created", value: formatDate(record.createdAt) },
                { label: "Updated", value: formatDate(record.updatedAt) },
                { label: "Trust factual confidence", value: record.trustStatus?.factualConfidence ?? "—" },
                { label: "Community signal", value: record.trustStatus?.communitySignalStrength ?? "—" },
                { label: "Moderation confidence", value: record.trustStatus?.moderationConfidence ?? "—" }
              ]}
            />
          </PageSection>
        </div>
      </div>

      <Dialog
        open={sectionDialogOpen}
        title={editingSection ? "Edit section" : "Add section"}
        onClose={() => {
          setSectionDialogOpen(false);
          setEditingSection(null);
        }}
      >
        <EntitySectionForm
          initialValues={
            editingSection
              ? {
                  sectionType: editingSection.sectionType,
                  title: editingSection.title,
                  content: editingSection.content,
                  sortOrder: editingSection.sortOrder
                }
              : { ...emptySection }
          }
          submitLabel={editingSection ? "Save section" : "Create section"}
          loading={createSection.isPending || updateSection.isPending || deleteSection.isPending}
          onCancel={() => {
            setSectionDialogOpen(false);
            setEditingSection(null);
          }}
          onSubmit={async (values) => {
            try {
              if (editingSection) {
                await updateSection.mutateAsync({ sectionId: editingSection.id, payload: values });
                pushToast({
                  tone: "success",
                  title: "Section updated",
                  description: `${values.title} has been saved.`
                });
              } else {
                await createSection.mutateAsync(values);
                pushToast({
                  tone: "success",
                  title: "Section created",
                  description: `${values.title} has been added to this entity.`
                });
              }
              setSectionDialogOpen(false);
              setEditingSection(null);
            } catch (error) {
              pushToast({
                tone: "danger",
                title: editingSection ? "Could not save section" : "Could not create section",
                description: error instanceof Error ? error.message : "The section request failed."
              });
              throw error;
            }
          }}
        />
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { EntityStatusBadge, VisibilityBadge, VerificationBadge, ModerationBadge, SeverityBadge } from "@/components/status/badges";
import { sectionTypes } from "@/lib/data/enums";
import { formatDate, formatEnum } from "@/lib/utils/format";
import { EntityForm } from "@/features/entities/form";
import { useCreateSection, useDeleteEntity, useDeleteSection, useEntity, useUpdateEntity, useUpdateSection, type SectionFormInput, type EntitySection } from "@/features/entities";
import { useReports } from "@/features/reports";

const sectionSchema = z.object({
  sectionType: z.enum(sectionTypes),
  title: z.string().min(2),
  content: z.string().min(10),
  sortOrder: z.coerce.number().int().nonnegative()
});

const emptySection: SectionFormInput = { sectionType: "DEFINITION", title: "", content: "", sortOrder: 0 };

export default function EntityDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const entity = useEntity(params.id);
  const updateEntity = useUpdateEntity(params.id);
  const deleteEntity = useDeleteEntity(params.id);
  const createSection = useCreateSection(params.id);
  const [tab, setTab] = useState("overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EntitySection | null>(null);
  const reports = useReports({ entityId: params.id });

  const updateSection = useUpdateSection(params.id, editing?.id ?? "");

  if (entity.isLoading) return <div>Loading entity...</div>;
  if (!entity.data) return <div>Entity not found.</div>;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <PageHeader
          title={entity.data.title}
          subtitle="Manage canonical content and structured sections."
          actions={
            <>
              <EntityStatusBadge value={entity.data.status} />
              <VisibilityBadge value={entity.data.visibility} />
              <Button variant="danger" onClick={async () => { await deleteEntity.mutateAsync(); router.push('/admin/entities'); }}>Delete</Button>
            </>
          }
        />
        <div className="mb-5"><Tabs tabs={[{ value: "overview", label: "Overview" }, { value: "sections", label: "Sections" }, { value: "reports", label: "Reports" }]} value={tab} onChange={setTab} /></div>
        {tab === "overview" ? (
          <EntityForm initialValues={{ title: entity.data.title, slug: entity.data.slug, entityType: entity.data.entityType, shortDescription: entity.data.shortDescription, longDescription: entity.data.longDescription ?? "", status: entity.data.status, visibility: entity.data.visibility }} submitLabel="Save changes" loading={updateEntity.isPending} onSubmit={async (values) => { await updateEntity.mutateAsync(values); }} />
        ) : null}
        {tab === "sections" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between"><div><h2 className="text-base font-semibold">Sections</h2><p className="text-sm text-[var(--text-secondary)]">Maintain ordered sections for facts, risks, and guidance.</p></div><Button variant="primary" onClick={() => { setEditing(null); setDialogOpen(true); }}>Add section</Button></div>
            {entity.data.sections.sort((a, b) => a.sortOrder - b.sortOrder).map((section) => <SectionRow key={section.id} entityId={params.id} section={section} onEdit={() => { setEditing(section); setDialogOpen(true); }} />)}
          </div>
        ) : null}
        {tab === "reports" ? (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border-default)] text-sm">
                <thead className="bg-[var(--bg-surface-muted)] text-left text-[var(--text-secondary)]"><tr><th className="px-4 py-3 font-medium">Title</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Severity</th><th className="px-4 py-3 font-medium">Verification</th><th className="px-4 py-3 font-medium">Moderation</th></tr></thead>
                <tbody className="divide-y divide-[var(--border-default)]">{(reports.data ?? []).map((report) => <tr key={report.id} className="hover:bg-[var(--bg-surface-muted)]"><td className="px-4 py-3"><Link href={`/admin/reports/${report.id}`} className="font-medium hover:underline">{report.title}</Link></td><td className="px-4 py-3 text-[var(--text-secondary)]">{formatEnum(report.reportType)}</td><td className="px-4 py-3"><SeverityBadge value={report.severityLevel} /></td><td className="px-4 py-3"><VerificationBadge value={report.verificationState} /></td><td className="px-4 py-3"><ModerationBadge value={report.moderationState} /></td></tr>)}</tbody>
              </table>
            </div>
          </Card>
        ) : null}
      </div>
      <Card className="h-fit p-5">
        <h2 className="text-base font-semibold">Metadata</h2>
        <dl className="mt-4 space-y-4 text-sm">
          <div><dt className="text-[var(--text-muted)]">Slug</dt><dd className="mt-1">{entity.data.slug}</dd></div>
          <div><dt className="text-[var(--text-muted)]">Created</dt><dd className="mt-1">{formatDate(entity.data.createdAt)}</dd></div>
          <div><dt className="text-[var(--text-muted)]">Updated</dt><dd className="mt-1">{formatDate(entity.data.updatedAt)}</dd></div>
          <div><dt className="text-[var(--text-muted)]">Sections</dt><dd className="mt-1">{entity.data.sections.length}</dd></div>
          <div><dt className="text-[var(--text-muted)]">Reports</dt><dd className="mt-1">{entity.data._count?.reports ?? 0}</dd></div>
        </dl>
      </Card>
      <Dialog open={dialogOpen} title={editing ? "Edit section" : "Add section"} onClose={() => setDialogOpen(false)}>
        <SectionEditorForm entityId={params.id} initialValues={editing ? { sectionType: editing.sectionType, title: editing.title, content: editing.content, sortOrder: editing.sortOrder } : emptySection} submitLabel={editing ? "Save section" : "Create section"} onSubmit={async (values) => { if (editing) { await updateSection.mutateAsync(values); } else { await createSection.mutateAsync(values); } setDialogOpen(false); }} />
      </Dialog>
    </div>
  );
}

function SectionRow({ entityId, section, onEdit }: { entityId: string; section: EntitySection; onEdit: () => void }) {
  const remove = useDeleteSection(entityId, section.id);
  return <Card className="p-4"><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{section.title}</h3><span className="rounded-full bg-[var(--theme-tint)] px-2.5 py-1 text-xs font-medium">{formatEnum(section.sectionType)}</span></div><p className="mt-2 line-clamp-3 text-sm text-[var(--text-secondary)]">{section.content}</p></div><div className="flex items-center gap-2"><span className="text-xs text-[var(--text-muted)]">Order {section.sortOrder}</span><Button onClick={onEdit}>Edit</Button><Button variant="danger" onClick={() => remove.mutate()} disabled={remove.isPending}>Delete</Button></div></div></Card>;
}

function SectionEditorForm({ entityId, initialValues, submitLabel, onSubmit }: { entityId: string; initialValues: SectionFormInput; submitLabel: string; onSubmit: (values: SectionFormInput) => Promise<void> }) {
  const form = useForm<SectionFormInput>({ resolver: zodResolver(sectionSchema), defaultValues: initialValues });
  const { register, handleSubmit, formState: { errors } } = form;
  return <form className="space-y-4" onSubmit={handleSubmit(async (values) => onSubmit(values))}><div className="grid gap-4 md:grid-cols-2"><Field label="Title" error={errors.title?.message}><Input {...register('title')} /></Field><Field label="Section type" error={errors.sectionType?.message}><Select {...register('sectionType')}>{sectionTypes.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}</Select></Field><Field label="Sort order" error={errors.sortOrder?.message}><Input type="number" min={0} {...register('sortOrder')} /></Field></div><Field label="Content" error={errors.content?.message}><Textarea className="min-h-40" {...register('content')} /></Field><div className="flex justify-end"><Button type="submit" variant="primary">{submitLabel}</Button></div></form>;
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <div><label className="mb-2 block text-sm font-medium">{label}</label>{children}{error ? <p className="mt-1 text-sm text-[var(--danger-text)]">{error}</p> : null}</div>; }

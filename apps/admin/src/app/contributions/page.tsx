"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Badge,
  Button,
  Card,
  Dialog,
  EntityTypeBadge,
  Input,
  PageHeader,
  Select,
  Textarea,
  formatDate,
  formatEnum
} from "@todo/ui";
import {
  contributionStatuses,
  publicContributionKinds,
  sourceTypes,
  type AdminContributionApplyInput,
  type AdminContributionSummary,
  type ContributionApplyMode,
  type ContributionStatus
} from "@todo/types";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatGrid } from "@/components/shared/stat-grid";
import { useToast } from "@/components/shared/toast-provider";
import { useApplyContribution, useContributions, useUpdateContribution } from "@/features/contributions";
import { useEntity } from "@/features/entities";
import { hasActiveFilters, parsePositiveInteger, toSearchString } from "@/lib/search-params";

function ContributionStatusBadge({ value }: { value: string }) {
  return (
    <Badge tone={value === "APPROVED" ? "success" : value === "REJECTED" ? "danger" : "warning"}>
      {formatEnum(value)}
    </Badge>
  );
}

function ContributionKindBadge({ value }: { value?: string | null }) {
  if (!value) return null;
  return <Badge tone="theme">{formatEnum(value)}</Badge>;
}

function buildSourceDraft(item: AdminContributionSummary): Extract<AdminContributionApplyInput, { kind: "source" }> {
  return {
    kind: "source",
    sectionId: item.target.section?.id ?? "",
    sourceType: item.inferred?.sourceType ?? "OTHER",
    title: (item.structuredData?.sourceTitle || item.title).slice(0, 180),
    url: item.structuredData?.link || "",
    publisher: item.structuredData?.publisher || "",
    notes: [item.structuredData?.whyItMatters, item.plainText].filter(Boolean).join("\n\n").slice(0, 4000)
  };
}

function buildUpdateDraft(item: AdminContributionSummary): Extract<AdminContributionApplyInput, { kind: "update" }> {
  return {
    kind: "update",
    sectionId: item.target.section?.id ?? "",
    mode: "APPEND_NOTE",
    content: buildUpdateContent(item)
  };
}

function buildUpdateContent(item: AdminContributionSummary) {
  return [
    item.structuredData?.changeRequest,
    item.structuredData?.reason ? `Reason: ${item.structuredData.reason}` : null,
    item.structuredData?.support ? `Support: ${item.structuredData.support}` : null,
    !item.structuredData?.changeRequest ? item.plainText : null
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 12000);
}



type PreviewDiffLine = {
  tone: "same" | "removed" | "added";
  text: string;
};

function buildAppliedSectionContent(currentContent: string, draft: Extract<AdminContributionApplyInput, { kind: "update" }>) {
  const trimmedCurrent = currentContent.trim();
  const trimmedContent = draft.content.trim();

  if (draft.mode === "REPLACE_CONTENT") {
    return trimmedContent;
  }

  return [
    trimmedCurrent,
    `Moderator-applied update (${new Date().toISOString().slice(0, 10)}):`,
    trimmedContent
  ]
    .filter(Boolean)
    .join("\n\n");
}

function buildPreviewDiff(currentContent: string, nextContent: string): PreviewDiffLine[] {
  const currentLines = currentContent.split("\n");
  const nextLines = nextContent.split("\n");

  let prefix = 0;
  while (
    prefix < currentLines.length
    && prefix < nextLines.length
    && currentLines[prefix] === nextLines[prefix]
  ) {
    prefix += 1;
  }

  let suffix = 0;
  while (
    suffix < currentLines.length - prefix
    && suffix < nextLines.length - prefix
    && currentLines[currentLines.length - 1 - suffix] === nextLines[nextLines.length - 1 - suffix]
  ) {
    suffix += 1;
  }

  const sharedBefore = currentLines.slice(0, prefix).map((line) => ({ tone: "same" as const, text: line }));
  const removed = currentLines.slice(prefix, currentLines.length - suffix).map((line) => ({ tone: "removed" as const, text: line }));
  const added = nextLines.slice(prefix, nextLines.length - suffix).map((line) => ({ tone: "added" as const, text: line }));
  const sharedAfter = currentLines.slice(currentLines.length - suffix).map((line) => ({ tone: "same" as const, text: line }));

  return [...sharedBefore, ...removed, ...added, ...sharedAfter];
}

function toneClassName(tone: PreviewDiffLine["tone"]) {
  if (tone === "added") return "bg-emerald-50 text-emerald-900";
  if (tone === "removed") return "bg-rose-50 text-rose-900 line-through";
  return "text-[var(--text-secondary)]";
}

function ApplyContributionDialog({ item, open, onClose }: { item: AdminContributionSummary; open: boolean; onClose: () => void }) {
  const entity = useEntity(open && item.target.entity?.id ? item.target.entity.id : "");
  const apply = useApplyContribution(item.id, item.target.entity?.id);
  const { pushToast } = useToast();
  const [sourceDraft, setSourceDraft] = useState(() => buildSourceDraft(item));
  const [updateDraft, setUpdateDraft] = useState(() => buildUpdateDraft(item));

  const sections = entity.data?.sections ?? [];
  const selectedSourceSection = sections.find((section) => section.id === sourceDraft.sectionId) ?? null;
  const selectedUpdateSection = sections.find((section) => section.id === updateDraft.sectionId) ?? null;
  const previewedUpdateContent = useMemo(
    () => buildAppliedSectionContent(selectedUpdateSection?.content ?? "", updateDraft),
    [selectedUpdateSection?.content, updateDraft]
  );
  const previewDiff = useMemo(
    () => buildPreviewDiff(selectedUpdateSection?.content ?? "", previewedUpdateContent),
    [previewedUpdateContent, selectedUpdateSection?.content]
  );
  const diffSummary = useMemo(
    () => ({
      added: previewDiff.filter((line) => line.tone === "added").length,
      removed: previewDiff.filter((line) => line.tone === "removed").length
    }),
    [previewDiff]
  );

  useEffect(() => {
    setSourceDraft(buildSourceDraft(item));
    setUpdateDraft(buildUpdateDraft(item));
  }, [item]);

  useEffect(() => {
    if (!open || sections.length === 0) return;

    if (item.entryKind === "source" && !sourceDraft.sectionId) {
      setSourceDraft((current) => ({ ...current, sectionId: item.target.section?.id ?? sections[0]?.id ?? "" }));
    }

    if (item.entryKind === "update" && !updateDraft.sectionId) {
      setUpdateDraft((current) => ({ ...current, sectionId: item.target.section?.id ?? sections[0]?.id ?? "" }));
    }
  }, [item.entryKind, item.target.section?.id, open, sections, sourceDraft.sectionId, updateDraft.sectionId]);

  async function handleApply() {
    try {
      const payload = item.entryKind === "source" ? sourceDraft : updateDraft;
      const result = await apply.mutateAsync(payload);
      pushToast({
        tone: "success",
        title: item.entryKind === "source" ? "Source applied" : "Section update applied",
        description: result.appliedResource.kind === "source"
          ? `${result.appliedResource.sourceTitle} is now attached to ${item.target.entity?.title ?? "the entity"}.`
          : "The selected entity section now reflects this approved update."
      });
      onClose();
    } catch (error) {
      pushToast({
        tone: "danger",
        title: "Could not apply contribution",
        description: error instanceof Error ? error.message : "The approved contribution could not be applied."
      });
    }
  }

  if (item.entryKind !== "source" && item.entryKind !== "update") return null;

  return (
    <Dialog open={open} title={item.entryKind === "source" ? "Apply source contribution" : "Apply update contribution"} onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-1 text-sm text-[var(--text-secondary)]">
          <p className="font-medium text-[var(--text-primary)]">{item.title}</p>
          <p>
            {item.target.entity ? `${item.target.entity.title}${item.target.section ? ` / ${item.target.section.title}` : ""}` : "No valid target entity"}
          </p>
        </div>

        {entity.isLoading ? <p className="text-sm text-[var(--text-secondary)]">Loading entity sections…</p> : null}
        {!entity.isLoading && sections.length === 0 ? (
          <p className="text-sm text-[var(--danger-text)]">This entity has no sections yet. Create a section first, then apply this contribution.</p>
        ) : null}

        {item.entryKind === "source" ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Attach to section</label>
              <Select
                value={sourceDraft.sectionId}
                onChange={(event) => setSourceDraft((current) => ({ ...current, sectionId: event.target.value }))}
              >
                <option value="">Select section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Source title</label>
              <Input value={sourceDraft.title} onChange={(event) => setSourceDraft((current) => ({ ...current, title: event.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Source URL</label>
              <Input value={sourceDraft.url ?? ""} onChange={(event) => setSourceDraft((current) => ({ ...current, url: event.target.value }))} placeholder="https://…" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Publisher</label>
              <Input value={sourceDraft.publisher ?? ""} onChange={(event) => setSourceDraft((current) => ({ ...current, publisher: event.target.value }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Source type</label>
              <Select value={sourceDraft.sourceType} onChange={(event) => setSourceDraft((current) => ({ ...current, sourceType: event.target.value as typeof sourceDraft.sourceType }))}>
                {sourceTypes.map((value) => (
                  <option key={value} value={value}>
                    {formatEnum(value)}
                  </option>
                ))}
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Moderator note</label>
              <Textarea className="min-h-28" value={sourceDraft.notes ?? ""} onChange={(event) => setSourceDraft((current) => ({ ...current, notes: event.target.value }))} />
            </div>
            </div>

            <div className="space-y-3 border-t border-[var(--border-default)] pt-4">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Apply preview</p>
                <p className="text-sm text-[var(--text-secondary)]">Review the source record that will be created and where it will attach on the entity.</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
                <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                  <p>
                    Target section: <span className="text-[var(--text-primary)]">{selectedSourceSection?.title ?? "No section selected"}</span>
                  </p>
                  {selectedSourceSection?.content ? (
                    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-muted)] p-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Section excerpt</p>
                      <p className="whitespace-pre-wrap leading-6 text-[var(--text-primary)]">
                        {selectedSourceSection.content.length > 320 ? `${selectedSourceSection.content.slice(0, 317)}…` : selectedSourceSection.content}
                      </p>
                    </div>
                  ) : null}
                </div>
                <div className="rounded-lg border border-[var(--border-default)] bg-white p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Source record to create</p>
                  <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                    <p><span className="text-[var(--text-primary)]">Title:</span> {sourceDraft.title || "—"}</p>
                    <p><span className="text-[var(--text-primary)]">Type:</span> {formatEnum(sourceDraft.sourceType)}</p>
                    <p><span className="text-[var(--text-primary)]">Publisher:</span> {sourceDraft.publisher || "—"}</p>
                    <p><span className="text-[var(--text-primary)]">URL:</span> {sourceDraft.url || "—"}</p>
                    {sourceDraft.notes ? (
                      <div>
                        <p className="text-[var(--text-primary)]">Moderator note</p>
                        <p className="mt-1 whitespace-pre-wrap leading-6">{sourceDraft.notes}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Apply to section</label>
              <Select
                value={updateDraft.sectionId}
                onChange={(event) => setUpdateDraft((current) => ({ ...current, sectionId: event.target.value }))}
              >
                <option value="">Select section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.title}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Apply mode</label>
              <Select value={updateDraft.mode} onChange={(event) => setUpdateDraft((current) => ({ ...current, mode: event.target.value as ContributionApplyMode }))}>
                <option value="APPEND_NOTE">Append note to current section</option>
                <option value="REPLACE_CONTENT">Replace section content</option>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--text-primary)]">Section content to apply</label>
              <Textarea className="min-h-40" value={updateDraft.content} onChange={(event) => setUpdateDraft((current) => ({ ...current, content: event.target.value }))} />
            </div>
            </div>

            <div className="space-y-3 border-t border-[var(--border-default)] pt-4">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Apply preview</p>
                <p className="text-sm text-[var(--text-secondary)]">Compare the current section against the result that will be saved if you apply this approved update.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
                <Badge tone="default">Section: {selectedUpdateSection?.title ?? "No section selected"}</Badge>
                <Badge tone="default">Mode: {formatEnum(updateDraft.mode)}</Badge>
                <Badge tone="default">{diffSummary.added} added line{diffSummary.added === 1 ? "" : "s"}</Badge>
                <Badge tone="default">{diffSummary.removed} removed line{diffSummary.removed === 1 ? "" : "s"}</Badge>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Current section</p>
                  <div className="max-h-72 overflow-y-auto rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface-muted)] p-3 text-sm leading-6 text-[var(--text-primary)] whitespace-pre-wrap">
                    {selectedUpdateSection?.content || "No section selected."}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Result after apply</p>
                  <div className="max-h-72 overflow-y-auto rounded-lg border border-[var(--border-default)] bg-white p-3 text-sm leading-6 text-[var(--text-primary)] whitespace-pre-wrap">
                    {previewedUpdateContent || "No content to apply yet."}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Lightweight diff</p>
                <div className="max-h-80 overflow-y-auto rounded-lg border border-[var(--border-default)] bg-white p-2 text-sm leading-6">
                  {previewDiff.length > 0 ? (
                    <div className="space-y-1">
                      {previewDiff.map((line, index) => (
                        <div key={`${line.tone}-${index}-${line.text.slice(0, 24)}`} className={`rounded px-2 py-1 ${toneClassName(line.tone)}`}>
                          <span className="mr-2 inline-block min-w-4 text-center font-mono text-xs">{line.tone === "added" ? "+" : line.tone === "removed" ? "−" : "·"}</span>
                          <span className="whitespace-pre-wrap">{line.text || " "}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--text-secondary)]">No diff preview available yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 border-t border-[var(--border-default)] pt-4">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleApply}
            disabled={
              apply.isPending
              || sections.length === 0
              || (item.entryKind === "source"
                ? !sourceDraft.sectionId || !sourceDraft.title.trim()
                : !updateDraft.sectionId || !updateDraft.content.trim())
            }
          >
            {apply.isPending ? "Applying…" : "Apply to entity"}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

function ContributionCard({ item }: { item: AdminContributionSummary }) {
  const review = useUpdateContribution(item.id);
  const { pushToast } = useToast();
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const canApply = Boolean(item.target.entity && item.status === "APPROVED" && !item.applied && (item.entryKind === "source" || item.entryKind === "update"));

  async function applyStatus(status: ContributionStatus, successLabel: string) {
    try {
      await review.mutateAsync({ status });
      pushToast({
        tone: "success",
        title: successLabel,
        description: `${item.title} is now marked ${formatEnum(status).toLowerCase()}.`
      });
    } catch (error) {
      pushToast({
        tone: "danger",
        title: "Could not update contribution",
        description: error instanceof Error ? error.message : "The contribution status could not be saved."
      });
    }
  }

  return (
    <>
      <Card className="border border-[var(--border-default)] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <ContributionStatusBadge value={item.status} />
              <ContributionKindBadge value={item.entryKind} />
              {item.applied ? <Badge tone="success">Applied</Badge> : null}
              {item.target.entity ? <EntityTypeBadge value={item.target.entity.entityType} /> : null}
              {item.inferred?.severityLevel ? <Badge tone="warning">{formatEnum(item.inferred.severityLevel)}</Badge> : null}
            </div>

            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">{item.title}</h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{item.summary}</p>
            </div>

            <div className="space-y-1 text-sm text-[var(--text-secondary)]">
              <p>
                Submitted {formatDate(item.createdAt)} • {formatEnum(item.contributionType)}
                {item.reviewedAt ? ` • Reviewed ${formatDate(item.reviewedAt)}` : ""}
              </p>
              <p>
                Target: {item.target.entity ? (
                  <>
                    <Link href={`/entities/${item.target.entity.id}`} className="font-medium underline decoration-[var(--border-default)] underline-offset-4">
                      {item.target.entity.title}
                    </Link>
                    {item.target.section ? ` / ${item.target.section.title}` : ""}
                  </>
                ) : (
                  "No valid public target"
                )}
              </p>
              {item.applied ? (
                <p>
                  Applied {formatDate(item.applied.appliedAt)} to <span className="text-[var(--text-primary)]">{item.applied.sectionTitle}</span>
                  {item.applied.sourceTitle ? ` • ${item.applied.sourceTitle}` : ""}
                  {item.applied.mode ? ` • ${formatEnum(item.applied.mode)}` : ""}
                </p>
              ) : null}
              {item.contact?.email || item.contact?.name ? (
                <p>
                  Contact: {[item.contact?.name, item.contact?.email].filter(Boolean).join(" • ")}
                </p>
              ) : null}
              <p>Public display: {item.allowPublicDisplay === false ? "No" : "Yes"}</p>
            </div>

            {item.plainText ? (
              <div className="rounded-lg bg-[var(--bg-surface-muted)] px-3 py-2 text-sm leading-6 text-[var(--text-primary)]">
                {item.plainText.length > 360 ? `${item.plainText.slice(0, 357)}…` : item.plainText}
              </div>
            ) : null}

            {(item.missingFields.length > 0 || Object.keys(item.structuredData ?? {}).length > 0 || item.inferred?.reportType || item.inferred?.sourceType || item.inferred?.outcome) ? (
              <div className="space-y-2 border-t border-[var(--border-default)] pt-3 text-sm text-[var(--text-secondary)]">
                {item.missingFields.length > 0 ? (
                  <p>
                    Missing for review: <span className="text-[var(--text-primary)]">{item.missingFields.join(", ")}</span>
                  </p>
                ) : null}
                {item.inferred?.reportType || item.inferred?.sourceType || item.inferred?.outcome ? (
                  <p>
                    Inferred: {[
                      item.inferred?.reportType ? formatEnum(item.inferred.reportType) : null,
                      item.inferred?.sourceType ? formatEnum(item.inferred.sourceType) : null,
                      item.inferred?.outcome ? formatEnum(item.inferred.outcome) : null
                    ].filter(Boolean).join(" • ")}
                  </p>
                ) : null}
                {item.structuredData && Object.keys(item.structuredData).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(item.structuredData)
                      .filter(([, value]) => value)
                      .slice(0, 4)
                      .map(([key, value]) => (
                        <Badge key={key} tone="default">
                          {formatEnum(key)}: {String(value)}
                        </Badge>
                      ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 xl:max-w-[220px] xl:flex-col xl:items-stretch">
            {canApply ? (
              <Button variant="primary" onClick={() => setIsApplyOpen(true)}>
                Apply to entity
              </Button>
            ) : null}
            {!item.applied && item.status !== "APPROVED" ? (
              <Button onClick={() => applyStatus("APPROVED", "Contribution approved")} disabled={review.isPending}>
                Approve
              </Button>
            ) : null}
            {!item.applied && item.status !== "NEEDS_REVIEW" ? (
              <Button variant="secondary" onClick={() => applyStatus("NEEDS_REVIEW", "Contribution returned to intake")} disabled={review.isPending}>
                Send back to intake
              </Button>
            ) : null}
            {!item.applied && item.status !== "REJECTED" ? (
              <Button variant="ghost" onClick={() => applyStatus("REJECTED", "Contribution rejected")} disabled={review.isPending}>
                Reject
              </Button>
            ) : null}
            {item.applied && item.target.entity ? (
              <Link href={`/entities/${item.target.entity.id}`}>
                <Button variant="secondary" className="w-full">Open entity</Button>
              </Link>
            ) : null}
          </div>
        </div>
      </Card>

      <ApplyContributionDialog item={item} open={isApplyOpen} onClose={() => setIsApplyOpen(false)} />
    </>
  );
}

export default function AdminContributionsPage() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [filters, setFilters] = useState({
    q: searchParams.get("q") ?? "",
    status: searchParams.get("status") ?? "NEEDS_REVIEW",
    kind: searchParams.get("kind") ?? "",
    page: String(parsePositiveInteger(searchParams.get("page"), 1)),
    pageSize: String(parsePositiveInteger(searchParams.get("pageSize"), 10))
  });

  useEffect(() => {
    const next = toSearchString(filters);
    if (next !== searchParams.toString()) {
      router.replace(next ? `${pathname}?${next}` : pathname);
    }
  }, [filters, pathname, router, searchParams]);

  const contributions = useContributions(filters);
  const reviewQueueCount = useContributions({ status: "NEEDS_REVIEW", page: "1", pageSize: "1" });
  const approvedCount = useContributions({ status: "APPROVED", page: "1", pageSize: "1" });
  const rejectedCount = useContributions({ status: "REJECTED", page: "1", pageSize: "1" });

  const visible = useMemo(() => contributions.data?.items ?? [], [contributions.data]);
  const page = contributions.data?.page ?? Number(filters.page);
  const pageSize = contributions.data?.pageSize ?? Number(filters.pageSize);
  const totalItems = contributions.data?.totalItems ?? 0;
  const totalPages = contributions.data?.totalPages ?? 1;

  const updateFilter = (key: "q" | "status" | "kind", value: string) => {
    setFilters((current) => ({ ...current, [key]: value, page: "1" }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contribution intake"
        subtitle="Review public signals, source suggestions, evidence notes, and update requests before they become trusted content."
        actions={
          <Link href="/reports/queue">
            <Button variant="secondary">Open report queue</Button>
          </Link>
        }
      />

      <StatGrid
        items={[
          {
            label: "Needs review",
            value: String(reviewQueueCount.data?.totalItems ?? 0),
            hint: "Current intake backlog."
          },
          {
            label: "Approved",
            value: String(approvedCount.data?.totalItems ?? 0),
            hint: "Already cleared by moderation."
          },
          {
            label: "Rejected",
            value: String(rejectedCount.data?.totalItems ?? 0),
            hint: "Rejected after review."
          },
          {
            label: "Visible now",
            value: String(visible.length),
            hint: `Page ${page} of ${totalPages}.`
          }
        ]}
      />

      <Card className="grid gap-4 border border-[var(--border-default)] p-4 md:grid-cols-2 xl:grid-cols-4">
        <Input placeholder="Search title, summary, or submission text" value={filters.q} onChange={(event) => updateFilter("q", event.target.value)} />
        <Select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
          <option value="">All statuses</option>
          {contributionStatuses.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
        <Select value={filters.kind} onChange={(event) => updateFilter("kind", event.target.value)}>
          <option value="">All public entry kinds</option>
          {publicContributionKinds.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
        {hasActiveFilters({ q: filters.q, status: filters.status, kind: filters.kind }) ? (
          <div className="md:col-span-2 xl:col-span-1 xl:flex xl:justify-end">
            <Button
              variant="ghost"
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  q: "",
                  status: "NEEDS_REVIEW",
                  kind: "",
                  page: "1"
                }))
              }
            >
              Reset intake view
            </Button>
          </div>
        ) : null}
      </Card>

      {visible.length === 0 ? (
        <EmptyState
          title="No contributions found"
          description="Try broadening the search or switch away from the current intake status filter."
        />
      ) : (
        <>
          <div className="space-y-4">
            {visible.map((item) => (
              <ContributionCard key={item.id} item={item} />
            ))}
          </div>

          <PaginationControls
            page={page}
            pageSize={pageSize}
            totalItems={totalItems}
            totalPages={totalPages}
            currentCount={visible.length}
            itemLabel="contributions"
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

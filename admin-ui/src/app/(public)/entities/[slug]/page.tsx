"use client";

import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EntityTypeBadge, SeverityBadge, VerificationBadge } from "@/components/status/badges";
import { useEntityBySlug } from "@/features/entities";
import { useReports } from "@/features/reports";
import { formatDate, formatEnum } from "@/lib/utils/format";

const overviewTypes = new Set(["DEFINITION", "PURPOSE"]);
const flowTypes = new Set(["COMMON_USES", "NORMAL_PROCESS", "SAFE_USAGE"]);
const riskTypes = new Set(["DANGERS", "RED_FLAGS", "COMMON_SCAMS", "HOW_TO_PROTECT_YOURSELF", "WHAT_TO_DO_IF_AFFECTED"]);
const noteTypes = new Set(["NOTES", "RELATED_ALTERNATIVES"]);

export default function EntityPage() {
  const params = useParams<{ slug: string }>();
  const entity = useEntityBySlug(params.slug);
  const reports = useReports(entity.data ? { entityId: entity.data.id, moderationState: "APPROVED" } : {});

  if (entity.isLoading) return <div className="mx-auto max-w-7xl px-4 py-10">Loading entity...</div>;
  if (!entity.data) return <div className="mx-auto max-w-7xl px-4 py-10">Entity not found.</div>;

  const grouped = {
    overview: entity.data.sections.filter((section) => overviewTypes.has(section.sectionType)),
    flow: entity.data.sections.filter((section) => flowTypes.has(section.sectionType)),
    risks: entity.data.sections.filter((section) => riskTypes.has(section.sectionType)),
    notes: entity.data.sections.filter((section) => noteTypes.has(section.sectionType))
  };

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)_300px] lg:px-8">
      <aside className="hidden lg:block">
        <Card className="sticky top-24 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">On this page</p>
          <nav className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
            {[
              ["overview", "Overview"],
              ["flow", "How it normally works"],
              ["risks", "Risks and red flags"],
              ["notes", "Important notes"],
              ["reports", "Related reports"]
            ].map(([id, label]) => <a key={id} href={`#${id}`} className="block hover:text-[var(--text-primary)]">{label}</a>)}
          </nav>
        </Card>
      </aside>
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-2">
            <EntityTypeBadge value={entity.data.entityType} />
            <Badge tone="theme">{entity.data._count?.reports ?? 0} reports</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{entity.data.title}</h1>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">{entity.data.shortDescription}</p>
        </Card>
        <SectionBlock id="overview" title="Overview" sections={grouped.overview.length ? grouped.overview : entity.data.sections.slice(0, 1)} />
        <SectionBlock id="flow" title="How it normally works" sections={grouped.flow} emptyMessage="This section has not been structured yet." />
        <SectionBlock id="risks" title="Risks and red flags" sections={grouped.risks} tone="warning" emptyMessage="No specific risks have been added yet." />
        <SectionBlock id="notes" title="Important notes" sections={grouped.notes} emptyMessage="No extra notes have been added yet." />
        <Card id="reports" className="p-6">
          <h2 className="text-xl font-semibold">Related reports</h2>
          <div className="mt-4 space-y-3">
            {(reports.data ?? []).slice(0, 5).map((report) => (
              <Card key={report.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{report.title}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-[var(--text-secondary)]">{report.narrative}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SeverityBadge value={report.severityLevel} />
                    <VerificationBadge value={report.verificationState} />
                  </div>
                </div>
              </Card>
            ))}
            {reports.data?.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">No public reports are attached yet.</p> : null}
          </div>
        </Card>
      </div>
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-4">
          <Card className="p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Metadata</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div><dt className="text-[var(--text-muted)]">Entity type</dt><dd className="mt-1">{formatEnum(entity.data.entityType)}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Last updated</dt><dd className="mt-1">{formatDate(entity.data.updatedAt)}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Status</dt><dd className="mt-1">{formatEnum(entity.data.status)}</dd></div>
            </dl>
          </Card>
          <Card className="p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Counts</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div><dt className="text-[var(--text-muted)]">Sections</dt><dd className="mt-1">{entity.data.sections.length}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Reports</dt><dd className="mt-1">{entity.data._count?.reports ?? 0}</dd></div>
            </dl>
          </Card>
        </div>
      </aside>
    </div>
  );
}

function SectionBlock({ id, title, sections, tone, emptyMessage }: { id: string; title: string; sections: { id: string; title: string; content: string; sectionType: string }[]; tone?: "warning"; emptyMessage?: string }) {
  return (
    <Card id={id} className="p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="mt-4 space-y-5">
        {sections.length > 0 ? sections.map((section) => (
          <div key={section.id} className={tone === "warning" ? "rounded-2xl border border-[var(--warning-border)] bg-[var(--warning-bg)] p-4" : ""}>
            <div className="flex flex-wrap items-center gap-2"><Badge tone={tone === "warning" ? "warning" : "theme"}>{formatEnum(section.sectionType)}</Badge></div>
            <h3 className="mt-3 text-lg font-semibold">{section.title}</h3>
            <p className="mt-2 whitespace-pre-wrap text-[var(--text-secondary)]">{section.content}</p>
          </div>
        )) : <p className="text-sm text-[var(--text-secondary)]">{emptyMessage ?? "No content yet."}</p>}
      </div>
    </Card>
  );
}

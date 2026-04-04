"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Badge, Button, Card, EntityTypeBadge, SeverityBadge, Textarea, VerificationBadge, formatDate, formatEnum } from "@todo/ui";
import type { EntitySection, EntitySource, PublicSignalSummary, ReportSummary } from "@todo/types";
import { useEntityBySlug } from "@/features/entities";
import { useReports } from "@/features/reports";
import { useSignals } from "@/features/signals";

const overviewTypes = new Set(["DEFINITION", "PURPOSE"]);
const flowTypes = new Set(["COMMON_USES", "NORMAL_PROCESS", "SAFE_USAGE"]);
const riskTypes = new Set(["DANGERS", "RED_FLAGS", "COMMON_SCAMS", "HOW_TO_PROTECT_YOURSELF", "WHAT_TO_DO_IF_AFFECTED"]);
const noteTypes = new Set(["NOTES", "RELATED_ALTERNATIVES"]);
const tabIds = ["overview", "reports", "signals", "sources"] as const;
type EntityTabId = (typeof tabIds)[number];

const tabLabels: Record<EntityTabId, string> = {
  overview: "Overview",
  reports: "Reports",
  signals: "Signals",
  sources: "Sources"
};

type AggregatedSource = {
  source: EntitySource;
  supportingSections: Pick<EntitySection, "id" | "title" | "sectionType">[];
};

export default function EntityPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const activeTab: EntityTabId = isEntityTab(requestedTab) ? requestedTab : "overview";

  const entity = useEntityBySlug(params.slug);
  const reports = useReports(entity.data ? { entityId: entity.data.id, moderationState: "APPROVED" } : {});
  const signalsQuery = useSignals(entity.data ? { entityId: entity.data.id, pageSize: "24" } : {});
  const relatedReports = reports.data?.items ?? [];

  if (entity.isLoading) return <div className="mx-auto max-w-4xl px-4 py-10">Loading entity...</div>;
  if (!entity.data) return <div className="mx-auto max-w-4xl px-4 py-10">Entity not found.</div>;

  const grouped = {
    overview: entity.data.sections.filter((section) => overviewTypes.has(section.sectionType)),
    flow: entity.data.sections.filter((section) => flowTypes.has(section.sectionType)),
    risks: entity.data.sections.filter((section) => riskTypes.has(section.sectionType)),
    notes: entity.data.sections.filter((section) => noteTypes.has(section.sectionType))
  };

  const fallbackSection = entity.data.sections[0];
  const overviewSections = grouped.overview.length ? grouped.overview : fallbackSection ? [fallbackSection] : [];
  const summarySection = grouped.flow[0] ?? overviewSections[0] ?? grouped.risks[0] ?? fallbackSection;
  const summaryText = summarySection?.content?.split("\n")[0] ?? entity.data.shortDescription;
  const signals = signalsQuery.data?.items ?? [];
  const sources = aggregateSources(entity.data.sections);
  const hasContextSections = grouped.flow.length > 0 || grouped.risks.length > 0 || grouped.notes.length > 0;

  const visibleTabSummary = useMemo(() => ({
    overview: `${entity.data.sections.length} structured sections`,
    reports: `${relatedReports.length} public reports`,
    signals: `${signals.length} public signals`,
    sources: `${sources.length} supporting sources`
  }), [entity.data.sections.length, relatedReports.length, signals.length, sources.length]);

  return (
    <div className="mx-auto grid w-full max-w-[80rem] gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-8 lg:py-8">
      <div className="space-y-5">
        <Card className="rounded-[1.75rem] p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <EntityTypeBadge value={entity.data.entityType} />
            <Badge tone="theme">{entity.data._count?.reports ?? 0} reports</Badge>
            <Badge tone={signals.length > 0 ? "warning" : "default"}>{signals.length} signals</Badge>
            <Badge>{sources.length} sources</Badge>
            <Badge>{formatEnum(entity.data.status)}</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{entity.data.title}</h1>
          <p className="mt-3 max-w-4xl text-lg text-[var(--text-secondary)]">{entity.data.shortDescription}</p>
          <div className="mt-6 rounded-[1.5rem] bg-[var(--theme-tint)] p-4 sm:p-5 shadow-[inset_0_0_0_1px_rgba(47,91,234,0.08)] dark:shadow-[inset_0_0_0_1px_rgba(125,162,255,0.12)]">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--theme-700)]">What to know first</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">{summaryText}</p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-[var(--text-secondary)]">Share information:</span>
            <Link href={buildContributionHref(entity.data.slug, entity.data.title, "report")} className="font-medium text-[var(--theme-700)] transition hover:opacity-80">
              Share a report
            </Link>
            <Link href={buildContributionHref(entity.data.slug, entity.data.title, "signal")} className="font-medium text-[var(--theme-700)] transition hover:opacity-80">
              Share a signal
            </Link>
            <Link href={buildContributionHref(entity.data.slug, entity.data.title, "source")} className="font-medium text-[var(--theme-700)] transition hover:opacity-80">
              Add a source
            </Link>
            <Link href={buildContributionHref(entity.data.slug, entity.data.title, "update")} className="font-medium text-[var(--theme-700)] transition hover:opacity-80">
              Suggest an update
            </Link>
          </div>
        </Card>

        <section aria-label="Entity sections" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--border-default)]" />
            <nav className="flex min-w-0 flex-wrap items-center justify-center gap-2 text-sm" aria-label="Entity tabs">
              {tabIds.map((tabId) => (
                <TabLink
                  key={tabId}
                  entitySlug={entity.data.slug}
                  tabId={tabId}
                  active={activeTab === tabId}
                  label={tabLabels[tabId]}
                />
              ))}
            </nav>
            <div className="h-px flex-1 bg-[var(--border-default)]" />
          </div>

          <p className="text-sm text-[var(--text-secondary)]">
            {visibleTabSummary[activeTab]}. Keep this page as the main reading surface, then switch tabs when you want the raw reports, repeated signals, or supporting sources.
          </p>

          {activeTab === "overview" ? (
            <div className="space-y-5">
              <SectionBlock id="overview" title="Overview" description="Reference context that defines the entity and keeps the page grounded." sections={overviewSections} />
              {hasContextSections ? (
                <div className="grid gap-5 xl:grid-cols-2">
                  <SectionBlock id="flow" title="How it normally works" description="Expected steps, common usage, or normal process before you compare any reported problem." sections={grouped.flow} emptyMessage="This section has not been structured yet." compact />
                  <SectionBlock id="risks" title="Risks and red flags" description="Repeated signals, danger points, and protection steps that matter before acting." sections={grouped.risks} tone="warning" emptyMessage="No specific risks have been added yet." compact />
                </div>
              ) : null}
              <SectionBlock id="notes" title="Important notes" description="Extra details, alternatives, or clarifications that round out the context." sections={grouped.notes} emptyMessage="No extra notes have been added yet." />
              <AskAiSection
                id="ask-ai"
                entityTitle={entity.data.title}
                entitySlug={entity.data.slug}
                summaryText={summaryText}
                sectionCount={entity.data.sections.length}
                reportCount={relatedReports.length}
                signalCount={signals.length}
                sourceCount={sources.length}
                riskCount={grouped.risks.length}
              />
            </div>
          ) : null}

          {activeTab === "reports" ? <ReportsPanel reports={relatedReports} entitySlug={entity.data.slug} entityTitle={entity.data.title} /> : null}
          {activeTab === "signals" ? <SignalsPanel signals={signals} /> : null}
          {activeTab === "sources" ? <SourcesPanel sources={sources} /> : null}
        </section>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-28 space-y-4">
          <Card className="rounded-[1.75rem] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Metadata</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div><dt className="text-[var(--text-muted)]">Entity type</dt><dd className="mt-1">{formatEnum(entity.data.entityType)}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Last updated</dt><dd className="mt-1">{formatDate(entity.data.updatedAt)}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Status</dt><dd className="mt-1">{formatEnum(entity.data.status)}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Current tab</dt><dd className="mt-1">{tabLabels[activeTab]}</dd></div>
            </dl>
          </Card>
          <Card className="rounded-[1.75rem] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Counts</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div><dt className="text-[var(--text-muted)]">Sections</dt><dd className="mt-1">{entity.data.sections.length}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Reports</dt><dd className="mt-1">{entity.data._count?.reports ?? 0}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Signals</dt><dd className="mt-1">{signals.length}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Sources</dt><dd className="mt-1">{sources.length}</dd></div>
            </dl>
          </Card>
          <Card className="rounded-[1.75rem] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Reading hint</h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">Use Overview for the grounded explanation first. Then switch into Reports, Signals, and Sources when you want the incoming evidence around this entity.</p>
          </Card>
        </div>
      </aside>
    </div>
  );
}

function isEntityTab(value: string | null): value is EntityTabId {
  return tabIds.includes(value as EntityTabId);
}

function buildEntityTabHref(entitySlug: string, tabId: EntityTabId) {
  return tabId === "overview" ? `/entities/${entitySlug}` : `/entities/${entitySlug}?tab=${tabId}`;
}

function TabLink({ entitySlug, tabId, active, label }: { entitySlug: string; tabId: EntityTabId; active: boolean; label: string }) {
  return (
    <Link
      href={buildEntityTabHref(entitySlug, tabId)}
      className={[
        "inline-flex h-10 items-center rounded-full px-4 font-medium transition",
        active
          ? "bg-[var(--text-primary)] text-[var(--bg-app)]"
          : "bg-[var(--bg-surface)] text-[var(--text-secondary)] shadow-[var(--button-secondary-shadow)] hover:text-[var(--text-primary)]"
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function ReportsPanel({ reports, entitySlug, entityTitle }: { reports: ReportSummary[]; entitySlug: string; entityTitle: string }) {
  return (
    <Card id="reports" className="rounded-[1.75rem] p-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Incoming public reports now live under the entity itself, so you can compare them against the structured overview before reading the raw submissions.</p>
      </div>
      <div className="mt-5 space-y-3">
        {reports.map((report) => (
          <Link key={report.id} href={`/reports/${report.id}`} className="block">
            <Card className="rounded-[1.5rem] p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="default" className="tracking-[0.16em]">REPORT</Badge>
                    <SeverityBadge value={report.severityLevel} />
                    <VerificationBadge value={report.verificationState} />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{report.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--text-secondary)]">{report.narrative}</p>
                </div>
                <div className="text-sm text-[var(--text-muted)] md:text-right">
                  <p>{formatDate(report.happenedAt ?? report.reportedAt)}</p>
                  <p className="mt-1">{formatEnum(report.reportType)}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {reports.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">No public reports are attached yet.</p> : null}
        <Link href={buildContributionHref(entitySlug, entityTitle, "report")} className="inline-flex text-sm font-medium text-[var(--theme-700)] hover:underline">Share the first report</Link>
      </div>
    </Card>
  );
}

function SignalsPanel({ signals }: { signals: PublicSignalSummary[] }) {
  return (
    <Card id="signals" className="rounded-[1.75rem] p-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Signals and patterns</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Public signals connected to this entity, loaded from the shared public signal contract.</p>
      </div>
      <div className="mt-5 space-y-3">
        {signals.length > 0 ? signals.map((signal) => (
          <div key={signal.id} className="rounded-[1.5rem] bg-[var(--bg-surface-muted)] p-4 shadow-[inset_0_0_0_1px_rgba(15,23,32,0.03)] sm:p-5 dark:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={signal.severityLevel === "CRITICAL" || signal.severityLevel === "HIGH" ? "warning" : "theme"}>{formatEnum(signal.signalType)}</Badge>
              <SeverityBadge value={signal.severityLevel} />
              <Badge>{signal.evidenceCount} evidence items</Badge>
              <Badge>{signal.strengthLabel}</Badge>
            </div>
            <h3 className="mt-3 text-lg font-semibold">{signal.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{signal.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)]">
              {signal.lastSeenAt ? <span>Latest activity {formatDate(signal.lastSeenAt)}</span> : null}
              {signal.firstSeenAt ? <span>First seen {formatDate(signal.firstSeenAt)}</span> : null}
              <Link href={`/signals/${signal.slug}`} className="font-medium text-[var(--theme-700)] transition hover:opacity-80">Open signal detail</Link>
            </div>
          </div>
        )) : <p className="text-sm text-[var(--text-secondary)]">No public signals are attached yet.</p>}
      </div>
    </Card>
  );
}

function SourcesPanel({ sources }: { sources: AggregatedSource[] }) {
  return (
    <Card id="sources" className="rounded-[1.75rem] p-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Supporting sources</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Public references that support the structured sections on this entity page.</p>
      </div>
      <div className="mt-5 space-y-4">
        {sources.length > 0 ? sources.map((entry) => (
          <div key={entry.source.id} className="rounded-[1.5rem] bg-[var(--bg-surface-muted)] p-4 shadow-[inset_0_0_0_1px_rgba(15,23,32,0.03)] sm:p-5 dark:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="theme">{formatEnum(entry.source.sourceType)}</Badge>
              {entry.source.publisher ? <Badge>{entry.source.publisher}</Badge> : null}
              {entry.source.reliabilityScore != null ? <Badge tone="info">Reliability {Math.round(entry.source.reliabilityScore * 100)}%</Badge> : null}
              {entry.source.publishedAt ? <Badge>{formatDate(entry.source.publishedAt)}</Badge> : entry.source.retrievedAt ? <Badge>Retrieved {formatDate(entry.source.retrievedAt)}</Badge> : null}
            </div>
            <h3 className="mt-3 text-lg font-semibold">
              {entry.source.url ? <a href={entry.source.url} target="_blank" rel="noreferrer" className="hover:text-[var(--theme-700)]">{entry.source.title}</a> : entry.source.title}
            </h3>
            {entry.source.notes ? <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{entry.source.notes}</p> : null}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--text-muted)]">
              <span>Supports</span>
              {entry.supportingSections.map((section) => (
                <a key={`${entry.source.id}-${section.id}`} href={`#${section.id}`} className="rounded-full bg-[var(--bg-surface)] px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] text-[var(--text-secondary)] shadow-[var(--button-secondary-shadow)]">
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        )) : <p className="text-sm text-[var(--text-secondary)]">No public sources are attached yet. This section will fill in as linked references are added to the entity guidance.</p>}
      </div>
    </Card>
  );
}

function aggregateSources(sections: EntitySection[]): AggregatedSource[] {
  const sourceMap = new Map<string, AggregatedSource>();

  for (const section of sections) {
    for (const link of section.sources ?? []) {
      const existing = sourceMap.get(link.source.id);
      const supportingSection = {
        id: section.id,
        title: section.title,
        sectionType: section.sectionType
      };

      if (existing) {
        if (!existing.supportingSections.some((item) => item.id === section.id)) {
          existing.supportingSections.push(supportingSection);
        }
        continue;
      }

      sourceMap.set(link.source.id, {
        source: link.source,
        supportingSections: [supportingSection]
      });
    }
  }

  return Array.from(sourceMap.values()).sort((left, right) => {
    const leftDate = left.source.publishedAt ?? left.source.retrievedAt ?? "";
    const rightDate = right.source.publishedAt ?? right.source.retrievedAt ?? "";

    return rightDate.localeCompare(leftDate) || left.source.title.localeCompare(right.source.title);
  });
}

function AskAiSection({
  id,
  entityTitle,
  entitySlug,
  summaryText,
  sectionCount,
  reportCount,
  signalCount,
  sourceCount,
  riskCount
}: {
  id: string;
  entityTitle: string;
  entitySlug: string;
  summaryText?: string;
  sectionCount: number;
  reportCount: number;
  signalCount: number;
  sourceCount: number;
  riskCount: number;
}) {
  const promptSuggestions = [
    `Summarize everything important about ${entityTitle}`,
    `What are the biggest red flags for ${entityTitle}?`,
    `Compare the strongest signals and reports for ${entityTitle}`,
    `What should I check before using ${entityTitle}?`
  ];
  const contextLines = [
    `${sectionCount} structured sections`,
    `${reportCount} public reports`,
    `${signalCount} active signals`,
    `${sourceCount} supporting sources`,
    riskCount > 0 ? `${riskCount} risk sections` : null
  ].filter(Boolean) as string[];
  const [draft, setDraft] = useState(promptSuggestions[0]);

  function openAskAi(prompt?: string) {
    if (typeof window === "undefined") return;

    window.dispatchEvent(new CustomEvent("todo:open-public-dock", {
      detail: {
        tool: "ai",
        aiPrompt: (prompt ?? draft).trim(),
        aiContext: {
          scope: "entity",
          entityTitle,
          entitySlug,
          contextLines,
          promptSuggestions
        }
      }
    }));
  }

  return (
    <Card id={id} className="rounded-[1.75rem] p-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Ask AI</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          The strongest AI surface should live here, grounded in this entity&apos;s guidance, reports, signals, and sources rather than acting like a detached chatbot.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {contextLines.map((line) => <Badge key={line}>{line}</Badge>)}
      </div>

      {summaryText ? (
        <div className="mt-4 rounded-[1.25rem] bg-[var(--bg-surface-muted)] px-4 py-3 text-sm leading-6 text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">Current grounding:</span> {summaryText}
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Prompt draft</p>
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={`Ask a grounded question about ${entityTitle}`}
            className="mt-2 min-h-28 rounded-[1.25rem] border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-3 shadow-none"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="primary" className="rounded-full px-4" onClick={() => openAskAi()}>
            Open Ask AI
          </Button>
          <Button type="button" variant="secondary" className="rounded-full px-4" onClick={() => setDraft(promptSuggestions[0])}>
            Reset to summary prompt
          </Button>
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--border-default)] pt-4">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Suggested prompts</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {promptSuggestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setDraft(prompt);
                openAskAi(prompt);
              }}
              className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-muted)] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-[var(--border-default)] pt-4 text-sm text-[var(--text-secondary)]">
        <p>
          This shell is ready for grounded prompting. The next AI layer should answer from connected content and clearly separate canonical guidance, public reports, repeated signals, and supporting sources.
        </p>
      </div>
    </Card>
  );
}

function buildContributionHref(entitySlug: string, entityTitle: string, kind: "report" | "signal" | "source" | "update") {
  const params = new URLSearchParams({
    entitySlug,
    entityTitle,
    kind
  });

  return `/contribute?${params.toString()}`;
}

function SectionBlock({
  id,
  title,
  description,
  sections,
  tone,
  emptyMessage,
  compact = false
}: {
  id: string;
  title: string;
  description?: string;
  sections: { id: string; title: string; content: string; sectionType: string }[];
  tone?: "warning";
  emptyMessage?: string;
  compact?: boolean;
}) {
  return (
    <Card id={id} className="rounded-[1.75rem] p-6">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {description ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p> : null}
      <div className="mt-5 space-y-5">
        {sections.length > 0 ? sections.map((section) => (
          <div
            key={section.id}
            className={tone === "warning"
              ? "rounded-[1.5rem] bg-[var(--warning-bg)] p-4 shadow-[inset_0_0_0_1px_rgba(180,83,9,0.12)] sm:p-5 dark:shadow-[inset_0_0_0_1px_rgba(253,186,116,0.10)]"
              : "rounded-[1.5rem] bg-[var(--bg-surface-muted)] p-4 shadow-[inset_0_0_0_1px_rgba(15,23,32,0.03)] sm:p-5 dark:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]"
            }
          >
            <div className="flex flex-wrap items-center gap-2"><Badge tone={tone === "warning" ? "warning" : "theme"}>{formatEnum(section.sectionType)}</Badge></div>
            <h3 id={section.id} className="mt-3 scroll-mt-28 text-lg font-semibold">{section.title}</h3>
            <p className={compact ? "mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--text-secondary)]" : "mt-2 whitespace-pre-wrap text-[var(--text-secondary)]"}>{section.content}</p>
          </div>
        )) : <p className="text-sm text-[var(--text-secondary)]">{emptyMessage ?? "No content yet."}</p>}
      </div>
    </Card>
  );
}

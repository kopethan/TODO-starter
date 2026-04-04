"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReportSummary } from "@todo/types";
import { Badge, Card, EntityTypeBadge, SeverityBadge, VerificationBadge, formatDate, formatEnum } from "@todo/ui";
import { useEntityBySlug } from "@/features/entities";
import { useReports } from "@/features/reports";

const overviewTypes = new Set(["DEFINITION", "PURPOSE"]);
const flowTypes = new Set(["COMMON_USES", "NORMAL_PROCESS", "SAFE_USAGE"]);
const riskTypes = new Set(["DANGERS", "RED_FLAGS", "COMMON_SCAMS", "HOW_TO_PROTECT_YOURSELF", "WHAT_TO_DO_IF_AFFECTED"]);
const noteTypes = new Set(["NOTES", "RELATED_ALTERNATIVES"]);

const reportTypeSignalMeta: Partial<Record<ReportSummary["reportType"], { title: string; summary: string }>> = {
  SCAM_ATTEMPT: {
    title: "Repeated scam-attempt reports",
    summary: "Multiple approved reports describe attempted deception or pressure tactics connected to this entity."
  },
  FRAUD_LOSS: {
    title: "Loss reports are present",
    summary: "Approved reports include money-loss outcomes, suggesting a pattern that deserves extra caution."
  },
  WARNING: {
    title: "Warnings are recurring",
    summary: "Several approved submissions are framed as warnings rather than isolated neutral experiences."
  },
  SAFETY_INCIDENT: {
    title: "Safety incidents are recurring",
    summary: "Approved reports point to repeated safety-related problems or near-misses tied to this entity."
  },
  QUALITY_ISSUE: {
    title: "Quality issues repeat",
    summary: "Approved reports show repeated quality-related complaints rather than a single one-off issue."
  },
  BAD_EXPERIENCE: {
    title: "Negative experiences repeat",
    summary: "Approved reports show a recurring negative experience pattern around this entity."
  },
  MISUSE_CASE: {
    title: "Misuse cases appear repeatedly",
    summary: "Approved reports suggest misuse or abuse scenarios that repeat often enough to matter."
  }
};

type SignalItem = {
  id: string;
  title: string;
  theme: string;
  summary: string;
  evidenceLabel: string;
  strengthHint: string;
  tone: "theme" | "warning" | "danger" | "info" | "success";
  latestAt?: string | null;
};

export default function EntityPage() {
  const params = useParams<{ slug: string }>();
  const entity = useEntityBySlug(params.slug);
  const reports = useReports(entity.data ? { entityId: entity.data.id, moderationState: "APPROVED" } : {});
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
  const signals = buildEntitySignals(grouped.risks, relatedReports);

  const desktopNav = [
    { id: "overview", label: "Overview" },
    { id: "flow", label: "How it normally works" },
    { id: "risks", label: "Risks and red flags" },
    { id: "reports", label: "Related reports" },
    { id: "signals", label: "Signals and patterns" },
    { id: "notes", label: "Important notes" }
  ];

  const mobileNav = [
    { id: "overview", label: "Overview" },
    { id: "flow", label: "Normal flow" },
    { id: "risks", label: "Risks" },
    { id: "reports", label: "Reports" },
    { id: "signals", label: "Signals" }
  ];

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[220px_minmax(0,1fr)_280px] lg:px-8 lg:py-8">
      <aside className="hidden lg:block">
        <Card className="sticky top-28 rounded-[1.75rem] p-4">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">On this page</p>
          <nav className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
            {desktopNav.map((item) => {
              return <a key={item.id} href={`#${item.id}`} className="block rounded-xl px-2 py-1 transition hover:bg-[var(--bg-surface-muted)] hover:text-[var(--text-primary)]">{item.label}</a>;
            })}
          </nav>
        </Card>
      </aside>
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2 lg:hidden">
          {mobileNav.map((item) => {
            return (
              <a key={item.id} href={`#${item.id}`} className="rounded-full bg-[var(--bg-surface)] px-3 py-1.5 text-sm text-[var(--text-secondary)] shadow-[var(--button-secondary-shadow)]">
                {item.label}
              </a>
            );
          })}
        </div>

        <Card className="rounded-[1.75rem] p-6 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <EntityTypeBadge value={entity.data.entityType} />
            <Badge tone="theme">{entity.data._count?.reports ?? 0} reports</Badge>
            <Badge tone={signals.length > 0 ? "warning" : "default"}>{signals.length} signals</Badge>
            <Badge>{formatEnum(entity.data.status)}</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{entity.data.title}</h1>
          <p className="mt-3 max-w-3xl text-lg text-[var(--text-secondary)]">{entity.data.shortDescription}</p>
          <div className="mt-6 rounded-[1.5rem] bg-[var(--theme-tint)] p-4 sm:p-5 shadow-[inset_0_0_0_1px_rgba(47,91,234,0.08)] dark:shadow-[inset_0_0_0_1px_rgba(125,162,255,0.12)]">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--theme-700)]">What to know first</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text-primary)]">{summaryText}</p>
          </div>
        </Card>

        <SectionBlock id="overview" title="Overview" description="Reference context that defines the entity and keeps the page grounded." sections={overviewSections} />
        <SectionBlock id="flow" title="How it normally works" description="Expected steps, common usage, or normal process before you compare any reported problem." sections={grouped.flow} emptyMessage="This section has not been structured yet." />
        <SectionBlock id="risks" title="Risks and red flags" description="Repeated signals, danger points, and protection steps that matter before acting." sections={grouped.risks} tone="warning" emptyMessage="No specific risks have been added yet." />
        <Card id="reports" className="rounded-[1.75rem] p-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Related reports</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">What people publicly reported about this entity, kept separate from canonical guidance.</p>
          </div>
          <div className="mt-5 space-y-3">
            {relatedReports.slice(0, 5).map((report) => (
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
            {relatedReports.length === 0 ? <p className="text-sm text-[var(--text-secondary)]">No public reports are attached yet.</p> : null}
            <Link href="/reports" className="inline-flex text-sm font-medium text-[var(--theme-700)] hover:underline">Open report archive</Link>
          </div>
        </Card>
        <Card id="signals" className="rounded-[1.75rem] p-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Signals and patterns</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Lightweight public signals derived from approved reports and the structured risk guidance already attached to this entity.</p>
          </div>
          <div className="mt-5 space-y-3">
            {signals.length > 0 ? signals.map((signal) => (
              <div key={signal.id} className="rounded-[1.5rem] bg-[var(--bg-surface-muted)] p-4 shadow-[inset_0_0_0_1px_rgba(15,23,32,0.03)] sm:p-5 dark:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={signal.tone}>{signal.theme}</Badge>
                  <Badge>{signal.evidenceLabel}</Badge>
                  <Badge tone="info">{signal.strengthHint}</Badge>
                  {signal.latestAt ? <Badge>{formatDate(signal.latestAt)}</Badge> : null}
                </div>
                <h3 className="mt-3 text-lg font-semibold">{signal.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{signal.summary}</p>
              </div>
            )) : <p className="text-sm text-[var(--text-secondary)]">No grounded public signals are visible yet. As more approved reports or structured guidance are added, patterns will appear here.</p>}
          </div>
        </Card>
        <SectionBlock id="notes" title="Important notes" description="Extra details, alternatives, or clarifications that round out the context." sections={grouped.notes} emptyMessage="No extra notes have been added yet." />
      </div>
      <aside className="hidden lg:block">
        <div className="sticky top-28 space-y-4">
          <Card className="rounded-[1.75rem] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Metadata</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div><dt className="text-[var(--text-muted)]">Entity type</dt><dd className="mt-1">{formatEnum(entity.data.entityType)}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Last updated</dt><dd className="mt-1">{formatDate(entity.data.updatedAt)}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Status</dt><dd className="mt-1">{formatEnum(entity.data.status)}</dd></div>
            </dl>
          </Card>
          <Card className="rounded-[1.75rem] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Counts</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div><dt className="text-[var(--text-muted)]">Sections</dt><dd className="mt-1">{entity.data.sections.length}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Reports</dt><dd className="mt-1">{entity.data._count?.reports ?? 0}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Signals</dt><dd className="mt-1">{signals.length}</dd></div>
            </dl>
          </Card>
          <Card className="rounded-[1.75rem] p-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Reading hint</h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">Use this page for normal context first, then compare the attached public reports and derived signals to see where experiences start to cluster.</p>
          </Card>
        </div>
      </aside>
    </div>
  );
}

function SectionBlock({
  id,
  title,
  description,
  sections,
  tone,
  emptyMessage
}: {
  id: string;
  title: string;
  description?: string;
  sections: { id: string; title: string; content: string; sectionType: string }[];
  tone?: "warning";
  emptyMessage?: string;
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
            <h3 className="mt-3 text-lg font-semibold">{section.title}</h3>
            <p className="mt-2 whitespace-pre-wrap text-[var(--text-secondary)]">{section.content}</p>
          </div>
        )) : <p className="text-sm text-[var(--text-secondary)]">{emptyMessage ?? "No content yet."}</p>}
      </div>
    </Card>
  );
}

function buildEntitySignals(
  riskSections: { id: string; title: string; content: string; sectionType: string }[],
  reports: ReportSummary[]
): SignalItem[] {
  const signals: SignalItem[] = [];
  const now = Date.now();

  if (riskSections.length > 0) {
    signals.push({
      id: "structured-risk-guidance",
      title: riskSections.length > 1 ? "Structured red flags are documented" : "A structured red flag is documented",
      theme: "Entity guidance",
      summary: riskSections.length > 1
        ? `This entity already has ${riskSections.length} risk-focused guidance sections covering warnings, protection steps, or danger points.`
        : "This entity already has a dedicated risk-focused section that documents a concrete warning or protection step.",
      evidenceLabel: `${riskSections.length} guidance ${riskSections.length === 1 ? "section" : "sections"}`,
      strengthHint: strengthFromCount(riskSections.length),
      tone: "warning"
    });
  }

  const highSeverityReports = reports.filter((report) => ["HIGH", "CRITICAL"].includes(report.severityLevel));
  if (highSeverityReports.length > 0) {
    const latestAt = newestReportDate(highSeverityReports);
    signals.push({
      id: "high-severity-reports",
      title: highSeverityReports.length > 1 ? "High-severity reports are recurring" : "A high-severity report is present",
      theme: "Severity",
      summary: highSeverityReports.length > 1
        ? `Approved public reports include ${highSeverityReports.length} high-severity incidents, suggesting this is not limited to a single low-grade complaint.`
        : "An approved public report has already been tagged high severity for this entity.",
      evidenceLabel: `${highSeverityReports.length} high-severity ${highSeverityReports.length === 1 ? "report" : "reports"}`,
      strengthHint: strengthFromCount(highSeverityReports.length),
      tone: highSeverityReports.some((report) => report.severityLevel === "CRITICAL") ? "danger" : "warning",
      latestAt
    });
  }

  const verifiedReports = reports.filter((report) => report.verificationState === "VERIFIED" || report.verificationState === "PARTIALLY_VERIFIED");
  if (verifiedReports.length > 0) {
    signals.push({
      id: "verified-public-reports",
      title: verifiedReports.length > 1 ? "Verified reports are present" : "A verified report is present",
      theme: "Verification",
      summary: verifiedReports.length > 1
        ? `There are ${verifiedReports.length} approved reports with verified or partially verified status, which gives extra weight to the public pattern.`
        : "At least one approved report has been verified or partially verified, adding more weight than an entirely unverified stream.",
      evidenceLabel: `${verifiedReports.length} verified ${verifiedReports.length === 1 ? "report" : "reports"}`,
      strengthHint: strengthFromCount(verifiedReports.length),
      tone: "info",
      latestAt: newestReportDate(verifiedReports)
    });
  }

  const recentReports = reports.filter((report) => {
    const value = report.happenedAt ?? report.reportedAt;
    if (!value) return false;
    return now - new Date(value).getTime() <= 1000 * 60 * 60 * 24 * 90;
  });
  if (recentReports.length > 0) {
    signals.push({
      id: "recent-public-activity",
      title: recentReports.length > 1 ? "Recent public activity is visible" : "Recent public activity is visible",
      theme: "Freshness",
      summary: recentReports.length > 1
        ? `${recentReports.length} approved reports were filed or happened within roughly the last 90 days, so the public pattern is not purely historical.`
        : "A recent approved report suggests the issue is still active enough to matter now, not only in older history.",
      evidenceLabel: `${recentReports.length} recent ${recentReports.length === 1 ? "report" : "reports"}`,
      strengthHint: strengthFromCount(recentReports.length),
      tone: "theme",
      latestAt: newestReportDate(recentReports)
    });
  }

  const reportTypeCounts = reports.reduce<Record<string, ReportSummary[]>>((accumulator, report) => {
    (accumulator[report.reportType] ??= []).push(report);
    return accumulator;
  }, {});

  const dominantPattern = Object.entries(reportTypeCounts)
    .filter(([, items]) => items.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)[0];

  if (dominantPattern) {
    const [reportType, items] = dominantPattern;
    const meta = reportTypeSignalMeta[reportType as ReportSummary["reportType"]] ?? {
      title: `${formatEnum(reportType)} reports repeat`,
      summary: "A single report theme is showing up repeatedly enough to count as a public pattern."
    };

    signals.push({
      id: `pattern-${reportType.toLowerCase()}`,
      title: meta.title,
      theme: "Repeated theme",
      summary: meta.summary,
      evidenceLabel: `${items.length} related ${items.length === 1 ? "report" : "reports"}`,
      strengthHint: strengthFromCount(items.length),
      tone: "warning",
      latestAt: newestReportDate(items)
    });
  }

  return signals.slice(0, 4);
}

function newestReportDate(reports: ReportSummary[]) {
  return [...reports]
    .map((report) => report.happenedAt ?? report.reportedAt)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ?? null;
}

function strengthFromCount(count: number) {
  if (count >= 4) return "Strong cluster";
  if (count >= 2) return "Repeated pattern";
  return "Single grounded signal";
}

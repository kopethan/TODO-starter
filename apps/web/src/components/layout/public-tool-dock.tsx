"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Select, Textarea, formatEnum } from "@todo/ui";
import { entityTypes, reportTypes, severityLevels, signalSourceKinds, verificationStates } from "@todo/types";

type DockTool = "search" | "filter" | "ai";
type SearchTarget = "entities" | "reports" | "signals";

type PublicAiContext = {
  scope?: "entity" | "contribution";
  title?: string;
  entityTitle?: string;
  entitySlug?: string;
  contextLines?: string[];
  promptSuggestions?: string[];
};

type OpenDockEventDetail = {
  tool?: DockTool;
  aiPrompt?: string;
  aiContext?: PublicAiContext | null;
};

const recentSearchesKey = "todo.public.recent-searches";
const suggestedSearches = [
  "gift card scams",
  "subscription trap",
  "crypto recovery service",
  "fake support call"
];

const entityFilterKeys = ["type"] as const;
const reportFilterKeys = ["entityId", "reportType", "severityLevel", "verificationState", "sort"] as const;
const signalFilterKeys = ["entityType", "severityLevel", "sourceKind", "sort"] as const;

export function PublicToolDock() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const panelRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const currentQuery = searchParams.get("q") ?? "";
  const initialTarget: SearchTarget = pathname?.startsWith("/reports") ? "reports" : pathname?.startsWith("/signals") ? "signals" : "entities";

  const [openTool, setOpenTool] = useState<DockTool | null>(null);
  const [searchValue, setSearchValue] = useState(currentQuery);
  const [searchTarget, setSearchTarget] = useState<SearchTarget>(initialTarget);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiContext, setAiContext] = useState<PublicAiContext | null>(null);

  useEffect(() => {
    setSearchValue(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    setSearchTarget(initialTarget);
  }, [initialTarget]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(recentSearchesKey) ?? "[]");
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.filter((item): item is string => typeof item === "string").slice(0, 6));
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || dockRef.current?.contains(target)) return;
      setOpenTool(null);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenTool(null);
      }
    }

    function handleOpenDock(event: Event) {
      const customEvent = event as CustomEvent<OpenDockEventDetail>;
      const nextTool = customEvent.detail?.tool ?? "search";

      if (typeof customEvent.detail?.aiPrompt === "string") {
        setAiPrompt(customEvent.detail.aiPrompt);
      }
      if (customEvent.detail?.aiContext !== undefined) {
        setAiContext(customEvent.detail.aiContext ?? null);
      }

      setOpenTool(nextTool);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("todo:open-public-dock", handleOpenDock as EventListener);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("todo:open-public-dock", handleOpenDock as EventListener);
    };
  }, []);

  const panelTitle = useMemo(() => {
    if (openTool === "search") return "Search";
    if (openTool === "filter") return "Filter";
    if (openTool === "ai") return "Ask AI";
    return "";
  }, [openTool]);

  function toggleTool(tool: DockTool) {
    setOpenTool((current) => (current === tool ? null : tool));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchValue.trim();

    saveRecentSearch(query);
    setOpenTool(null);
    router.push(buildNavigationUrl(searchTarget, searchParams, query));
  }

  function saveRecentSearch(query: string) {
    const normalized = query.trim();
    if (!normalized) return;

    setRecentSearches((current) => {
      const next = [normalized, ...current.filter((item) => item !== normalized)].slice(0, 6);
      window.localStorage.setItem(recentSearchesKey, JSON.stringify(next));
      return next;
    });
  }

  function applyQuickSearch(query: string, target: SearchTarget = searchTarget) {
    setSearchTarget(target);
    setSearchValue(query);
    saveRecentSearch(query);
    setOpenTool(null);
    router.push(buildNavigationUrl(target, searchParams, query.trim()));
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="pointer-events-auto flex w-full max-w-[38rem] flex-col items-center gap-3">
        {openTool ? (
          <div
            ref={panelRef}
            className="w-full rounded-[1.6rem] border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--bg-surface)_98%,transparent)] px-4 py-3 shadow-[0_-12px_32px_rgba(15,23,42,0.08)] backdrop-blur sm:px-5"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border-default)] pb-2.5">
              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--theme-700)]">Public discovery</p>
                <h2 className="mt-0.5 text-base font-semibold text-[var(--text-primary)]">{panelTitle}</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpenTool(null)}
                className="inline-flex h-8 items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-muted)] px-3 text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
              >
                Close
              </button>
            </div>

            <div className="pt-3">
              {openTool === "search" ? (
                <SearchPanel
                  searchValue={searchValue}
                  setSearchValue={setSearchValue}
                  searchTarget={searchTarget}
                  setSearchTarget={setSearchTarget}
                  recentSearches={recentSearches}
                  onSubmit={submitSearch}
                  onQuickSearch={applyQuickSearch}
                />
              ) : null}
              {openTool === "filter" ? <FilterPanel currentQuery={currentQuery} pathname={pathname ?? "/"} onApply={() => setOpenTool(null)} /> : null}
              {openTool === "ai" ? <AiPanel aiPrompt={aiPrompt} setAiPrompt={setAiPrompt} aiContext={aiContext} /> : null}
            </div>
          </div>
        ) : null}

        <div ref={dockRef} className="flex w-full items-center gap-3">
          <div className="h-px flex-1 bg-[linear-gradient(90deg,transparent,rgba(47,91,234,0.24),rgba(47,91,234,0.24))]" />
          <nav
            className="flex items-center justify-center gap-1 rounded-full border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--bg-surface)_98%,transparent)] p-1 shadow-[0_10px_24px_rgba(15,23,42,0.08)]"
            aria-label="Public tools"
          >
            <DockButton active={openTool === "search"} onClick={() => toggleTool("search")}>Search</DockButton>
            <DockButton active={openTool === "filter"} onClick={() => toggleTool("filter")}>Filter</DockButton>
            <DockButton active={openTool === "ai"} onClick={() => toggleTool("ai")}>Ask AI</DockButton>
          </nav>
          <div className="h-px flex-1 bg-[linear-gradient(90deg,rgba(47,91,234,0.24),rgba(47,91,234,0.24),transparent)]" />
        </div>
      </div>
    </div>
  );
}

function SearchPanel({
  searchValue,
  setSearchValue,
  searchTarget,
  setSearchTarget,
  recentSearches,
  onSubmit,
  onQuickSearch
}: {
  searchValue: string;
  setSearchValue: (value: string) => void;
  searchTarget: SearchTarget;
  setSearchTarget: (value: SearchTarget) => void;
  recentSearches: string[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onQuickSearch: (query: string, target?: SearchTarget) => void;
}) {
  return (
    <div className="space-y-3">
      <form onSubmit={onSubmit} className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <TargetChip active={searchTarget === "entities"} onClick={() => setSearchTarget("entities")}>Entities</TargetChip>
            <TargetChip active={searchTarget === "reports"} onClick={() => setSearchTarget("reports")}>Reports</TargetChip>
            <TargetChip active={searchTarget === "signals"} onClick={() => setSearchTarget("signals")}>Signals</TargetChip>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="h-9 rounded-full px-4 text-sm font-semibold">Search</Button>
            <Button type="button" variant="secondary" className="h-9 rounded-full px-4 text-sm font-semibold" onClick={() => onQuickSearch("", searchTarget)}>
              Clear
            </Button>
          </div>
        </div>
        <Input
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder={searchTarget === "reports" ? "Search reports, entities, or situations" : searchTarget === "signals" ? "Search signals, patterns, or risk themes" : "Search brands, platforms, products, or situations"}
          className="h-10 rounded-[1rem] border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 shadow-none"
        />
      </form>

      <CompactSection label="Recent" empty="No recent searches yet.">
        {recentSearches.map((item) => (
          <InlineBadgeButton key={item} onClick={() => onQuickSearch(item, searchTarget)}>{item}</InlineBadgeButton>
        ))}
      </CompactSection>

      <CompactSection label="Suggested">
        {suggestedSearches.map((item) => (
          <InlineBadgeButton key={item} onClick={() => onQuickSearch(item, searchTarget)}>{item}</InlineBadgeButton>
        ))}
      </CompactSection>
    </div>
  );
}

function FilterPanel({ currentQuery, pathname, onApply }: { currentQuery: string; pathname: string; onApply: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeType: SearchTarget = pathname.startsWith("/reports") ? "reports" : pathname.startsWith("/signals") ? "signals" : "entities";
  const [target, setTarget] = useState<SearchTarget>(activeType);
  const [entityType, setEntityType] = useState(searchParams.get(pathname.startsWith("/signals") ? "entityType" : "type") ?? "");
  const [reportType, setReportType] = useState(searchParams.get("reportType") ?? "");
  const [severityLevel, setSeverityLevel] = useState(searchParams.get("severityLevel") ?? "");
  const [verificationState, setVerificationState] = useState(searchParams.get("verificationState") ?? "");
  const [sourceKind, setSourceKind] = useState(searchParams.get("sourceKind") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? (pathname.startsWith("/signals") ? "strength" : "signal"));

  useEffect(() => {
    setTarget(activeType);
    setEntityType(searchParams.get(pathname.startsWith("/signals") ? "entityType" : "type") ?? "");
    setReportType(searchParams.get("reportType") ?? "");
    setSeverityLevel(searchParams.get("severityLevel") ?? "");
    setVerificationState(searchParams.get("verificationState") ?? "");
    setSourceKind(searchParams.get("sourceKind") ?? "");
    setSort(searchParams.get("sort") ?? (pathname.startsWith("/signals") ? "strength" : "signal"));
  }, [activeType, pathname, searchParams]);

  const appliedLabels = [
    target === "entities" && entityType ? `Type: ${formatEnum(entityType)}` : null,
    target === "reports" && reportType ? `Report: ${formatEnum(reportType)}` : null,
    target === "reports" && severityLevel ? `Severity: ${formatEnum(severityLevel)}` : null,
    target === "reports" && verificationState ? `Verification: ${formatEnum(verificationState)}` : null,
    target === "reports" && sort !== "signal" ? `Sort: ${formatEnum(sort)}` : null,
    target === "signals" && entityType ? `Entity type: ${formatEnum(entityType)}` : null,
    target === "signals" && severityLevel ? `Severity: ${formatEnum(severityLevel)}` : null,
    target === "signals" && sourceKind ? `Source: ${formatEnum(sourceKind)}` : null,
    target === "signals" && sort !== "strength" ? `Sort: ${formatEnum(sort)}` : null
  ].filter(Boolean) as string[];

  function applyFilters() {
    const params = new URLSearchParams();
    if (currentQuery.trim()) params.set("q", currentQuery.trim());

    if (target === "entities") {
      if (entityType) params.set("type", entityType);
    } else if (target === "reports") {
      if (reportType) params.set("reportType", reportType);
      if (severityLevel) params.set("severityLevel", severityLevel);
      if (verificationState) params.set("verificationState", verificationState);
      if (sort && sort !== "signal") params.set("sort", sort);
    } else {
      if (entityType) params.set("entityType", entityType);
      if (severityLevel) params.set("severityLevel", severityLevel);
      if (sourceKind) params.set("sourceKind", sourceKind);
      if (sort && sort !== "strength") params.set("sort", sort);
    }

    const nextPath = target === "reports" ? "/reports" : target === "signals" ? "/signals" : "/";
    router.push(params.toString() ? `${nextPath}?${params.toString()}` : nextPath);
    onApply();
  }

  function clearFilters() {
    setEntityType("");
    setReportType("");
    setSeverityLevel("");
    setVerificationState("");
    setSourceKind("");
    setSort(target === "signals" ? "strength" : "signal");

    const params = new URLSearchParams();
    if (currentQuery.trim()) params.set("q", currentQuery.trim());
    const nextPath = target === "reports" ? "/reports" : target === "signals" ? "/signals" : "/";
    router.push(params.toString() ? `${nextPath}?${params.toString()}` : nextPath);
    onApply();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <TargetChip active={target === "entities"} onClick={() => setTarget("entities")}>Entities</TargetChip>
          <TargetChip active={target === "reports"} onClick={() => setTarget("reports")}>Reports</TargetChip>
          <TargetChip active={target === "signals"} onClick={() => setTarget("signals")}>Signals</TargetChip>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="primary" className="h-9 rounded-full px-4 text-sm font-semibold" onClick={applyFilters}>Apply</Button>
          <Button type="button" variant="secondary" className="h-9 rounded-full px-4 text-sm font-semibold" onClick={clearFilters}>Clear</Button>
        </div>
      </div>

      {target === "entities" ? (
        <div className="grid gap-2">
          <Select value={entityType} onChange={(event) => setEntityType(event.target.value)} className="h-10 rounded-[1rem] bg-[var(--bg-surface)] shadow-none">
            <option value="">All entity types</option>
            {entityTypes.map((value) => <option key={value} value={value}>{formatEnum(value)}</option>)}
          </Select>
        </div>
      ) : target === "reports" ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Select value={reportType} onChange={(event) => setReportType(event.target.value)} className="h-10 rounded-[1rem] bg-[var(--bg-surface)] shadow-none">
            <option value="">All report types</option>
            {reportTypes.map((value) => <option key={value} value={value}>{formatEnum(value)}</option>)}
          </Select>
          <Select value={severityLevel} onChange={(event) => setSeverityLevel(event.target.value)} className="h-10 rounded-[1rem] bg-[var(--bg-surface)] shadow-none">
            <option value="">All severity</option>
            {severityLevels.map((value) => <option key={value} value={value}>{formatEnum(value)}</option>)}
          </Select>
          <Select value={verificationState} onChange={(event) => setVerificationState(event.target.value)} className="h-10 rounded-[1rem] bg-[var(--bg-surface)] shadow-none">
            <option value="">All verification</option>
            {verificationStates.map((value) => <option key={value} value={value}>{formatEnum(value)}</option>)}
          </Select>
          <Select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-[1rem] bg-[var(--bg-surface)] shadow-none">
            <option value="signal">Sort by signal</option>
            <option value="newest">Sort by newest</option>
            <option value="verification">Sort by verification</option>
          </Select>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <Select value={entityType} onChange={(event) => setEntityType(event.target.value)} className="h-10 rounded-[1rem] bg-[var(--bg-surface)] shadow-none">
            <option value="">All entity types</option>
            {entityTypes.map((value) => <option key={value} value={value}>{formatEnum(value)}</option>)}
          </Select>
          <Select value={severityLevel} onChange={(event) => setSeverityLevel(event.target.value)} className="h-10 rounded-[1rem] bg-[var(--bg-surface)] shadow-none">
            <option value="">All severity</option>
            {severityLevels.map((value) => <option key={value} value={value}>{formatEnum(value)}</option>)}
          </Select>
          <Select value={sourceKind} onChange={(event) => setSourceKind(event.target.value)} className="h-10 rounded-[1rem] bg-[var(--bg-surface)] shadow-none">
            <option value="">All signal sources</option>
            {signalSourceKinds.map((value) => <option key={value} value={value}>{formatEnum(value)}</option>)}
          </Select>
          <Select value={sort} onChange={(event) => setSort(event.target.value)} className="h-10 rounded-[1rem] bg-[var(--bg-surface)] shadow-none">
            <option value="strength">Sort by strength</option>
            <option value="newest">Sort by newest</option>
          </Select>
        </div>
      )}

      <CompactSection label="Active state" empty="No extra filters selected.">
        {currentQuery ? <InlineBadge>Query: {currentQuery}</InlineBadge> : null}
        {appliedLabels.map((label) => <InlineBadge key={label}>{label}</InlineBadge>)}
      </CompactSection>
    </div>
  );
}

function AiPanel({
  aiPrompt,
  setAiPrompt,
  aiContext
}: {
  aiPrompt: string;
  setAiPrompt: (value: string) => void;
  aiContext: PublicAiContext | null;
}) {
  const prompts = aiContext?.promptSuggestions?.length
    ? aiContext.promptSuggestions
    : [
        "show common subscription trap patterns",
        "find high risk reports this week",
        "what entities have repeated complaints",
        "compare scam warning signs"
      ];

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {aiContext?.scope === "entity" && aiContext.entityTitle
            ? `Ask about ${aiContext.entityTitle}`
            : aiContext?.scope === "contribution" && aiContext.title
              ? aiContext.title
              : "Grounded assistant entry"}
        </p>
        <p className="text-sm leading-5 text-[var(--text-secondary)]">
          {aiContext?.scope === "entity"
            ? "This shell is scoped to the current entity and should stay grounded in connected guidance, public reports, signals, and sources."
            : aiContext?.scope === "contribution"
              ? "This shell should help classify and structure a contribution draft, ask for missing fields, and preserve the user's meaning before any review step."
              : "Ask AI should stay tied to connected entities and reports, with clear separation between observed facts and inference."}
        </p>
      </div>

      {aiContext?.contextLines?.length ? (
        <CompactSection label="Grounding context">
          {aiContext.contextLines.map((line) => <InlineBadge key={line}>{line}</InlineBadge>)}
        </CompactSection>
      ) : null}

      <div className="space-y-2 border-t border-[var(--border-default)] pt-2.5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Prompt</p>
          <div className="flex gap-2">
            <Button type="button" variant="primary" className="h-9 rounded-full px-4 text-sm font-semibold" onClick={() => setAiPrompt(aiPrompt.trim())}>Keep draft</Button>
            <Button type="button" variant="secondary" className="h-9 rounded-full px-4 text-sm font-semibold" onClick={() => setAiPrompt("")}>Clear</Button>
          </div>
        </div>
        <Textarea
          value={aiPrompt}
          onChange={(event) => setAiPrompt(event.target.value)}
          placeholder={aiContext?.scope === "entity" ? "Ask a grounded question about this entity" : aiContext?.scope === "contribution" ? "Ask for help structuring this contribution draft" : "Ask for a grounded summary or pattern comparison"}
          className="min-h-24 rounded-[1rem] border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-3 shadow-none"
        />
        <p className="text-xs text-[var(--text-muted)]">
          This shell is ready for grounded prompting. Answer generation and citations are the next layer, not faked here.
        </p>
      </div>

      <CompactSection label="Suggested prompts">
        {prompts.map((prompt) => (
          <InlineBadgeButton
            key={prompt}
            onClick={() => {
              setAiPrompt(prompt);
            }}
          >
            {prompt}
          </InlineBadgeButton>
        ))}
      </CompactSection>
    </div>
  );
}

function DockButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex min-w-[5.5rem] items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition",
        active
          ? "bg-[var(--theme-700)] text-white"
          : "bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function TargetChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center rounded-full px-3 py-1.5 text-sm transition",
        active
          ? "bg-[color-mix(in_srgb,var(--theme-700)_12%,white)] text-[var(--theme-700)]"
          : "bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function InlineBadgeButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      className="rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-muted)] px-3 py-1.5 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function InlineBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-surface-muted)] px-3 py-1.5 text-sm text-[var(--text-secondary)]">
      {children}
    </span>
  );
}

function CompactSection({
  label,
  children,
  empty
}: {
  label: string;
  children: ReactNode;
  empty?: ReactNode;
}) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  const hasContent = Array.isArray(items) ? items.length > 0 : Boolean(items);

  return (
    <div className="space-y-1.5 border-t border-[var(--border-default)] pt-2.5 first:border-t-0 first:pt-0">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</p>
      <div className="flex flex-wrap gap-2">{hasContent ? items : <EmptyHint>{empty}</EmptyHint>}</div>
    </div>
  );
}

function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-full border border-dashed border-[var(--border-default)] px-3 py-1.5 text-sm text-[var(--text-muted)]">
      {children}
    </div>
  );
}

function buildNavigationUrl(target: SearchTarget, searchParams: ReturnType<typeof useSearchParams>, query: string) {
  const params = new URLSearchParams();

  if (query) params.set("q", query);

  if (target === "entities") {
    for (const key of entityFilterKeys) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
  } else if (target === "reports") {
    for (const key of reportFilterKeys) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
  } else {
    for (const key of signalFilterKeys) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }
  }

  const nextPath = target === "reports" ? "/reports" : target === "signals" ? "/signals" : "/";
  return params.toString() ? `${nextPath}?${params.toString()}` : nextPath;
}

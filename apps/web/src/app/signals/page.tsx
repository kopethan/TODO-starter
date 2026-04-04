"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge, Card, EntityTypeBadge, SeverityBadge, formatDate, formatEnum } from "@todo/ui";
import { useSignals } from "@/features/signals";

export default function SignalsPage() {
  const searchParams = useSearchParams();
  const filters = {
    q: searchParams.get("q") ?? "",
    entityType: searchParams.get("entityType") ?? "",
    severityLevel: searchParams.get("severityLevel") ?? "",
    sourceKind: searchParams.get("sourceKind") ?? "",
    sort: searchParams.get("sort") ?? "strength",
    page: "1",
    pageSize: "50"
  };

  const signals = useSignals(filters);
  const items = signals.data?.items ?? [];
  const activeFilters = [
    filters.q && `Query: ${filters.q}`,
    filters.entityType && `Entity type: ${formatEnum(filters.entityType)}`,
    filters.severityLevel && `Severity: ${formatEnum(filters.severityLevel)}`,
    filters.sourceKind && `Source: ${formatEnum(filters.sourceKind)}`,
    filters.sort !== "strength" && `Sort: ${formatEnum(filters.sort)}`
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <section className="space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--theme-700)]">Public signals</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Signals and patterns</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">
            This archive is driven by the shared public signals contract. It combines active pattern cards with grounded signal clusters derived from public entity guidance and approved reports.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[var(--border-default)] pt-3 text-sm text-[var(--text-secondary)]">
          {activeFilters.length > 0 ? activeFilters.map((item) => <Badge key={item}>{item}</Badge>) : <span>No extra filters applied.</span>}
        </div>
      </section>

      <div className="space-y-4 pb-4">
        {items.map((signal) => (
          <Card key={signal.id} className="rounded-[1.8rem] p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={signal.sourceKind === "PATTERN_CARD" ? "theme" : signal.sourceKind === "ENTITY_GUIDANCE" ? "info" : "warning"}>
                {formatEnum(signal.sourceKind)}
              </Badge>
              <SeverityBadge value={signal.severityLevel} />
              <Badge>{formatEnum(signal.signalType)}</Badge>
              <Badge>{signal.evidenceCount} evidence</Badge>
              <Badge tone="info">{signal.strengthLabel}</Badge>
            </div>

            <h2 className="mt-4 text-[1.35rem] font-semibold tracking-tight">
              <Link href={`/signals/${signal.slug}`} className="hover:text-[var(--theme-700)]">
                {signal.title}
              </Link>
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{signal.summary}</p>

            {signal.entity ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <EntityTypeBadge value={signal.entity.entityType} />
                <Link href={`/entities/${signal.entity.slug}`} className="font-medium text-[var(--text-primary)] hover:text-[var(--theme-700)]">
                  {signal.entity.title}
                </Link>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--text-muted)]">
              <span>{signal.firstSeenAt ? `First seen ${formatDate(signal.firstSeenAt)}` : "First seen unknown"}</span>
              <div className="flex flex-wrap items-center gap-3">
                <span>{signal.lastSeenAt ? `Latest signal ${formatDate(signal.lastSeenAt)}` : "No latest date yet"}</span>
                <Link href={`/signals/${signal.slug}`} className="font-medium text-[var(--theme-700)] hover:underline">
                  Open signal
                </Link>
              </div>
            </div>
          </Card>
        ))}

        {!signals.isLoading && items.length === 0 ? (
          <Card className="rounded-[1.75rem] p-5 text-sm text-[var(--text-secondary)]">
            No public signals match these filters yet.
          </Card>
        ) : null}
      </div>
    </div>
  );
}

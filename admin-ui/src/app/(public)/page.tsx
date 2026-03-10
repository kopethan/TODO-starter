"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EntityTypeBadge, ModerationBadge } from "@/components/status/badges";
import { useEntities } from "@/features/entities";
import { useReports } from "@/features/reports";
import { formatDate } from "@/lib/utils/format";

export default function HomePage() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const entities = useEntities({ status: "PUBLISHED", visibility: "PUBLIC", q });
  const reports = useReports({ moderationState: "APPROVED" });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-[var(--border-default)] bg-[var(--theme-tint)] px-6 py-14 sm:px-10">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-[var(--text-secondary)]">Trust-aware decisions</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight">Understand how something works, spot red flags, and read structured experiences.</h1>
        <p className="mt-4 max-w-2xl text-[var(--text-secondary)]">TODO helps people evaluate objects, services, and situations through calm structured knowledge instead of noisy feeds.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          ["Understand the normal flow", "See what should usually happen before you judge the risk."],
          ["Spot danger signals", "Notice red flags, suspicious behavior, and warning signs early."],
          ["Read experience reports", "Compare real experiences without losing the difference between facts and claims."]
        ].map(([title, text]) => (
          <Card key={title} className="p-5">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{text}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Featured entities</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Start with canonical pages that explain how things normally work.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(entities.data ?? []).slice(0, 6).map((entity) => (
            <Link key={entity.id} href={`/entities/${entity.slug}`}>
              <Card className="h-full p-5 transition hover:-translate-y-0.5 hover:border-[var(--theme-500)]">
                <div className="flex items-center gap-2"><EntityTypeBadge value={entity.entityType} /></div>
                <h3 className="mt-3 text-lg font-semibold">{entity.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{entity.shortDescription}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4 pb-8">
        <div>
          <h2 className="text-xl font-semibold">Recent reports</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Structured experiences that show how the community is encountering risk.</p>
        </div>
        <div className="space-y-3">
          {(reports.data ?? []).slice(0, 5).map((report) => (
            <Card key={report.id} className="p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{report.entity?.title}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--text-secondary)]">{report.narrative}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <ModerationBadge value={report.moderationState} />
                  <span className="text-xs text-[var(--text-muted)]">{formatDate(report.reportedAt)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Link href="/reports"><Button>View all reports</Button></Link>
      </section>
    </div>
  );
}

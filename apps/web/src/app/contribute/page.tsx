"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PublicContributionDraft, PublicContributionKind, PublicContributionReceipt } from "@todo/types";
import { Badge, Button, Card, Input, Textarea } from "@todo/ui";
import { useContributionDraft, useContributionSubmit } from "../../features/contributions";

type ContributionConfig = {
  label: string;
  shortLabel: string;
  description: string;
  whenToUse: string[];
  fields: string[];
  aiSuggestions: string[];
};

const contributionConfigs: Record<PublicContributionKind, ContributionConfig> = {
  report: {
    label: "Share a report",
    shortLabel: "Report",
    description: "Use this when you experienced a full situation and can describe what happened, when it happened, how it unfolded, and what the outcome was.",
    whenToUse: [
      "A full experience happened and you can narrate it end to end.",
      "You can explain the timeline, severity, and what action you took.",
      "You may also have screenshots, receipts, messages, or other evidence."
    ],
    fields: ["what happened", "when", "how", "severity", "outcome", "optional evidence"],
    aiSuggestions: [
      "Help me structure this into a public report without changing what I mean.",
      "What important report fields are still missing from my draft?",
      "Turn my plain-language account into a report review draft."
    ]
  },
  signal: {
    label: "Share a signal",
    shortLabel: "Signal",
    description: "Use this when you noticed a warning sign, suspicious pattern, or smaller clue that is meaningful but does not need a full report yet.",
    whenToUse: [
      "You noticed a repeated warning sign or anomaly.",
      "The observation is small but useful for pattern building.",
      "You want to flag a clue before a full report is available."
    ],
    fields: ["warning sign", "where it appeared", "why it matters", "freshness", "optional related evidence"],
    aiSuggestions: [
      "Help me decide whether this is a signal or a full report.",
      "Rewrite this as a short signal while preserving the meaning.",
      "What details would make this signal more useful for review?"
    ]
  },
  source: {
    label: "Add a source",
    shortLabel: "Source",
    description: "Use this when you want to attach a public reference such as an article, official statement, document, or archive link that supports the entity guidance.",
    whenToUse: [
      "You have a public reference that supports or updates the page.",
      "You want to cite an article, statement, or document.",
      "You want moderators to review a source before it is attached."
    ],
    fields: ["source title", "link or file reference", "publisher", "why it matters", "which section it supports"],
    aiSuggestions: [
      "Help me turn this reference into a structured source submission.",
      "Summarize what this source supports on the entity page.",
      "What metadata is missing from this source draft?"
    ]
  },
  evidence: {
    label: "Upload evidence",
    shortLabel: "Evidence",
    description: "Use this when you need to attach screenshots, receipts, messages, photos, or other proof that should support a report or signal review.",
    whenToUse: [
      "You already have a report or signal draft and need to support it.",
      "You want to preserve screenshots or receipts for moderation review.",
      "The material is evidence, not a public narrative by itself."
    ],
    fields: ["what the evidence shows", "when it was captured", "how it relates", "privacy or sensitivity notes"],
    aiSuggestions: [
      "Help me describe this evidence without exposing unnecessary private details.",
      "What context should accompany this evidence upload?",
      "Turn this into an evidence summary for moderator review."
    ]
  },
  update: {
    label: "Suggest an update",
    shortLabel: "Update",
    description: "Use this when something on the entity page feels outdated, incomplete, misleading, or missing and you want to suggest a structured improvement.",
    whenToUse: [
      "A page section is outdated or incomplete.",
      "You want to suggest safer wording or a correction.",
      "You want to request a source-backed update instead of posting a new report."
    ],
    fields: ["what should change", "why it should change", "what supports the update", "which section it affects"],
    aiSuggestions: [
      "Help me draft a clear, source-aware update suggestion.",
      "What section of the entity page should this update target?",
      "Turn my note into a structured update request."
    ]
  }
};

const contributionKinds = Object.keys(contributionConfigs) as PublicContributionKind[];

export default function ContributePage() {
  const searchParams = useSearchParams();
  const entitySlug = searchParams.get("entitySlug") ?? "";
  const entityTitle = searchParams.get("entityTitle") ?? "";
  const initialKind = getContributionKind(searchParams.get("kind"));

  const [selectedKind, setSelectedKind] = useState<PublicContributionKind>(initialKind);
  const [draft, setDraft] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [allowPublicDisplay, setAllowPublicDisplay] = useState(true);
  const [structuredDraft, setStructuredDraft] = useState<PublicContributionDraft | null>(null);
  const [receipt, setReceipt] = useState<PublicContributionReceipt | null>(null);

  const draftMutation = useContributionDraft();
  const submitMutation = useContributionSubmit();

  useEffect(() => {
    setSelectedKind(initialKind);
    setDraft(buildDraftTemplate(initialKind, entityTitle));
    setStructuredDraft(null);
    setReceipt(null);
  }, [entityTitle, initialKind]);

  const selectedConfig = contributionConfigs[selectedKind];
  const contextLines = useMemo(() => {
    return [
      entityTitle ? `Entity: ${entityTitle}` : "General information sharing",
      selectedConfig.label,
      "AI should help structure what the user is sharing, not override the meaning.",
      "User review should happen before any final submission."
    ];
  }, [entityTitle, selectedConfig.label]);

  const submitDisabledReason = useMemo(() => {
    if (!structuredDraft) return "Prepare a review draft first.";
    if (!structuredDraft.target.entity) return "Pick a specific entity before submitting for review.";
    return null;
  }, [structuredDraft]);

  function openAskAi() {
    if (typeof window === "undefined") return;

    const prompt = buildAiPrompt({ selectedKind, entityTitle, draft });
    window.dispatchEvent(new CustomEvent("todo:open-public-dock", {
      detail: {
        tool: "ai",
        aiPrompt: prompt,
        aiContext: {
          scope: "contribution",
          title: selectedConfig.label,
          entityTitle: entityTitle || undefined,
          entitySlug: entitySlug || undefined,
          contextLines,
          promptSuggestions: selectedConfig.aiSuggestions
        }
      }
    }));
  }

  function resetDraft(nextKind = selectedKind) {
    setDraft(buildDraftTemplate(nextKind, entityTitle));
    setStructuredDraft(null);
    setReceipt(null);
  }

  async function buildStructuredDraft() {
    const nextDraft = await draftMutation.mutateAsync({
      kind: selectedKind,
      plainText: draft,
      entitySlug: entitySlug || undefined
    });

    setStructuredDraft(nextDraft);
    setReceipt(null);
  }

  async function submitForReview() {
    if (!structuredDraft) return;

    const nextReceipt = await submitMutation.mutateAsync({
      kind: selectedKind,
      plainText: draft,
      entitySlug: entitySlug || undefined,
      title: structuredDraft.title,
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      allowPublicDisplay
    });

    setReceipt(nextReceipt);
  }

  return (
    <div className="mx-auto flex w-full max-w-[64rem] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="theme">SHARE INFORMATION</Badge>
          <Badge>{selectedConfig.shortLabel}</Badge>
          {entityTitle ? <Badge tone="info">Entity linked</Badge> : <Badge>Draft only until an entity is linked</Badge>}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-[2.2rem]">Share information</h1>
          <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
            Start with plain language, then prepare a structured review draft. Reports create pending report records, while signals, sources, evidence, and updates enter moderation as reviewable public submissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          {entityTitle ? (
            <>
              <span className="text-[var(--text-secondary)]">Sharing information about:</span>
              {entitySlug ? (
                <Link href={`/entities/${entitySlug}`} className="font-medium text-[var(--theme-700)] transition hover:opacity-80">
                  {entityTitle}
                </Link>
              ) : (
                <span className="font-medium text-[var(--text-primary)]">{entityTitle}</span>
              )}
            </>
          ) : (
            <span className="text-[var(--text-secondary)]">You can prepare a review draft without an entity, but final submission still needs a specific public entity. Search first, and only suggest a new entity if nothing relevant exists.</span>
          )}
        </div>
      </section>

      <Card className="rounded-[1.75rem] p-5 sm:p-6">
        <div className="space-y-3">
          <div>
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Choose what you are sharing</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Use a structured path instead of a generic post. That keeps review clearer and the public surface more trustworthy.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {contributionKinds.map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => {
                  setSelectedKind(kind);
                  resetDraft(kind);
                }}
                className={[
                  "rounded-full border px-3 py-2 text-sm font-medium transition",
                  selectedKind === kind
                    ? "border-[var(--button-primary-bg)] bg-[var(--button-primary-bg)] text-[var(--button-primary-text)]"
                    : "border-[var(--border-default)] bg-[var(--bg-surface-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
                ].join(" ")}
              >
                {contributionConfigs[kind].label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <Card className="rounded-[1.75rem] p-5 sm:p-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Start with plain language</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Write naturally first. The draft builder will classify the entry, identify missing fields, and prepare a moderation-ready draft without pretending to publish it instantly.</p>
          </div>

          <div className="mt-4 space-y-4">
            <Textarea
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setStructuredDraft(null);
                setReceipt(null);
              }}
              placeholder={`Start a ${selectedConfig.shortLabel.toLowerCase()} in plain language`}
              className="min-h-48 rounded-[1.25rem] border-[var(--border-strong)] bg-[var(--bg-surface)] px-4 py-3 shadow-none"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                placeholder="Optional contact name for moderator follow-up"
                className="rounded-[1rem]"
              />
              <Input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                placeholder="Optional contact email"
                className="rounded-[1rem]"
              />
            </div>

            <label className="flex items-start gap-3 rounded-[1rem] border border-[var(--border-default)] bg-[var(--bg-surface-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              <input
                type="checkbox"
                checked={allowPublicDisplay}
                onChange={(event) => setAllowPublicDisplay(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-[var(--border-strong)]"
              />
              <span>Allow this submission to be eligible for public display after moderation review.</span>
            </label>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="primary" className="rounded-full px-4" onClick={buildStructuredDraft} disabled={draftMutation.isPending || draft.trim().length < 12}>
                {draftMutation.isPending ? "Preparing draft…" : "Prepare review draft"}
              </Button>
              <Button type="button" variant="secondary" className="rounded-full px-4" onClick={openAskAi}>
                Ask AI to structure it
              </Button>
              <Button type="button" variant="secondary" className="rounded-full px-4" onClick={() => resetDraft()}>
                Reset example draft
              </Button>
              <Button type="button" variant="secondary" className="rounded-full px-4" onClick={submitForReview} disabled={Boolean(submitDisabledReason) || submitMutation.isPending}>
                {submitMutation.isPending ? "Submitting…" : "Submit for review"}
              </Button>
            </div>

            {(draftMutation.error || submitMutation.error) ? (
              <div className="rounded-[1rem] border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
                {(draftMutation.error as Error | null)?.message ?? (submitMutation.error as Error | null)?.message}
              </div>
            ) : null}

            <div className="text-xs leading-5 text-[var(--text-muted)]">
              <p>Recommended handoff: plain language → classify → ask for missing fields → draft structured submission → user review → moderation queue.</p>
              {submitDisabledReason ? <p className="mt-1">Current review blocker: {submitDisabledReason}</p> : null}
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="rounded-[1.75rem] p-5 sm:p-6">
            <h2 className="text-xl font-semibold tracking-tight">When to use this path</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{selectedConfig.description}</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">
              {selectedConfig.whenToUse.map((line) => (
                <div key={line} className="rounded-[1.25rem] bg-[var(--bg-surface-muted)] px-4 py-3">
                  {line}
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-[1.75rem] p-5 sm:p-6">
            <h2 className="text-xl font-semibold tracking-tight">Fields the next step should collect</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedConfig.fields.map((field) => (
                <Badge key={field}>{field}</Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {structuredDraft ? (
        <Card className="rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="theme">Structured draft</Badge>
            <Badge>{structuredDraft.submissionMode === "report" ? "Creates pending report" : "Creates reviewable submission"}</Badge>
            {structuredDraft.kind !== structuredDraft.suggestedKind ? <Badge tone="info">Suggested kind: {structuredDraft.suggestedKind}</Badge> : null}
            {structuredDraft.readyForSubmission ? <Badge tone="success">Ready to submit</Badge> : <Badge>Needs more context</Badge>}
          </div>

          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
            <div className="space-y-4">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Draft title</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">{structuredDraft.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{structuredDraft.summary}</p>
              </div>

              <div className="space-y-3">
                {structuredDraft.fields.map((field) => (
                  <div key={field.key} className="rounded-[1rem] border border-[var(--border-default)] bg-[var(--bg-surface-muted)] px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{field.label}</p>
                      {field.missing ? <Badge>Missing</Badge> : <Badge tone="success">Present</Badge>}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{field.value || "Still missing from the draft."}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1rem] border border-[var(--border-default)] bg-[var(--bg-surface-muted)] px-4 py-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Target</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                  {structuredDraft.target.entity ? (
                    <>
                      {structuredDraft.target.entity.title}
                      {structuredDraft.target.section ? ` · ${structuredDraft.target.section.title}` : ""}
                    </>
                  ) : (
                    "Draft only for now. Pick a public entity before submitting."
                  )}
                </p>
              </div>

              <div className="rounded-[1rem] border border-[var(--border-default)] bg-[var(--bg-surface-muted)] px-4 py-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Inferred metadata</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {structuredDraft.normalizedPayload.reportType ? <Badge>{structuredDraft.normalizedPayload.reportType}</Badge> : null}
                  {structuredDraft.normalizedPayload.severityLevel ? <Badge>{structuredDraft.normalizedPayload.severityLevel}</Badge> : null}
                  {structuredDraft.normalizedPayload.outcome ? <Badge>{structuredDraft.normalizedPayload.outcome}</Badge> : null}
                  {structuredDraft.normalizedPayload.sourceType ? <Badge>{structuredDraft.normalizedPayload.sourceType}</Badge> : null}
                  {!structuredDraft.normalizedPayload.reportType
                  && !structuredDraft.normalizedPayload.severityLevel
                  && !structuredDraft.normalizedPayload.outcome
                  && !structuredDraft.normalizedPayload.sourceType ? <span className="text-sm text-[var(--text-secondary)]">No extra inferred metadata yet.</span> : null}
                </div>
              </div>

              <div className="rounded-[1rem] border border-[var(--border-default)] bg-[var(--bg-surface-muted)] px-4 py-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Missing fields</p>
                {structuredDraft.missingFields.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {structuredDraft.missingFields.map((field) => (
                      <Badge key={field}>{field}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">No major field gaps detected in this draft.</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {receipt ? (
        <Card className="rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="success">Submitted</Badge>
            <Badge>{receipt.resourceType}</Badge>
            <Badge>{receipt.status}</Badge>
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">{receipt.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{receipt.message}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {receipt.target.entity ? (
              <Link href={`/entities/${receipt.target.entity.slug}`} className="inline-flex h-10 items-center rounded-full border border-[var(--border-default)] px-4 text-sm font-medium text-[var(--text-primary)] transition hover:bg-[var(--bg-surface-muted)]">
                Back to entity
              </Link>
            ) : null}
            <Button type="button" variant="secondary" className="rounded-full px-4" onClick={() => resetDraft(selectedKind)}>
              Share another item
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function getContributionKind(value: string | null): PublicContributionKind {
  if (value && contributionKinds.includes(value as PublicContributionKind)) {
    return value as PublicContributionKind;
  }

  return "report";
}

function buildDraftTemplate(kind: PublicContributionKind, entityTitle: string) {
  const scopedEntityLine = entityTitle ? `Related entity: ${entityTitle}\n` : "";

  if (kind === "report") {
    return `${scopedEntityLine}What happened:\nWhen did it happen:\nHow did it unfold:\nSeverity or impact:\nOutcome so far:\nEvidence I may have:`;
  }

  if (kind === "signal") {
    return `${scopedEntityLine}Warning sign or pattern:\nWhere I noticed it:\nWhy it seems suspicious:\nHow recent it is:\nRelated evidence if any:`;
  }

  if (kind === "source") {
    return `${scopedEntityLine}Source title:\nLink or reference:\nPublisher or origin:\nWhat it supports on the page:\nWhy it should be attached:`;
  }

  if (kind === "evidence") {
    return `${scopedEntityLine}What the evidence shows:\nWhen it was captured:\nWhat contribution it supports:\nAny privacy or sensitivity note:`;
  }

  return `${scopedEntityLine}What should be updated:\nWhy it should change:\nWhich section it affects:\nWhat supports the update:`;
}

function buildAiPrompt({ selectedKind, entityTitle, draft }: { selectedKind: PublicContributionKind; entityTitle: string; draft: string }) {
  const entityContext = entityTitle ? ` for the entity ${entityTitle}` : "";
  const intro = `Help me structure shared public information as a ${selectedKind}${entityContext}. Preserve my meaning, identify missing fields, and do not pretend to submit anything.`;

  if (!draft.trim()) {
    return intro;
  }

  return `${intro}\n\nCurrent plain-language draft:\n${draft.trim()}`;
}

import { Router } from "express";
import { z } from "zod";
import {
  ContributionStatus,
  ContributionTargetType,
  ContributionType,
  EntityStatus,
  ModerationState,
  UserRole,
  ReportOutcome,
  ReportType,
  SeverityLevel,
  SourceType,
  VerificationState,
  Visibility
} from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { omitUndefined } from "../utils/omit-undefined.js";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, getPagination } from "../utils/pagination.js";

export const contributionsRouter = Router();

const publicContributionKindSchema = z.enum(["report", "signal", "source", "evidence", "update"]);

type PublicContributionKind = z.infer<typeof publicContributionKindSchema>;

type DraftField = {
  key: string;
  label: string;
  value: string | null;
  missing: boolean;
};

type ResolvedTarget = {
  entity: {
    id: string;
    slug: string;
    title: string;
    entityType: string;
  } | null;
  section: {
    id: string;
    title: string;
    sectionType: string;
  } | null;
};

type AppliedContributionMetadata = {
  kind: "source" | "update";
  sectionId: string;
  sectionTitle: string;
  appliedAt: string;
  mode?: "APPEND_NOTE" | "REPLACE_CONTENT" | null;
  sourceId?: string | null;
  sourceTitle?: string | null;
};

type BuiltDraft = {
  kind: PublicContributionKind;
  suggestedKind: PublicContributionKind;
  submissionMode: "report" | "contribution";
  title: string;
  summary: string;
  missingFields: string[];
  readyForSubmission: boolean;
  target: ResolvedTarget;
  fields: DraftField[];
  normalizedPayload: {
    reportType?: ReportType;
    severityLevel?: SeverityLevel;
    outcome?: ReportOutcome | null;
    sourceType?: SourceType;
    structuredData: Record<string, string | null>;
  };
};

const contributionDraftSchema = z.object({
  kind: publicContributionKindSchema.optional(),
  plainText: z.string().trim().min(12),
  entityId: z.string().trim().min(1).optional(),
  entitySlug: z.string().trim().min(1).optional(),
  sectionId: z.string().trim().min(1).optional()
});


const listContributionsQuerySchema = z.object({
  q: z.string().trim().min(1).optional(),
  status: z.nativeEnum(ContributionStatus).optional(),
  kind: publicContributionKindSchema.optional(),
  entityId: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE)
});

const updateContributionSchema = z.object({
  status: z.nativeEnum(ContributionStatus)
});

const contributionApplySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("source"),
    sectionId: z.string().trim().min(1),
    sourceType: z.nativeEnum(SourceType),
    title: z.string().trim().min(3).max(180),
    url: z.string().trim().url().optional(),
    publisher: z.string().trim().min(2).max(180).optional(),
    notes: z.string().trim().min(3).max(4000).optional()
  }),
  z.object({
    kind: z.literal("update"),
    sectionId: z.string().trim().min(1),
    mode: z.enum(["APPEND_NOTE", "REPLACE_CONTENT"]),
    content: z.string().trim().min(8).max(12000)
  })
]);


const contributionSubmitSchema = contributionDraftSchema.extend({
  kind: publicContributionKindSchema,
  title: z.string().trim().min(3).max(140).optional(),
  contactName: z.string().trim().min(2).max(120).optional(),
  contactEmail: z.string().trim().email().optional(),
  allowPublicDisplay: z.boolean().optional()
});

contributionsRouter.get("/contributions", async (req, res, next) => {
  try {
    const query = listContributionsQuerySchema.parse(req.query);

    const andFilters = [
      query.kind
        ? {
            payloadJson: {
              path: ["entryKind"],
              equals: query.kind
            }
          }
        : null,
      query.entityId
        ? {
            payloadJson: {
              path: ["target", "entity", "id"],
              equals: query.entityId
            }
          }
        : null,
      query.q
        ? {
            OR: [
              {
                payloadJson: {
                  path: ["title"],
                  string_contains: query.q,
                  mode: "insensitive" as const
                }
              },
              {
                payloadJson: {
                  path: ["summary"],
                  string_contains: query.q,
                  mode: "insensitive" as const
                }
              },
              {
                payloadJson: {
                  path: ["plainText"],
                  string_contains: query.q,
                  mode: "insensitive" as const
                }
              }
            ]
          }
        : null
    ].filter(Boolean);

    const where = omitUndefined({
      status: query.status,
      AND: andFilters.length > 0 ? andFilters : undefined
    });

    const totalItems = Number(await prisma.contribution.count({ where }));
    const pagination = getPagination(query.page, query.pageSize, totalItems);

    const items = await prisma.contribution.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      }
    });

    res.json({
      items: items.map(mapContributionRecord),
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems: pagination.totalItems,
      totalPages: pagination.totalPages,
      hasNextPage: pagination.hasNextPage,
      hasPreviousPage: pagination.hasPreviousPage
    });
  } catch (error) {
    next(error);
  }
});

contributionsRouter.patch("/contributions/:id", async (req, res, next) => {
  try {
    const body = updateContributionSchema.parse(req.body);
    const moderator = await ensureModerationUser();
    const updated = await prisma.contribution.update({
      where: { id: req.params.id },
      data: {
        status: body.status,
        moderatorId: body.status === ContributionStatus.NEEDS_REVIEW ? null : moderator.id,
        reviewedAt: body.status === ContributionStatus.NEEDS_REVIEW ? null : new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      }
    });

    res.json(mapContributionRecord(updated));
  } catch (error) {
    next(error);
  }
});


contributionsRouter.post("/contributions/:id/apply", async (req, res, next) => {
  try {
    const body = contributionApplySchema.parse(req.body);
    const existing = await prisma.contribution.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      }
    });

    if (!existing) {
      res.status(404).json({ message: "Contribution not found." });
      return;
    }

    const payload = storedContributionPayloadSchema.safeParse(existing.payloadJson);
    const value = payload.success ? payload.data : {};

    if (existing.status !== ContributionStatus.APPROVED) {
      res.status(400).json({ message: "Approve the contribution before applying it to entity content." });
      return;
    }

    if (value.applied?.appliedAt) {
      res.status(409).json({ message: "This contribution has already been applied." });
      return;
    }

    if (value.entryKind !== body.kind) {
      res.status(400).json({ message: "This contribution cannot be applied with the selected flow." });
      return;
    }

    const moderator = await ensureModerationUser();
    const targetEntityId = await resolveContributionEntityId(existing.targetType, existing.targetId, value.target?.entity?.id ?? null);

    if (!targetEntityId) {
      res.status(400).json({ message: "A valid target entity is required before this contribution can be applied." });
      return;
    }

    const section = await prisma.entitySection.findFirst({
      where: {
        id: body.sectionId,
        entityId: targetEntityId
      },
      select: {
        id: true,
        title: true,
        content: true
      }
    });

    if (!section) {
      res.status(400).json({ message: "Choose a valid target section on the linked entity." });
      return;
    }

    const currentPayload = getPayloadObject(existing.payloadJson);

    if (body.kind === "source") {
      const result = await prisma.$transaction(async (tx) => {
        const source = await tx.source.create({
          data: omitUndefined({
            sourceType: body.sourceType,
            title: body.title,
            url: body.url,
            publisher: body.publisher,
            notes: body.notes
          })
        });

        await tx.sectionSourceLink.create({
          data: {
            sectionId: section.id,
            sourceId: source.id
          }
        });

        const applied: AppliedContributionMetadata = {
          kind: "source",
          sectionId: section.id,
          sectionTitle: section.title,
          appliedAt: new Date().toISOString(),
          sourceId: source.id,
          sourceTitle: source.title
        };

        const contribution = await tx.contribution.update({
          where: { id: existing.id },
          data: {
            moderatorId: moderator.id,
            reviewedAt: new Date(),
            payloadJson: {
              ...currentPayload,
              applied
            }
          },
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true
              }
            }
          }
        });

        return { contribution, appliedResource: { kind: "source" as const, sectionId: section.id, sourceId: source.id, sourceTitle: source.title } };
      });

      res.json({
        contribution: mapContributionRecord(result.contribution),
        appliedResource: result.appliedResource
      });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const nextContent = body.mode === "REPLACE_CONTENT"
        ? body.content.trim()
        : [section.content.trim(), "", `Moderator-applied update (${new Date().toISOString().slice(0, 10)}):`, body.content.trim()].filter(Boolean).join("\n");

      await tx.entitySection.update({
        where: { id: section.id },
        data: {
          content: nextContent
        }
      });

      const applied: AppliedContributionMetadata = {
        kind: "update",
        sectionId: section.id,
        sectionTitle: section.title,
        appliedAt: new Date().toISOString(),
        mode: body.mode
      };

      const contribution = await tx.contribution.update({
        where: { id: existing.id },
        data: {
          moderatorId: moderator.id,
          reviewedAt: new Date(),
          payloadJson: {
            ...currentPayload,
            applied
          }
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              email: true
            }
          }
        }
      });

      return { contribution, appliedResource: { kind: "update" as const, sectionId: section.id, mode: body.mode } };
    });

    res.json({
      contribution: mapContributionRecord(result.contribution),
      appliedResource: result.appliedResource
    });
  } catch (error) {
    next(error);
  }
});

contributionsRouter.post("/contributions/draft", async (req, res, next) => {
  try {
    const body = contributionDraftSchema.parse(req.body);
    const target = await resolveTarget(body);
    const builtDraft = buildContributionDraft({
      kind: body.kind,
      plainText: body.plainText,
      target
    });

    res.json(builtDraft);
  } catch (error) {
    next(error);
  }
});

contributionsRouter.post("/contributions/submit", async (req, res, next) => {
  try {
    const body = contributionSubmitSchema.parse(req.body);
    const target = await resolveTarget(body);
    const builtDraft = buildContributionDraft({
      kind: body.kind,
      plainText: body.plainText,
      target
    });

    if (!target.entity) {
      res.status(400).json({ message: "A public submission currently needs to be attached to a specific entity." });
      return;
    }

    if (builtDraft.kind === "report") {
      const submitter = await ensurePublicSubmitterUser();
      const created = await prisma.experienceReport.create({
        data: omitUndefined({
          entityId: target.entity.id,
          userId: submitter.id,
          reportType: builtDraft.normalizedPayload.reportType ?? ReportType.WARNING,
          title: body.title ?? builtDraft.title,
          narrative: body.plainText.trim(),
          happenedAt: parsePossibleDate(builtDraft.normalizedPayload.structuredData.when),
          outcome: builtDraft.normalizedPayload.outcome ?? undefined,
          severityLevel: builtDraft.normalizedPayload.severityLevel ?? SeverityLevel.MEDIUM,
          moderationState: ModerationState.PENDING,
          verificationState: VerificationState.UNVERIFIED,
          isAnonymous: true,
          isPublic: body.allowPublicDisplay ?? true
        })
      });

      res.status(201).json({
        id: created.id,
        resourceType: "REPORT",
        kind: builtDraft.kind,
        status: created.moderationState,
        title: created.title,
        createdAt: created.reportedAt,
        target,
        message: builtDraft.missingFields.length > 0
          ? "Report submitted for moderation review with some fields still incomplete."
          : "Report submitted for moderation review."
      });
      return;
    }

    const submitter = await ensurePublicSubmitterUser();
    const created = await prisma.contribution.create({
      data: {
        userId: submitter.id,
        targetType: target.section ? ContributionTargetType.ENTITY_SECTION : ContributionTargetType.ENTITY,
        targetId: target.section?.id ?? target.entity.id,
        contributionType: mapContributionType(builtDraft.kind),
        status: ContributionStatus.NEEDS_REVIEW,
        payloadJson: {
          entryKind: builtDraft.kind,
          title: body.title ?? builtDraft.title,
          summary: builtDraft.summary,
          plainText: body.plainText.trim(),
          missingFields: builtDraft.missingFields,
          suggestedKind: builtDraft.suggestedKind,
          structuredData: builtDraft.normalizedPayload.structuredData,
          inferred: {
            reportType: builtDraft.normalizedPayload.reportType ?? null,
            severityLevel: builtDraft.normalizedPayload.severityLevel ?? null,
            outcome: builtDraft.normalizedPayload.outcome ?? null,
            sourceType: builtDraft.normalizedPayload.sourceType ?? null
          },
          target,
          contact: {
            name: body.contactName ?? null,
            email: body.contactEmail ?? null
          },
          allowPublicDisplay: body.allowPublicDisplay ?? true
        }
      }
    });

    res.status(201).json({
      id: created.id,
      resourceType: "CONTRIBUTION",
      kind: builtDraft.kind,
      status: created.status,
      title: body.title ?? builtDraft.title,
      createdAt: created.createdAt,
      target,
      message: builtDraft.missingFields.length > 0
        ? "Contribution submitted for review with some fields still incomplete."
        : "Contribution submitted for review."
    });
  } catch (error) {
    next(error);
  }
});

async function resolveTarget(input: z.infer<typeof contributionDraftSchema>): Promise<ResolvedTarget> {
  if (input.sectionId) {
    const section = await prisma.entitySection.findUnique({
      where: { id: input.sectionId },
      include: {
        entity: {
          select: {
            id: true,
            slug: true,
            title: true,
            entityType: true,
            status: true,
            visibility: true
          }
        }
      }
    });

    if (!section) {
      return { entity: null, section: null };
    }

    if (section.entity.status !== EntityStatus.PUBLISHED || section.entity.visibility !== Visibility.PUBLIC) {
      return { entity: null, section: null };
    }

    return {
      entity: {
        id: section.entity.id,
        slug: section.entity.slug,
        title: section.entity.title,
        entityType: section.entity.entityType
      },
      section: {
        id: section.id,
        title: section.title,
        sectionType: section.sectionType
      }
    };
  }

  const entity = input.entityId
    ? await prisma.entity.findUnique({
        where: { id: input.entityId },
        select: {
          id: true,
          slug: true,
          title: true,
          entityType: true,
          status: true,
          visibility: true
        }
      })
    : input.entitySlug
      ? await prisma.entity.findUnique({
          where: { slug: input.entitySlug },
          select: {
            id: true,
            slug: true,
            title: true,
            entityType: true,
            status: true,
            visibility: true
          }
        })
      : null;

  if (!entity) {
    return { entity: null, section: null };
  }

  if (entity.status !== EntityStatus.PUBLISHED || entity.visibility !== Visibility.PUBLIC) {
    return { entity: null, section: null };
  }

  return {
    entity: {
      id: entity.id,
      slug: entity.slug,
      title: entity.title,
      entityType: entity.entityType
    },
    section: null
  };
}

function buildContributionDraft({ kind, plainText, target }: { kind?: PublicContributionKind; plainText: string; target: ResolvedTarget }): BuiltDraft {
  const trimmed = plainText.trim();
  const suggestedKind = inferContributionKind(trimmed);
  const resolvedKind = kind ?? suggestedKind;
  const extracted = extractStructuredData(resolvedKind, trimmed);
  const fields = getDraftFields(resolvedKind, extracted);
  const missingFields = fields.filter((field) => field.missing).map((field) => field.label);
  const reportType = resolvedKind === "report" ? inferReportType(trimmed) : undefined;
  const severityLevel = inferSeverityLevel(trimmed, extracted);
  const outcome = resolvedKind === "report" ? inferReportOutcome(trimmed, extracted) : null;
  const sourceType = resolvedKind === "source" ? inferSourceType(trimmed, extracted) : undefined;
  const summary = buildSummary(trimmed, extracted, resolvedKind);
  const title = buildTitle({ kind: resolvedKind, target, extracted, plainText: trimmed });

  return {
    kind: resolvedKind,
    suggestedKind,
    submissionMode: resolvedKind === "report" ? "report" : "contribution",
    title,
    summary,
    missingFields,
    readyForSubmission: Boolean(target.entity) && missingFields.length <= 2,
    target,
    fields,
    normalizedPayload: {
      reportType,
      severityLevel,
      outcome,
      sourceType,
      structuredData: extracted
    }
  };
}

function inferContributionKind(plainText: string): PublicContributionKind {
  const value = plainText.toLowerCase();

  if (/(https?:\/\/|source title|publisher|official statement|article|document)/.test(value)) {
    return "source";
  }

  if (/(screenshot|receipt|photo|evidence|email|message|attachment)/.test(value)) {
    return "evidence";
  }

  if (/(warning sign|pattern|anomaly|clue|signal)/.test(value)) {
    return "signal";
  }

  if (/(update|outdated|incorrect|misleading|should change|correction)/.test(value)) {
    return "update";
  }

  return "report";
}

function extractStructuredData(kind: PublicContributionKind, plainText: string): Record<string, string | null> {
  const parsedLines = parseColonLines(plainText);

  if (kind === "report") {
    return {
      whatHappened: getFieldValue(parsedLines, ["what happened"]),
      when: getFieldValue(parsedLines, ["when", "when did it happen"]),
      how: getFieldValue(parsedLines, ["how", "how did it unfold"]),
      severity: getFieldValue(parsedLines, ["severity", "severity or impact"]),
      outcome: getFieldValue(parsedLines, ["outcome", "outcome so far"]),
      evidence: getFieldValue(parsedLines, ["evidence", "evidence i may have"])
    };
  }

  if (kind === "signal") {
    return {
      warningSign: getFieldValue(parsedLines, ["warning sign", "warning sign or pattern"]),
      whereAppeared: getFieldValue(parsedLines, ["where it appeared", "where i noticed it"]),
      whyItMatters: getFieldValue(parsedLines, ["why it matters", "why it seems suspicious"]),
      freshness: getFieldValue(parsedLines, ["freshness", "how recent it is"]),
      relatedEvidence: getFieldValue(parsedLines, ["related evidence", "related evidence if any"])
    };
  }

  if (kind === "source") {
    return {
      sourceTitle: getFieldValue(parsedLines, ["source title"]),
      link: getFieldValue(parsedLines, ["link", "link or reference"]),
      publisher: getFieldValue(parsedLines, ["publisher", "publisher or origin"]),
      supports: getFieldValue(parsedLines, ["what it supports on the page", "which section it supports"]),
      whyItMatters: getFieldValue(parsedLines, ["why it matters", "why it should be attached"])
    };
  }

  if (kind === "evidence") {
    return {
      evidenceSummary: getFieldValue(parsedLines, ["what the evidence shows"]),
      capturedAt: getFieldValue(parsedLines, ["when it was captured"]),
      supports: getFieldValue(parsedLines, ["what contribution it supports", "how it relates"]),
      privacyNotes: getFieldValue(parsedLines, ["privacy or sensitivity note", "any privacy or sensitivity note"])
    };
  }

  return {
    changeRequest: getFieldValue(parsedLines, ["what should change"]),
    reason: getFieldValue(parsedLines, ["why it should change"]),
    affectedSection: getFieldValue(parsedLines, ["which section it affects"]),
    support: getFieldValue(parsedLines, ["what supports the update", "what supports the change"])
  } satisfies Record<string, string | null>;
}

function getDraftFields(kind: PublicContributionKind, extracted: Record<string, string | null>): DraftField[] {
  if (kind === "report") {
    return [
      mapDraftField("whatHappened", "What happened", extracted),
      mapDraftField("when", "When", extracted),
      mapDraftField("how", "How", extracted),
      mapDraftField("severity", "Severity", extracted),
      mapDraftField("outcome", "Outcome", extracted),
      mapDraftField("evidence", "Evidence", extracted, true)
    ];
  }

  if (kind === "signal") {
    return [
      mapDraftField("warningSign", "Warning sign", extracted),
      mapDraftField("whereAppeared", "Where it appeared", extracted),
      mapDraftField("whyItMatters", "Why it matters", extracted),
      mapDraftField("freshness", "Freshness", extracted, true),
      mapDraftField("relatedEvidence", "Related evidence", extracted, true)
    ];
  }

  if (kind === "source") {
    return [
      mapDraftField("sourceTitle", "Source title", extracted),
      mapDraftField("link", "Link or reference", extracted),
      mapDraftField("publisher", "Publisher or origin", extracted, true),
      mapDraftField("supports", "What it supports", extracted),
      mapDraftField("whyItMatters", "Why it matters", extracted)
    ];
  }

  if (kind === "evidence") {
    return [
      mapDraftField("evidenceSummary", "What the evidence shows", extracted),
      mapDraftField("capturedAt", "When it was captured", extracted, true),
      mapDraftField("supports", "What it supports", extracted),
      mapDraftField("privacyNotes", "Privacy or sensitivity note", extracted, true)
    ];
  }

  return [
    mapDraftField("changeRequest", "What should change", extracted),
    mapDraftField("reason", "Why it should change", extracted),
    mapDraftField("affectedSection", "Which section it affects", extracted),
    mapDraftField("support", "What supports the update", extracted, true)
  ];
}

function mapDraftField(key: string, label: string, extracted: Record<string, string | null>, optional = false): DraftField {
  const value = extracted[key] ?? null;
  return {
    key,
    label,
    value,
    missing: optional ? false : !value
  };
}

function inferReportType(plainText: string): ReportType {
  const value = plainText.toLowerCase();

  if (/money lost|lost money|fraud loss|stolen funds/.test(value)) return ReportType.FRAUD_LOSS;
  if (/scam|phish|spoof|fake adviser|fake bank|fake seller/.test(value)) return ReportType.SCAM_ATTEMPT;
  if (/safety|injury|danger|unsafe|hazard/.test(value)) return ReportType.SAFETY_INCIDENT;
  if (/warning/.test(value)) return ReportType.WARNING;
  if (/quality|broken|defect|damaged/.test(value)) return ReportType.QUALITY_ISSUE;
  if (/misuse|abuse/.test(value)) return ReportType.MISUSE_CASE;
  if (/good|fine|resolved safely|normal experience/.test(value)) return ReportType.NORMAL_EXPERIENCE;
  return ReportType.BAD_EXPERIENCE;
}

function inferSeverityLevel(plainText: string, extracted: Record<string, string | null>): SeverityLevel {
  const combined = `${plainText}\n${Object.values(extracted).filter(Boolean).join("\n")}`.toLowerCase();

  if (/(critical|life threatening|injury|account compromised|stolen funds|major loss)/.test(combined)) return SeverityLevel.CRITICAL;
  if (/(high|urgent|serious|significant|large loss|bank transfer)/.test(combined)) return SeverityLevel.HIGH;
  if (/(medium|moderate|concerning|repeated)/.test(combined)) return SeverityLevel.MEDIUM;
  return SeverityLevel.LOW;
}

function inferReportOutcome(plainText: string, extracted: Record<string, string | null>): ReportOutcome | null {
  const combined = `${plainText}\n${extracted.outcome ?? ""}`.toLowerCase();

  if (/money lost|lost money/.test(combined)) return ReportOutcome.MONEY_LOST;
  if (/time lost|wasted time/.test(combined)) return ReportOutcome.TIME_LOST;
  if (/account compromised|account hacked/.test(combined)) return ReportOutcome.ACCOUNT_COMPROMISED;
  if (/item damaged|damaged/.test(combined)) return ReportOutcome.ITEM_DAMAGED;
  if (/injury|hurt/.test(combined)) return ReportOutcome.INJURY;
  if (/near miss/.test(combined)) return ReportOutcome.NEAR_MISS;
  if (/resolved|fixed/.test(combined)) return ReportOutcome.RESOLVED;
  if (/safe/.test(combined)) return ReportOutcome.SAFE;
  if (/not resolved|unresolved/.test(combined)) return ReportOutcome.NOT_RESOLVED;
  return null;
}

function inferSourceType(plainText: string, extracted: Record<string, string | null>): SourceType {
  const combined = `${plainText}\n${extracted.publisher ?? ""}\n${extracted.link ?? ""}`.toLowerCase();

  if (/official|gov|bank|support\.|help\./.test(combined)) return SourceType.OFFICIAL;
  if (/brand|company|press release/.test(combined)) return SourceType.BRAND_OFFICIAL;
  if (/news|article|journalist|press/.test(combined)) return SourceType.NEWS;
  if (/dataset|data/.test(combined)) return SourceType.PUBLIC_DATASET;
  return SourceType.OTHER;
}

function buildSummary(plainText: string, extracted: Record<string, string | null>, kind: PublicContributionKind) {
  const prioritized = Object.values(extracted).filter(Boolean);
  const candidate = prioritized[0] ?? plainText;
  const normalized = candidate.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return kind === "report"
      ? "A structured report draft is ready for review."
      : "A structured contribution draft is ready for review.";
  }

  return normalized.length > 220 ? `${normalized.slice(0, 217)}…` : normalized;
}

function buildTitle({ kind, target, extracted, plainText }: { kind: PublicContributionKind; target: ResolvedTarget; extracted: Record<string, string | null>; plainText: string }) {
  const entityTitle = target.entity?.title ?? "this entity";
  const preferred =
    extracted.whatHappened
    ?? extracted.warningSign
    ?? extracted.sourceTitle
    ?? extracted.changeRequest
    ?? extracted.evidenceSummary;

  if (preferred) {
    const compact = preferred.replace(/\s+/g, " ").trim();
    return compact.length > 90 ? `${compact.slice(0, 87)}…` : compact;
  }

  if (kind === "report") return `Report for ${entityTitle}`;
  if (kind === "signal") return `Signal for ${entityTitle}`;
  if (kind === "source") return `Source suggestion for ${entityTitle}`;
  if (kind === "evidence") return `Evidence note for ${entityTitle}`;
  if (kind === "update") return `Update suggestion for ${entityTitle}`;

  const fallback = plainText.replace(/\s+/g, " ").trim();
  return fallback.length > 90 ? `${fallback.slice(0, 87)}…` : fallback;
}

function parseColonLines(plainText: string) {
  const map = new Map<string, string>();

  for (const rawLine of plainText.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;

    const separatorIndex = line.indexOf(":");
    if (separatorIndex === -1) continue;

    const rawKey = line.slice(0, separatorIndex).trim().toLowerCase();
    const rawValue = line.slice(separatorIndex + 1).trim();

    if (!rawKey) continue;

    map.set(normalizeKey(rawKey), rawValue || "");
  }

  return map;
}

function normalizeKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getFieldValue(parsedLines: Map<string, string>, labels: string[]) {
  for (const label of labels) {
    const value = parsedLines.get(normalizeKey(label));
    if (value) return value;
  }

  return null;
}

function parsePossibleDate(value: string | null | undefined) {
  if (!value) return undefined;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return undefined;
  return new Date(timestamp);
}

async function ensurePublicSubmitterUser() {
  return prisma.user.upsert({
    where: { email: "public-contributor@todo.local" },
    update: {
      displayName: "Public Contributor"
    },
    create: {
      email: "public-contributor@todo.local",
      username: "todo-public-contributor",
      displayName: "Public Contributor"
    }
  });
}

function mapContributionType(kind: PublicContributionKind) {
  if (kind === "source") return ContributionType.ADD_SOURCE;
  if (kind === "update") return ContributionType.SUGGEST_EDIT;
  return ContributionType.ADD_WARNING;
}

const storedContributionPayloadSchema = z.object({
  entryKind: publicContributionKindSchema.nullish(),
  title: z.string().nullish(),
  summary: z.string().nullish(),
  plainText: z.string().nullish(),
  missingFields: z.array(z.string()).nullish(),
  suggestedKind: publicContributionKindSchema.nullish(),
  structuredData: z.record(z.string(), z.string().nullable()).nullish(),
  inferred: z
    .object({
      reportType: z.nativeEnum(ReportType).nullish(),
      severityLevel: z.nativeEnum(SeverityLevel).nullish(),
      outcome: z.nativeEnum(ReportOutcome).nullish(),
      sourceType: z.nativeEnum(SourceType).nullish()
    })
    .partial()
    .nullish(),
  target: z
    .object({
      entity: z
        .object({
          id: z.string(),
          slug: z.string(),
          title: z.string(),
          entityType: z.string()
        })
        .nullish(),
      section: z
        .object({
          id: z.string(),
          title: z.string(),
          sectionType: z.string()
        })
        .nullish()
    })
    .partial()
    .nullish(),
  contact: z
    .object({
      name: z.string().nullish(),
      email: z.string().nullish()
    })
    .partial()
    .nullish(),
  allowPublicDisplay: z.boolean().nullish(),
  applied: z
    .object({
      kind: z.enum(["source", "update"]),
      sectionId: z.string(),
      sectionTitle: z.string(),
      appliedAt: z.string(),
      mode: z.enum(["APPEND_NOTE", "REPLACE_CONTENT"]).nullish(),
      sourceId: z.string().nullish(),
      sourceTitle: z.string().nullish()
    })
    .partial()
    .nullish()
});

function mapContributionRecord(
  record: Awaited<ReturnType<typeof prisma.contribution.findFirstOrThrow>> & {
    user?: {
      id: string;
      displayName: string;
      email: string;
    } | null;
  }
) {
  const payload = storedContributionPayloadSchema.safeParse(record.payloadJson);
  const value = payload.success ? payload.data : {};

  return {
    id: record.id,
    status: record.status,
    contributionType: record.contributionType,
    targetType: record.targetType,
    createdAt: record.createdAt,
    reviewedAt: record.reviewedAt,
    title: value.title ?? `Contribution ${record.id}`,
    summary: value.summary ?? "No summary available.",
    plainText: value.plainText ?? undefined,
    entryKind: value.entryKind ?? null,
    suggestedKind: value.suggestedKind ?? null,
    missingFields: value.missingFields ?? [],
    allowPublicDisplay: value.allowPublicDisplay ?? null,
    target: {
      entity: value.target?.entity ?? null,
      section: value.target?.section ?? null
    },
    contact: value.contact
      ? {
          name: value.contact.name ?? null,
          email: value.contact.email ?? null
        }
      : null,
    inferred: value.inferred
      ? {
          reportType: value.inferred.reportType ?? null,
          severityLevel: value.inferred.severityLevel ?? null,
          outcome: value.inferred.outcome ?? null,
          sourceType: value.inferred.sourceType ?? null
        }
      : null,
    structuredData: value.structuredData ?? {},
    applied: value.applied
      ? {
          kind: value.applied.kind ?? "update",
          sectionId: value.applied.sectionId ?? "",
          sectionTitle: value.applied.sectionTitle ?? "",
          appliedAt: value.applied.appliedAt ?? record.reviewedAt?.toISOString() ?? record.createdAt.toISOString(),
          mode: value.applied.mode ?? null,
          sourceId: value.applied.sourceId ?? null,
          sourceTitle: value.applied.sourceTitle ?? null
        }
      : null,
    submittedBy: record.user
      ? {
          id: record.user.id,
          displayName: record.user.displayName,
          email: record.user.email
        }
      : null
  };
}

function getPayloadObject(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

async function resolveContributionEntityId(targetType: ContributionTargetType, targetId: string, payloadEntityId: string | null) {
  if (payloadEntityId) return payloadEntityId;
  if (targetType === ContributionTargetType.ENTITY) return targetId;
  if (targetType !== ContributionTargetType.ENTITY_SECTION) return null;

  const section = await prisma.entitySection.findUnique({
    where: { id: targetId },
    select: { entityId: true }
  });

  return section?.entityId ?? null;
}

async function ensureModerationUser() {
  return prisma.user.upsert({
    where: { email: "moderator@todo.local" },
    update: {
      displayName: "TODO Moderator",
      role: UserRole.ADMIN
    },
    create: {
      email: "moderator@todo.local",
      username: "todo-moderator",
      displayName: "TODO Moderator",
      role: UserRole.ADMIN
    }
  });
}

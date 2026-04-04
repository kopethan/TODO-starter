import { Router } from "express";
import { z } from "zod";
import { EntityStatus, EntityType, ModerationState, PatternStatus, SeverityLevel, VerificationState, Visibility } from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, getPagination } from "../utils/pagination.js";

export const signalsRouter = Router();

const riskSectionTypes = [
  "DANGERS",
  "RED_FLAGS",
  "COMMON_SCAMS",
  "HOW_TO_PROTECT_YOURSELF",
  "WHAT_TO_DO_IF_AFFECTED"
] as const;

const signalSourceKinds = ["PATTERN_CARD", "REPORT_CLUSTER", "ENTITY_GUIDANCE"] as const;
const signalSortOptions = ["strength", "newest"] as const;

const listSignalsQuerySchema = z.object({
  entityId: z.string().optional(),
  entityType: z.nativeEnum(EntityType).optional(),
  severityLevel: z.nativeEnum(SeverityLevel).optional(),
  sourceKind: z.enum(signalSourceKinds).optional(),
  sort: z.enum(signalSortOptions).default("strength"),
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE)
});

type ReportInput = {
  id: string;
  reportType: string;
  title: string;
  narrative: string;
  severityLevel: string;
  verificationState: string;
  happenedAt: Date | null;
  reportedAt: Date;
};

type SectionInput = {
  id: string;
  title: string;
  content: string;
  sectionType: string;
};

type SignalEntityLink = {
  id: string;
  slug: string;
  title: string;
  entityType: string;
};

type PublicSignalItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  signalType: string;
  sourceKind: (typeof signalSourceKinds)[number];
  severityLevel: string;
  evidenceCount: number;
  strengthLabel: string;
  entity: SignalEntityLink | null;
  firstSeenAt: string | null;
  lastSeenAt: string | null;
};

type PublicSignalDetail = PublicSignalItem & {
  explanation: string;
  relatedReports: Array<{
    id: string;
    title: string;
    narrativeSnippet: string;
    reportType: string;
    severityLevel: string;
    verificationState: string;
    happenedAt: string | null;
    reportedAt: string;
  }>;
  relatedSections: Array<{
    id: string;
    title: string;
    sectionType: string;
    contentSnippet: string;
  }>;
};

type PublicEntityWithSignals = {
  id: string;
  slug: string;
  title: string;
  entityType: string;
  sections: SectionInput[];
  reports: ReportInput[];
};

const reportTypeSignalMeta: Record<string, { title: string; summary: string; signalType: string }> = {
  SCAM_ATTEMPT: {
    title: "Repeated scam-attempt reports",
    summary: "Multiple approved reports describe attempted deception or pressure tactics around the same entity.",
    signalType: "SCAM_ATTEMPT_PATTERN"
  },
  FRAUD_LOSS: {
    title: "Loss reports are recurring",
    summary: "Approved reports include loss-related outcomes, suggesting a pattern that deserves extra caution.",
    signalType: "FRAUD_LOSS_PATTERN"
  },
  WARNING: {
    title: "Warnings are recurring",
    summary: "Several approved submissions are framed as warnings rather than isolated neutral experiences.",
    signalType: "WARNING_PATTERN"
  },
  SAFETY_INCIDENT: {
    title: "Safety incidents are recurring",
    summary: "Approved reports point to repeated safety-related problems or near-misses tied to this entity.",
    signalType: "SAFETY_PATTERN"
  },
  QUALITY_ISSUE: {
    title: "Quality issues repeat",
    summary: "Approved reports show repeated quality-related complaints rather than a single one-off issue.",
    signalType: "QUALITY_PATTERN"
  },
  BAD_EXPERIENCE: {
    title: "Negative experiences repeat",
    summary: "Approved reports show a recurring negative experience pattern around this entity.",
    signalType: "BAD_EXPERIENCE_PATTERN"
  },
  MISUSE_CASE: {
    title: "Misuse cases appear repeatedly",
    summary: "Approved reports suggest misuse or abuse scenarios that repeat often enough to matter.",
    signalType: "MISUSE_PATTERN"
  }
};

signalsRouter.get("/signals", async (req, res, next) => {
  try {
    const query: z.infer<typeof listSignalsQuerySchema> = listSignalsQuerySchema.parse(req.query);

    const [patternSignals, derivedSignals] = await Promise.all([
      getPatternSignals(query),
      getDerivedSignals(query)
    ]);

    const combined = [...patternSignals, ...derivedSignals]
      .filter((item) => {
        if (query.sourceKind && item.sourceKind !== query.sourceKind) return false;
        if (query.severityLevel && item.severityLevel !== query.severityLevel) return false;
        if (query.q) {
          const haystack = [item.title, item.summary, item.entity?.title ?? "", item.signalType].join(" ").toLowerCase();
          if (!haystack.includes(query.q.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => sortSignals(a, b, query.sort));

    const pagination = getPagination(query.page, query.pageSize, combined.length);
    const items = combined.slice(pagination.skip, pagination.skip + pagination.take);

    res.json({
      items,
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

signalsRouter.get("/signals/:slug", async (req, res, next) => {
  try {
    const detail = await findSignalDetailBySlug(req.params.slug);

    if (!detail) {
      res.status(404).json({ message: "Signal not found" });
      return;
    }

    res.json(detail);
  } catch (error) {
    next(error);
  }
});

async function findSignalDetailBySlug(slug: string): Promise<PublicSignalDetail | null> {
  const patternDetail = await getPatternSignalDetail(slug);
  if (patternDetail) return patternDetail;

  const entities = await getPublicEntitiesForDerivedSignals();

  for (const entity of entities) {
    const detail = buildDerivedSignalDetails(entity).find((item) => item.slug === slug);
    if (detail) return detail;
  }

  return null;
}

async function getPatternSignals(query: z.infer<typeof listSignalsQuerySchema>): Promise<PublicSignalItem[]> {
  const patterns = await prisma.patternCard.findMany({
    where: {
      status: PatternStatus.ACTIVE,
      severityLevel: query.sourceKind === "PATTERN_CARD" || query.sourceKind === undefined ? query.severityLevel : undefined,
      entityLinks: query.entityId || query.entityType
        ? {
            some: {
              entityId: query.entityId,
              entity: query.entityType ? { entityType: query.entityType } : undefined
            }
          }
        : undefined
    },
    include: {
      trustStatus: true,
      entityLinks: {
        orderBy: { relevanceScore: "desc" },
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
      }
    }
  });

  return patterns
    .map((pattern) => {
      const entityLink = pattern.entityLinks.find(
        (link) => link.entity.status === EntityStatus.PUBLISHED && link.entity.visibility === Visibility.PUBLIC
      );

      if (!entityLink) return null;

      return {
        id: pattern.id,
        slug: pattern.slug,
        title: pattern.title,
        summary: pattern.summary,
        signalType: pattern.patternType,
        sourceKind: "PATTERN_CARD" as const,
        severityLevel: pattern.severityLevel,
        evidenceCount: pattern.reportCount,
        strengthLabel: confidenceScoreToLabel(pattern.confidenceScore, pattern.reportCount),
        entity: {
          id: entityLink.entity.id,
          slug: entityLink.entity.slug,
          title: entityLink.entity.title,
          entityType: entityLink.entity.entityType
        },
        firstSeenAt: pattern.firstSeenAt?.toISOString() ?? null,
        lastSeenAt: pattern.lastSeenAt?.toISOString() ?? null
      } satisfies PublicSignalItem;
    })
    .filter((item): item is PublicSignalItem => Boolean(item));
}

async function getPatternSignalDetail(slug: string): Promise<PublicSignalDetail | null> {
  const pattern = await prisma.patternCard.findFirst({
    where: {
      slug,
      status: PatternStatus.ACTIVE
    },
    include: {
      entityLinks: {
        orderBy: { relevanceScore: "desc" },
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
      },
      reportLinks: {
        where: {
          report: {
            moderationState: ModerationState.APPROVED,
            isPublic: true
          }
        },
        orderBy: {
          report: {
            reportedAt: "desc"
          }
        },
        include: {
          report: {
            select: {
              id: true,
              title: true,
              narrative: true,
              reportType: true,
              severityLevel: true,
              verificationState: true,
              happenedAt: true,
              reportedAt: true
            }
          }
        }
      }
    }
  });

  if (!pattern) return null;

  const entityLink = pattern.entityLinks.find(
    (link) => link.entity.status === EntityStatus.PUBLISHED && link.entity.visibility === Visibility.PUBLIC
  );

  if (!entityLink) return null;

  return {
    id: pattern.id,
    slug: pattern.slug,
    title: pattern.title,
    summary: pattern.summary,
    signalType: pattern.patternType,
    sourceKind: "PATTERN_CARD",
    severityLevel: pattern.severityLevel,
    evidenceCount: pattern.reportCount,
    strengthLabel: confidenceScoreToLabel(pattern.confidenceScore, pattern.reportCount),
    entity: {
      id: entityLink.entity.id,
      slug: entityLink.entity.slug,
      title: entityLink.entity.title,
      entityType: entityLink.entity.entityType
    },
    firstSeenAt: pattern.firstSeenAt?.toISOString() ?? null,
    lastSeenAt: pattern.lastSeenAt?.toISOString() ?? null,
    explanation: pattern.humanReviewed
      ? "This active pattern card has been reviewed and published as a reusable public signal. It groups linked public reports under one recurring theme."
      : "This active pattern card is a public pattern grouping. It reflects recurring evidence linked together around the same theme and entity.",
    relatedReports: pattern.reportLinks.slice(0, 6).map(({ report }) => toEvidenceReport(report)),
    relatedSections: []
  };
}

async function getDerivedSignals(query: z.infer<typeof listSignalsQuerySchema>): Promise<PublicSignalItem[]> {
  const entities = await getPublicEntitiesForDerivedSignals(query);
  return entities.flatMap((entity) => buildDerivedSignals(entity));
}

async function getPublicEntitiesForDerivedSignals(query?: Pick<z.infer<typeof listSignalsQuerySchema>, "entityId" | "entityType" | "q">) {
  const entities = await prisma.entity.findMany({
    where: {
      id: query?.entityId,
      entityType: query?.entityType,
      status: EntityStatus.PUBLISHED,
      visibility: Visibility.PUBLIC,
      OR: query?.q
        ? [
            { title: { contains: query.q, mode: "insensitive" } },
            { shortDescription: { contains: query.q, mode: "insensitive" } }
          ]
        : undefined
    },
    select: {
      id: true,
      slug: true,
      title: true,
      entityType: true,
      sections: {
        where: { sectionType: { in: [...riskSectionTypes] } },
        select: {
          id: true,
          title: true,
          content: true,
          sectionType: true
        }
      },
      reports: {
        where: {
          moderationState: ModerationState.APPROVED,
          isPublic: true
        },
        select: {
          id: true,
          reportType: true,
          title: true,
          narrative: true,
          severityLevel: true,
          verificationState: true,
          happenedAt: true,
          reportedAt: true
        }
      }
    }
  });

  return entities satisfies PublicEntityWithSignals[];
}

function buildDerivedSignals(entity: PublicEntityWithSignals): PublicSignalItem[] {
  return buildDerivedSignalDetails(entity).map(stripSignalDetail);
}

function buildDerivedSignalDetails(entity: PublicEntityWithSignals): PublicSignalDetail[] {
  const signals: PublicSignalDetail[] = [];
  const now = Date.now();
  const entityLink: SignalEntityLink = {
    id: entity.id,
    slug: entity.slug,
    title: entity.title,
    entityType: entity.entityType
  };

  if (entity.sections.length > 0) {
    const severityLevel = entity.sections.some((section) => section.sectionType === "COMMON_SCAMS" || section.sectionType === "RED_FLAGS") ? "HIGH" : "MEDIUM";

    signals.push({
      id: `${entity.id}:structured-risk-guidance`,
      slug: `${entity.slug}-structured-risk-guidance`,
      title: entity.sections.length > 1 ? "Structured red flags are documented" : "A structured red flag is documented",
      summary: entity.sections.length > 1
        ? `This entity already has ${entity.sections.length} risk-focused guidance sections covering warnings, protection steps, or danger points.`
        : "This entity already has a dedicated risk-focused section that documents a concrete warning or protection step.",
      signalType: "STRUCTURED_RISK_GUIDANCE",
      sourceKind: "ENTITY_GUIDANCE",
      severityLevel,
      evidenceCount: entity.sections.length,
      strengthLabel: strengthFromCount(entity.sections.length),
      entity: entityLink,
      firstSeenAt: null,
      lastSeenAt: null,
      explanation: entity.sections.length > 1
        ? "This signal exists because the entity already has multiple structured guidance sections for dangers, red flags, scams, or protection steps."
        : "This signal exists because the entity has a dedicated structured guidance section covering a concrete warning or protective step.",
      relatedReports: [],
      relatedSections: entity.sections.slice(0, 6).map(toEvidenceSection)
    });
  }

  const highSeverityReports = entity.reports.filter((report) => report.severityLevel === "HIGH" || report.severityLevel === "CRITICAL");
  if (highSeverityReports.length > 0) {
    signals.push({
      id: `${entity.id}:high-severity-reports`,
      slug: `${entity.slug}-high-severity-reports`,
      title: highSeverityReports.length > 1 ? "High-severity reports are recurring" : "A high-severity report is present",
      summary: highSeverityReports.length > 1
        ? `Approved public reports include ${highSeverityReports.length} high-severity incidents, suggesting this is not limited to a single low-grade complaint.`
        : "An approved public report has already been tagged high severity for this entity.",
      signalType: "HIGH_SEVERITY_CLUSTER",
      sourceKind: "REPORT_CLUSTER",
      severityLevel: highSeverityReports.some((report) => report.severityLevel === "CRITICAL") ? "CRITICAL" : "HIGH",
      evidenceCount: highSeverityReports.length,
      strengthLabel: strengthFromCount(highSeverityReports.length),
      entity: entityLink,
      firstSeenAt: oldestReportDate(highSeverityReports),
      lastSeenAt: newestReportDate(highSeverityReports),
      explanation: highSeverityReports.length > 1
        ? "This signal exists because several approved public reports tied to this entity were tagged high or critical severity."
        : "This signal exists because at least one approved public report tied to this entity was tagged high severity.",
      relatedReports: highSeverityReports.slice(0, 6).map(toEvidenceReport),
      relatedSections: []
    });
  }

  const verifiedReports = entity.reports.filter(
    (report) => report.verificationState === VerificationState.VERIFIED || report.verificationState === VerificationState.PARTIALLY_VERIFIED
  );
  if (verifiedReports.length > 0) {
    signals.push({
      id: `${entity.id}:verified-public-reports`,
      slug: `${entity.slug}-verified-public-reports`,
      title: verifiedReports.length > 1 ? "Verified reports are present" : "A verified report is present",
      summary: verifiedReports.length > 1
        ? `There are ${verifiedReports.length} approved reports with verified or partially verified status, which gives extra weight to the public pattern.`
        : "At least one approved report has been verified or partially verified, adding more weight than an entirely unverified stream.",
      signalType: "VERIFIED_REPORT_CLUSTER",
      sourceKind: "REPORT_CLUSTER",
      severityLevel: maxSeverity(verifiedReports) ?? "MEDIUM",
      evidenceCount: verifiedReports.length,
      strengthLabel: strengthFromCount(verifiedReports.length),
      entity: entityLink,
      firstSeenAt: oldestReportDate(verifiedReports),
      lastSeenAt: newestReportDate(verifiedReports),
      explanation: verifiedReports.length > 1
        ? "This signal exists because multiple approved reports tied to this entity also carry verified or partially verified status."
        : "This signal exists because one approved report tied to this entity also carries verified or partially verified status.",
      relatedReports: verifiedReports.slice(0, 6).map(toEvidenceReport),
      relatedSections: []
    });
  }

  const recentReports = entity.reports.filter((report) => {
    const value = report.happenedAt ?? report.reportedAt;
    return now - value.getTime() <= 1000 * 60 * 60 * 24 * 90;
  });
  if (recentReports.length > 0) {
    signals.push({
      id: `${entity.id}:recent-public-activity`,
      slug: `${entity.slug}-recent-public-activity`,
      title: "Recent public activity is visible",
      summary: recentReports.length > 1
        ? `${recentReports.length} approved reports were filed or happened within roughly the last 90 days, so the public pattern is not purely historical.`
        : "A recent approved report suggests the issue is still active enough to matter now, not only in older history.",
      signalType: "RECENT_ACTIVITY",
      sourceKind: "REPORT_CLUSTER",
      severityLevel: maxSeverity(recentReports) ?? "LOW",
      evidenceCount: recentReports.length,
      strengthLabel: strengthFromCount(recentReports.length),
      entity: entityLink,
      firstSeenAt: oldestReportDate(recentReports),
      lastSeenAt: newestReportDate(recentReports),
      explanation: recentReports.length > 1
        ? "This signal exists because several approved reports are recent enough to suggest the pattern is still active now, not only historical."
        : "This signal exists because an approved report is recent enough to suggest the pattern still matters now.",
      relatedReports: recentReports.slice(0, 6).map(toEvidenceReport),
      relatedSections: []
    });
  }

  const reportTypeCounts = entity.reports.reduce<Record<string, ReportInput[]>>((accumulator, report) => {
    (accumulator[report.reportType] ??= []).push(report);
    return accumulator;
  }, {});

  const dominantPattern = Object.entries(reportTypeCounts)
    .filter(([, items]) => items.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)[0];

  if (dominantPattern) {
    const [reportType, items] = dominantPattern;
    const meta = reportTypeSignalMeta[reportType] ?? {
      title: `${reportType.replaceAll("_", " ").toLowerCase()} reports repeat`,
      summary: "A single report theme is showing up repeatedly enough to count as a public pattern.",
      signalType: `${reportType}_PATTERN`
    };

    signals.push({
      id: `${entity.id}:pattern:${reportType.toLowerCase()}`,
      slug: `${entity.slug}-${reportType.toLowerCase()}-pattern`,
      title: meta.title,
      summary: meta.summary,
      signalType: meta.signalType,
      sourceKind: "REPORT_CLUSTER",
      severityLevel: maxSeverity(items) ?? "MEDIUM",
      evidenceCount: items.length,
      strengthLabel: strengthFromCount(items.length),
      entity: entityLink,
      firstSeenAt: oldestReportDate(items),
      lastSeenAt: newestReportDate(items),
      explanation: items.length > 1
        ? `This signal exists because ${items.length} approved public reports tied to this entity share the same report theme: ${reportType.replaceAll("_", " ").toLowerCase()}.`
        : "This signal exists because a repeated report theme has been detected around this entity.",
      relatedReports: items.slice(0, 6).map(toEvidenceReport),
      relatedSections: []
    });
  }

  return signals;
}

function stripSignalDetail(detail: PublicSignalDetail): PublicSignalItem {
  return {
    id: detail.id,
    slug: detail.slug,
    title: detail.title,
    summary: detail.summary,
    signalType: detail.signalType,
    sourceKind: detail.sourceKind,
    severityLevel: detail.severityLevel,
    evidenceCount: detail.evidenceCount,
    strengthLabel: detail.strengthLabel,
    entity: detail.entity,
    firstSeenAt: detail.firstSeenAt,
    lastSeenAt: detail.lastSeenAt
  };
}

function toEvidenceReport(report: ReportInput) {
  return {
    id: report.id,
    title: report.title,
    narrativeSnippet: excerpt(report.narrative, 220),
    reportType: report.reportType,
    severityLevel: report.severityLevel,
    verificationState: report.verificationState,
    happenedAt: report.happenedAt?.toISOString() ?? null,
    reportedAt: report.reportedAt.toISOString()
  };
}

function toEvidenceSection(section: SectionInput) {
  return {
    id: section.id,
    title: section.title,
    sectionType: section.sectionType,
    contentSnippet: excerpt(section.content, 240)
  };
}

function excerpt(text: string, maxLength: number) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1).trimEnd()}…`;
}

function newestReportDate(reports: ReportInput[]) {
  return [...reports]
    .map((report) => report.happenedAt ?? report.reportedAt)
    .sort((a, b) => b.getTime() - a.getTime())[0]
    ?.toISOString() ?? null;
}

function oldestReportDate(reports: ReportInput[]) {
  return [...reports]
    .map((report) => report.happenedAt ?? report.reportedAt)
    .sort((a, b) => a.getTime() - b.getTime())[0]
    ?.toISOString() ?? null;
}

function strengthFromCount(count: number) {
  if (count >= 4) return "Strong cluster";
  if (count >= 2) return "Repeated pattern";
  return "Single grounded signal";
}

function confidenceScoreToLabel(score: number, evidenceCount: number) {
  if (score >= 0.8 || evidenceCount >= 5) return "High confidence";
  if (score >= 0.55 || evidenceCount >= 2) return "Moderate confidence";
  return "Early signal";
}

function maxSeverity(reports: ReportInput[]) {
  const order = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 } as const;
  return [...reports]
    .map((report) => report.severityLevel)
    .sort((a, b) => order[b as keyof typeof order] - order[a as keyof typeof order])[0] ?? null;
}

function sortSignals(a: PublicSignalItem, b: PublicSignalItem, sort: z.infer<typeof listSignalsQuerySchema>["sort"]) {
  if (sort === "newest") {
    return new Date(b.lastSeenAt ?? 0).getTime() - new Date(a.lastSeenAt ?? 0).getTime();
  }

  const evidenceDelta = b.evidenceCount - a.evidenceCount;
  if (evidenceDelta !== 0) return evidenceDelta;

  const severityDelta = severityRank[b.severityLevel as keyof typeof severityRank] - severityRank[a.severityLevel as keyof typeof severityRank];
  if (severityDelta !== 0) return severityDelta;

  return new Date(b.lastSeenAt ?? 0).getTime() - new Date(a.lastSeenAt ?? 0).getTime();
}

const severityRank = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
  CRITICAL: 3
} as const;

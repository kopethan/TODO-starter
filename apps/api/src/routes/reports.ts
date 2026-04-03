import { Router } from "express";
import { z } from "zod";
import {
  ModerationState,
  ReportChannel,
  ReportOutcome,
  ReportType,
  SeverityLevel,
  VerificationState
} from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { omitUndefined } from "../utils/omit-undefined.js";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, getPagination } from "../utils/pagination.js";

export const reportsRouter = Router();

const listReportsQuerySchema = z.object({
  entityId: z.string().optional(),
  reportType: z.nativeEnum(ReportType).optional(),
  moderationState: z.nativeEnum(ModerationState).optional(),
  verificationState: z.nativeEnum(VerificationState).optional(),
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE)
});

const createReportSchema = z.object({
  entityId: z.string().min(1),
  reportType: z.nativeEnum(ReportType),
  title: z.string().min(4),
  narrative: z.string().min(20),
  happenedAt: z.string().datetime().optional(),
  countryCode: z.string().max(2).optional(),
  region: z.string().max(120).optional(),
  city: z.string().max(120).optional(),
  channel: z.nativeEnum(ReportChannel).optional(),
  outcome: z.nativeEnum(ReportOutcome).optional(),
  moneyLostAmount: z.number().nonnegative().optional(),
  currency: z.string().max(3).optional(),
  severityLevel: z.nativeEnum(SeverityLevel).default(SeverityLevel.MEDIUM),
  isAnonymous: z.boolean().default(false),
  isPublic: z.boolean().default(true)
});

const updateReportSchema = z
  .object({
    verificationState: z.nativeEnum(VerificationState).optional(),
    moderationState: z.nativeEnum(ModerationState).optional(),
    severityLevel: z.nativeEnum(SeverityLevel).optional(),
    outcome: z.nativeEnum(ReportOutcome).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required."
  });

reportsRouter.get("/reports", async (req, res, next) => {
  try {
    const query: z.infer<typeof listReportsQuerySchema> = listReportsQuerySchema.parse(req.query);

    const where = {
      ...omitUndefined({
        entityId: query.entityId,
        reportType: query.reportType,
        moderationState: query.moderationState,
        verificationState: query.verificationState
      }),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" as const } },
              { narrative: { contains: query.q, mode: "insensitive" as const } },
              {
                entity: {
                  is: {
                    title: { contains: query.q, mode: "insensitive" as const }
                  }
                }
              }
            ]
          }
        : {})
    };

    const totalItems = await prisma.experienceReport.count({ where });
    const pagination = getPagination(query.page, query.pageSize, totalItems);

    const items = await prisma.experienceReport.findMany({
      where,
      orderBy: { reportedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        entity: {
          select: {
            id: true,
            title: true,
            slug: true,
            entityType: true
          }
        }
      }
    });

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

reportsRouter.get("/reports/:id", async (req, res, next) => {
  try {
    const report = await prisma.experienceReport.findUnique({
      where: { id: req.params.id },
      include: {
        entity: {
          select: {
            id: true,
            title: true,
            slug: true,
            entityType: true
          }
        }
      }
    });

    if (!report) {
      res.status(404).json({ message: "Report not found." });
      return;
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
});

reportsRouter.post("/reports", async (req, res, next) => {
  try {
    const body: z.infer<typeof createReportSchema> = createReportSchema.parse(req.body);

    const entity = await prisma.entity.findUnique({
      where: { id: body.entityId },
      select: { id: true }
    });

    if (!entity) {
      res.status(404).json({ message: "Entity not found." });
      return;
    }

    const created = await prisma.experienceReport.create({
      data: omitUndefined({
        entityId: body.entityId,
        reportType: body.reportType,
        title: body.title,
        narrative: body.narrative,
        happenedAt: body.happenedAt ? new Date(body.happenedAt) : null,
        countryCode: body.countryCode,
        region: body.region,
        city: body.city,
        channel: body.channel,
        outcome: body.outcome,
        moneyLostAmount: body.moneyLostAmount,
        currency: body.currency,
        severityLevel: body.severityLevel,
        isAnonymous: body.isAnonymous,
        isPublic: body.isPublic,
        moderationState: ModerationState.PENDING,
        verificationState: VerificationState.UNVERIFIED
      })
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

reportsRouter.patch("/reports/:id", async (req, res, next) => {
  try {
    const body: z.infer<typeof updateReportSchema> = updateReportSchema.parse(req.body);

    const existing = await prisma.experienceReport.findUnique({
      where: { id: req.params.id },
      select: { id: true }
    });

    if (!existing) {
      res.status(404).json({ message: "Report not found." });
      return;
    }

    const updated = await prisma.experienceReport.update({
      where: { id: req.params.id },
      data: omitUndefined({
        verificationState: body.verificationState,
        moderationState: body.moderationState,
        severityLevel: body.severityLevel,
        outcome: body.outcome
      })
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

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

export const reportsRouter = Router();

const listReportsQuerySchema = z.object({
  entityId: z.string().optional(),
  reportType: z.nativeEnum(ReportType).optional(),
  moderationState: z.nativeEnum(ModerationState).optional(),
  verificationState: z.nativeEnum(VerificationState).optional()
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
    const query = listReportsQuerySchema.parse(req.query);

    const reports = await prisma.experienceReport.findMany({
      where: omitUndefined({
        entityId: query.entityId,
        reportType: query.reportType,
        moderationState: query.moderationState,
        verificationState: query.verificationState
      }),
      orderBy: { reportedAt: "desc" },
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

    res.json(reports);
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
    const body = createReportSchema.parse(req.body);

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
    const body = updateReportSchema.parse(req.body);

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

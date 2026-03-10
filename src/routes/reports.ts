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

reportsRouter.get("/reports", async (req, res, next) => {
  try {
    const query = listReportsQuerySchema.parse(req.query);

    const reports = await prisma.experienceReport.findMany({
      where: {
        entityId: query.entityId,
        reportType: query.reportType,
        moderationState: query.moderationState,
        verificationState: query.verificationState
      },
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

reportsRouter.post("/reports", async (req, res, next) => {
  try {
    const body = createReportSchema.parse(req.body);

    const created = await prisma.experienceReport.create({
      data: {
        entityId: body.entityId,
        reportType: body.reportType,
        title: body.title,
        narrative: body.narrative,
        happenedAt: body.happenedAt ? new Date(body.happenedAt) : undefined,
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
      }
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

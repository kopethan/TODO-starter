import { Router } from "express";
import { z } from "zod";
import {
  EntityStatus,
  EntityType,
  SectionType,
  Visibility
} from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { slugify } from "../utils/slugify.js";

export const entitiesRouter = Router();

const listEntitiesQuerySchema = z.object({
  type: z.nativeEnum(EntityType).optional(),
  status: z.nativeEnum(EntityStatus).optional(),
  visibility: z.nativeEnum(Visibility).optional(),
  q: z.string().trim().min(1).optional()
});

const createEntitySchema = z.object({
  title: z.string().min(2),
  slug: z.string().min(2).optional(),
  entityType: z.nativeEnum(EntityType),
  shortDescription: z.string().min(10),
  longDescription: z.string().min(10).optional(),
  status: z.nativeEnum(EntityStatus).default(EntityStatus.DRAFT),
  visibility: z.nativeEnum(Visibility).default(Visibility.PUBLIC)
});

const createSectionSchema = z.object({
  sectionType: z.nativeEnum(SectionType),
  title: z.string().min(2),
  content: z.string().min(10),
  sortOrder: z.number().int().nonnegative().default(0)
});

entitiesRouter.get("/entities", async (req, res, next) => {
  try {
    const query = listEntitiesQuerySchema.parse(req.query);

    const entities = await prisma.entity.findMany({
      where: {
        entityType: query.type,
        status: query.status,
        visibility: query.visibility,
        OR: query.q
          ? [
              { title: { contains: query.q, mode: "insensitive" } },
              { shortDescription: { contains: query.q, mode: "insensitive" } }
            ]
          : undefined
      },
      orderBy: { updatedAt: "desc" },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        _count: {
          select: {
            sections: true,
            reports: true
          }
        }
      }
    });

    res.json(entities);
  } catch (error) {
    next(error);
  }
});

entitiesRouter.get("/entities/:slug", async (req, res, next) => {
  try {
    const entity = await prisma.entity.findUnique({
      where: { slug: req.params.slug },
      include: {
        sections: {
          orderBy: { sortOrder: "asc" },
          include: {
            sources: {
              include: {
                source: true
              }
            }
          }
        },
        categories: {
          include: {
            category: true
          }
        },
        trustStatus: true,
        _count: {
          select: {
            reports: true
          }
        }
      }
    });

    if (!entity) {
      res.status(404).json({ message: "Entity not found." });
      return;
    }

    res.json(entity);
  } catch (error) {
    next(error);
  }
});

entitiesRouter.post("/entities", async (req, res, next) => {
  try {
    const body = createEntitySchema.parse(req.body);
    const slug = body.slug ? slugify(body.slug) : slugify(body.title);

    const created = await prisma.entity.create({
      data: {
        slug,
        title: body.title,
        entityType: body.entityType,
        shortDescription: body.shortDescription,
        longDescription: body.longDescription,
        status: body.status,
        visibility: body.visibility,
        publishedAt: body.status === EntityStatus.PUBLISHED ? new Date() : null
      }
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

entitiesRouter.post("/entities/:entityId/sections", async (req, res, next) => {
  try {
    const body = createSectionSchema.parse(req.body);

    const created = await prisma.entitySection.create({
      data: {
        entityId: req.params.entityId,
        sectionType: body.sectionType,
        title: body.title,
        content: body.content,
        sortOrder: body.sortOrder
      }
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

import { Router } from "express";
import { z } from "zod";
import {
  EntityStatus,
  EntityType,
  SectionType,
  Visibility
} from "../generated/prisma/enums.js";
import { prisma } from "../lib/prisma.js";
import { omitUndefined } from "../utils/omit-undefined.js";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, getPagination } from "../utils/pagination.js";
import { slugify } from "../utils/slugify.js";

export const entitiesRouter = Router();

const listEntitiesQuerySchema = z.object({
  type: z.nativeEnum(EntityType).optional(),
  status: z.nativeEnum(EntityStatus).optional(),
  visibility: z.nativeEnum(Visibility).optional(),
  q: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
  pageSize: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE)
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

const updateEntitySchema = z
  .object({
    title: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    entityType: z.nativeEnum(EntityType).optional(),
    shortDescription: z.string().min(10).optional(),
    longDescription: z.string().min(10).nullable().optional(),
    status: z.nativeEnum(EntityStatus).optional(),
    visibility: z.nativeEnum(Visibility).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required."
  });

const createSectionSchema = z.object({
  sectionType: z.nativeEnum(SectionType),
  title: z.string().min(2),
  content: z.string().min(10),
  sortOrder: z.number().int().nonnegative().default(0)
});

const updateSectionSchema = z
  .object({
    sectionType: z.nativeEnum(SectionType).optional(),
    title: z.string().min(2).optional(),
    content: z.string().min(10).optional(),
    sortOrder: z.number().int().nonnegative().optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required."
  });

entitiesRouter.get("/entities", async (req, res, next) => {
  try {
    const query: z.infer<typeof listEntitiesQuerySchema> = listEntitiesQuerySchema.parse(req.query);

    const where = omitUndefined({
      entityType: query.type,
      status: query.status,
      visibility: query.visibility,
      OR: query.q
        ? [
            { title: { contains: query.q, mode: "insensitive" as const } },
            { shortDescription: { contains: query.q, mode: "insensitive" as const } }
          ]
        : undefined
    });

    const totalItems = await prisma.entity.count({ where });
    const pagination = getPagination(query.page, query.pageSize, totalItems);

    const items = await prisma.entity.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
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

entitiesRouter.get("/entities/id/:id", async (req, res, next) => {
  try {
    const entity = await prisma.entity.findUnique({
      where: { id: req.params.id },
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
    const body: z.infer<typeof createEntitySchema> = createEntitySchema.parse(req.body);
    const slug = body.slug ? slugify(body.slug) : slugify(body.title);

    const created = await prisma.entity.create({
      data: omitUndefined({
        slug,
        title: body.title,
        entityType: body.entityType,
        shortDescription: body.shortDescription,
        longDescription: body.longDescription ?? null,
        status: body.status,
        visibility: body.visibility,
        publishedAt: body.status === EntityStatus.PUBLISHED ? new Date() : null
      })
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
});

entitiesRouter.patch("/entities/id/:id", async (req, res, next) => {
  try {
    const body: z.infer<typeof updateEntitySchema> = updateEntitySchema.parse(req.body);

    const existing = await prisma.entity.findUnique({
      where: { id: req.params.id }
    });

    if (!existing) {
      res.status(404).json({ message: "Entity not found." });
      return;
    }

    const nextStatus = body.status ?? existing.status;

    const updated = await prisma.entity.update({
      where: { id: req.params.id },
      data: omitUndefined({
        title: body.title,
        slug: body.slug ? slugify(body.slug) : undefined,
        entityType: body.entityType,
        shortDescription: body.shortDescription,
        longDescription:
          body.longDescription === undefined ? undefined : body.longDescription,
        status: body.status,
        visibility: body.visibility,
        publishedAt:
          !existing.publishedAt && nextStatus === EntityStatus.PUBLISHED
            ? new Date()
            : undefined
      })
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

entitiesRouter.delete("/entities/id/:id", async (req, res, next) => {
  try {
    const existing = await prisma.entity.findUnique({
      where: { id: req.params.id },
      select: { id: true }
    });

    if (!existing) {
      res.status(404).json({ message: "Entity not found." });
      return;
    }

    await prisma.entity.delete({
      where: { id: req.params.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

entitiesRouter.post("/entities/:entityId/sections", async (req, res, next) => {
  try {
    const body: z.infer<typeof createSectionSchema> = createSectionSchema.parse(req.body);

    const entity = await prisma.entity.findUnique({
      where: { id: req.params.entityId },
      select: { id: true }
    });

    if (!entity) {
      res.status(404).json({ message: "Entity not found." });
      return;
    }

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

entitiesRouter.patch("/entities/:entityId/sections/:sectionId", async (req, res, next) => {
  try {
    const body: z.infer<typeof updateSectionSchema> = updateSectionSchema.parse(req.body);

    const existing = await prisma.entitySection.findFirst({
      where: {
        id: req.params.sectionId,
        entityId: req.params.entityId
      },
      select: { id: true }
    });

    if (!existing) {
      res.status(404).json({ message: "Section not found." });
      return;
    }

    const updated = await prisma.entitySection.update({
      where: { id: req.params.sectionId },
      data: omitUndefined({
        sectionType: body.sectionType,
        title: body.title,
        content: body.content,
        sortOrder: body.sortOrder
      })
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

entitiesRouter.delete("/entities/:entityId/sections/:sectionId", async (req, res, next) => {
  try {
    const existing = await prisma.entitySection.findFirst({
      where: {
        id: req.params.sectionId,
        entityId: req.params.entityId
      },
      select: { id: true }
    });

    if (!existing) {
      res.status(404).json({ message: "Section not found." });
      return;
    }

    await prisma.entitySection.delete({
      where: { id: req.params.sectionId }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

import { z } from "zod";
import { ENTITY_STATUSES, ENTITY_TYPES, VISIBILITIES } from "@/lib/enums";

export const entityFormSchema = z.object({
  title: z.string().trim().min(2, "Title must be at least 2 characters."),
  slug: z.string().trim().optional().or(z.literal("")),
  entityType: z.enum(ENTITY_TYPES),
  shortDescription: z
    .string()
    .trim()
    .min(10, "Short description must be at least 10 characters."),
  longDescription: z.string().trim().optional().or(z.literal("")),
  status: z.enum(ENTITY_STATUSES),
  visibility: z.enum(VISIBILITIES)
});

export type EntityFormValues = z.infer<typeof entityFormSchema>;

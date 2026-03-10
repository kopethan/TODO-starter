import { z } from "zod";
import { SECTION_TYPES } from "@/lib/enums";

export const sectionFormSchema = z.object({
  sectionType: z.enum(SECTION_TYPES),
  title: z.string().trim().min(2, "Title must be at least 2 characters."),
  content: z.string().trim().min(10, "Content must be at least 10 characters."),
  sortOrder: z.coerce.number().int().min(0, "Sort order must be 0 or more.")
});

export type SectionFormValues = z.infer<typeof sectionFormSchema>;

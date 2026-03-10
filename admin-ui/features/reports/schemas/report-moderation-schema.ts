import { z } from "zod";
import {
  MODERATION_STATES,
  REPORT_OUTCOMES,
  SEVERITY_LEVELS,
  VERIFICATION_STATES
} from "@/lib/enums";

export const reportModerationSchema = z.object({
  verificationState: z.enum(VERIFICATION_STATES),
  moderationState: z.enum(MODERATION_STATES),
  severityLevel: z.enum(SEVERITY_LEVELS),
  outcome: z.enum(REPORT_OUTCOMES).optional().or(z.literal(""))
});

export type ReportModerationValues = z.infer<typeof reportModerationSchema>;

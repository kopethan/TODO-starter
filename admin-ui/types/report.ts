import type {
  MODERATION_STATES,
  REPORT_OUTCOMES,
  REPORT_TYPES,
  SEVERITY_LEVELS,
  VERIFICATION_STATES
} from "@/lib/enums";
import type { EntityType } from "@/types/entity";

export type ReportType = (typeof REPORT_TYPES)[number];
export type ReportOutcome = (typeof REPORT_OUTCOMES)[number];
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];
export type VerificationState = (typeof VERIFICATION_STATES)[number];
export type ModerationState = (typeof MODERATION_STATES)[number];

export type ReportListItem = {
  id: string;
  title: string;
  reportType: ReportType;
  severityLevel: SeverityLevel;
  verificationState: VerificationState;
  moderationState: ModerationState;
  reportedAt: string;
  outcome?: ReportOutcome | null;
  entity: {
    id: string;
    title: string;
    slug: string;
    entityType: EntityType;
  };
};

export type ReportDetail = ReportListItem & {
  narrative: string;
  happenedAt?: string | null;
  countryCode?: string | null;
  region?: string | null;
  city?: string | null;
  channel?: string | null;
  isAnonymous: boolean;
  isPublic: boolean;
  moneyLostAmount?: string | number | null;
  currency?: string | null;
};

export type ReportModerationPayload = {
  verificationState: VerificationState;
  moderationState: ModerationState;
  severityLevel: SeverityLevel;
  outcome?: ReportOutcome | undefined;
};

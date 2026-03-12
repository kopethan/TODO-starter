export const entityTypes = ["OBJECT", "SERVICE", "SITUATION", "SCAM_PATTERN", "BRAND", "PLATFORM", "CONCEPT"] as const;
export const entityStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const visibilityOptions = ["PUBLIC", "PRIVATE", "HIDDEN"] as const;
export const sectionTypes = [
  "DEFINITION",
  "PURPOSE",
  "COMMON_USES",
  "NORMAL_PROCESS",
  "SAFE_USAGE",
  "DANGERS",
  "RED_FLAGS",
  "COMMON_SCAMS",
  "HOW_TO_PROTECT_YOURSELF",
  "WHAT_TO_DO_IF_AFFECTED",
  "RELATED_ALTERNATIVES",
  "NOTES"
] as const;
export const reportTypes = ["NORMAL_EXPERIENCE", "BAD_EXPERIENCE", "SCAM_ATTEMPT", "SAFETY_INCIDENT", "MISUSE_CASE", "QUALITY_ISSUE", "FRAUD_LOSS", "WARNING"] as const;
export const verificationStates = ["UNVERIFIED", "PARTIALLY_VERIFIED", "VERIFIED", "REJECTED"] as const;
export const moderationStates = ["PENDING", "APPROVED", "REJECTED", "FLAGGED", "REMOVED"] as const;
export const severityLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const reportOutcomes = ["SAFE", "RESOLVED", "NOT_RESOLVED", "MONEY_LOST", "TIME_LOST", "ACCOUNT_COMPROMISED", "ITEM_DAMAGED", "INJURY", "NEAR_MISS", "UNKNOWN"] as const;

export type EntityType = typeof entityTypes[number];
export type EntityStatus = typeof entityStatuses[number];
export type Visibility = typeof visibilityOptions[number];
export type SectionType = typeof sectionTypes[number];
export type ReportType = typeof reportTypes[number];
export type VerificationState = typeof verificationStates[number];
export type ModerationState = typeof moderationStates[number];
export type SeverityLevel = typeof severityLevels[number];
export type ReportOutcome = typeof reportOutcomes[number];

export type EntitySection = {
  id: string;
  entityId: string;
  sectionType: SectionType;
  title: string;
  content: string;
  sortOrder: number;
};

export type TrustStatus = {
  factualConfidence?: string | null;
  communitySignalStrength?: string | null;
  moderationConfidence?: string | null;
} | null;

export type EntitySummary = {
  id: string;
  slug: string;
  title: string;
  entityType: EntityType;
  shortDescription: string;
  longDescription?: string | null;
  status: EntityStatus;
  visibility: Visibility;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    sections: number;
    reports: number;
  };
};

export type EntityDetail = EntitySummary & {
  sections: EntitySection[];
  trustStatus?: TrustStatus;
};

export type EntityFormInput = {
  title: string;
  slug?: string;
  entityType: EntityType;
  shortDescription: string;
  longDescription?: string;
  status: EntityStatus;
  visibility: Visibility;
};

export type SectionFormInput = {
  sectionType: SectionType;
  title: string;
  content: string;
  sortOrder: number;
};

export type ReportSummary = {
  id: string;
  entityId: string;
  reportType: ReportType;
  title: string;
  narrative: string;
  happenedAt?: string | null;
  outcome?: ReportOutcome | null;
  severityLevel: SeverityLevel;
  moderationState: ModerationState;
  verificationState: VerificationState;
  reportedAt?: string;
  entity?: {
    id: string;
    title: string;
    slug: string;
    entityType: string;
  };
};

export type ReportDetail = ReportSummary & {
  countryCode?: string | null;
  region?: string | null;
  city?: string | null;
  channel?: string | null;
  moneyLostAmount?: number | null;
  currency?: string | null;
  isAnonymous?: boolean;
  isPublic?: boolean;
  updatedAt?: string;
};

export type ReportModerationInput = {
  verificationState?: VerificationState;
  moderationState?: ModerationState;
  severityLevel?: SeverityLevel;
  outcome?: ReportOutcome;
};

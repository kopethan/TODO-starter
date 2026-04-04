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
export const signalSourceKinds = ["PATTERN_CARD", "REPORT_CLUSTER", "ENTITY_GUIDANCE"] as const;
export const signalSortOptions = ["strength", "newest"] as const;
export const sourceTypes = ["OFFICIAL", "BRAND_OFFICIAL", "NEWS", "USER_REPORT", "MODERATOR_NOTE", "PUBLIC_DATASET", "INTERNAL_ANALYSIS", "OTHER"] as const;

export type EntityType = typeof entityTypes[number];
export type EntityStatus = typeof entityStatuses[number];
export type Visibility = typeof visibilityOptions[number];
export type SectionType = typeof sectionTypes[number];
export type ReportType = typeof reportTypes[number];
export type VerificationState = typeof verificationStates[number];
export type ModerationState = typeof moderationStates[number];
export type SeverityLevel = typeof severityLevels[number];
export type ReportOutcome = typeof reportOutcomes[number];
export type SignalSourceKind = typeof signalSourceKinds[number];
export type SignalSortOption = typeof signalSortOptions[number];
export type SourceType = typeof sourceTypes[number];

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type EntitySource = {
  id: string;
  sourceType: SourceType;
  title: string;
  url?: string | null;
  publisher?: string | null;
  publishedAt?: string | null;
  retrievedAt?: string | null;
  reliabilityScore?: number | null;
  notes?: string | null;
};

export type EntitySectionSourceLink = {
  sourceId: string;
  source: EntitySource;
};

export type EntitySection = {
  id: string;
  entityId: string;
  sectionType: SectionType;
  title: string;
  content: string;
  sortOrder: number;
  sources?: EntitySectionSourceLink[];
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


export type BulkReportModerationInput = {
  reportIds: string[];
  verificationState?: VerificationState;
  moderationState?: ModerationState;
  severityLevel?: SeverityLevel;
  outcome?: ReportOutcome;
};

export type BulkReportModerationResult = {
  requestedCount: number;
  updatedCount: number;
  reportIds: string[];
  missingIds: string[];
};
export type ReportModerationInput = {
  verificationState?: VerificationState;
  moderationState?: ModerationState;
  severityLevel?: SeverityLevel;
  outcome?: ReportOutcome;
};



export const contributionTargetTypes = ["ENTITY", "ENTITY_SECTION", "REPORT", "PATTERN", "SOURCE"] as const;
export const contributionTypes = ["SUGGEST_EDIT", "ADD_WARNING", "ADD_SOURCE", "FLAG_OUTDATED", "FLAG_ABUSE", "DISPUTE_CONTENT", "MERGE_REQUEST"] as const;
export const contributionStatuses = ["PENDING", "APPROVED", "REJECTED", "NEEDS_REVIEW"] as const;
export const contributionApplyModes = ["APPEND_NOTE", "REPLACE_CONTENT"] as const;

export const publicContributionKinds = ["report", "signal", "source", "evidence", "update"] as const;

export type ContributionTargetType = typeof contributionTargetTypes[number];
export type ContributionType = typeof contributionTypes[number];
export type ContributionStatus = typeof contributionStatuses[number];
export type ContributionApplyMode = typeof contributionApplyModes[number];
export type PublicContributionKind = typeof publicContributionKinds[number];

export type PublicContributionTarget = {
  entity?: {
    id: string;
    slug: string;
    title: string;
    entityType: EntityType;
  } | null;
  section?: {
    id: string;
    title: string;
    sectionType: SectionType;
  } | null;
};

export type PublicContributionDraftField = {
  key: string;
  label: string;
  value?: string | null;
  missing: boolean;
};

export type PublicContributionDraftInput = {
  kind?: PublicContributionKind;
  plainText: string;
  entityId?: string;
  entitySlug?: string;
  sectionId?: string;
};

export type PublicContributionDraft = {
  kind: PublicContributionKind;
  suggestedKind: PublicContributionKind;
  submissionMode: "report" | "contribution";
  title: string;
  summary: string;
  missingFields: string[];
  readyForSubmission: boolean;
  target: PublicContributionTarget;
  fields: PublicContributionDraftField[];
  normalizedPayload: {
    reportType?: ReportType;
    severityLevel?: SeverityLevel;
    outcome?: ReportOutcome | null;
    sourceType?: SourceType;
    structuredData: Record<string, string | null>;
  };
};

export type PublicContributionSubmitInput = PublicContributionDraftInput & {
  kind: PublicContributionKind;
  title?: string;
  contactName?: string;
  contactEmail?: string;
  allowPublicDisplay?: boolean;
};

export type PublicContributionReceipt = {
  id: string;
  resourceType: "REPORT" | "CONTRIBUTION";
  kind: PublicContributionKind;
  status: string;
  title: string;
  createdAt: string;
  target: PublicContributionTarget;
  message: string;
};

export type PublicSignalSummary = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  signalType: string;
  sourceKind: SignalSourceKind;
  severityLevel: SeverityLevel;
  evidenceCount: number;
  strengthLabel: string;
  firstSeenAt?: string | null;
  lastSeenAt?: string | null;
  entity?: {
    id: string;
    slug: string;
    title: string;
    entityType: EntityType;
  } | null;
};

export type PublicSignalEvidenceReport = {
  id: string;
  title: string;
  narrativeSnippet: string;
  reportType: ReportType;
  severityLevel: SeverityLevel;
  verificationState: VerificationState;
  happenedAt?: string | null;
  reportedAt: string;
};

export type PublicSignalEvidenceSection = {
  id: string;
  title: string;
  sectionType: SectionType;
  contentSnippet: string;
};

export type PublicSignalDetail = PublicSignalSummary & {
  explanation: string;
  relatedReports: PublicSignalEvidenceReport[];
  relatedSections: PublicSignalEvidenceSection[];
};

export type AdminContributionSummary = {
  id: string;
  status: ContributionStatus;
  contributionType: ContributionType;
  targetType: ContributionTargetType;
  createdAt: string;
  reviewedAt?: string | null;
  title: string;
  summary: string;
  plainText?: string;
  entryKind?: PublicContributionKind | null;
  suggestedKind?: PublicContributionKind | null;
  missingFields: string[];
  allowPublicDisplay?: boolean | null;
  target: PublicContributionTarget;
  contact?: {
    name?: string | null;
    email?: string | null;
  } | null;
  inferred?: {
    reportType?: ReportType | null;
    severityLevel?: SeverityLevel | null;
    outcome?: ReportOutcome | null;
    sourceType?: SourceType | null;
  } | null;
  structuredData?: Record<string, string | null>;
  applied?: {
    kind: Extract<PublicContributionKind, "source" | "update">;
    sectionId: string;
    sectionTitle: string;
    appliedAt: string;
    mode?: ContributionApplyMode | null;
    sourceId?: string | null;
    sourceTitle?: string | null;
  } | null;
  submittedBy?: {
    id: string;
    displayName: string;
    email: string;
  } | null;
};

export type AdminContributionFilters = {
  q?: string;
  status?: ContributionStatus | "";
  kind?: PublicContributionKind | "";
  entityId?: string;
  page?: string;
  pageSize?: string;
};

export type AdminContributionReviewInput = {
  status: ContributionStatus;
};

export type AdminContributionApplyInput =
  | {
      kind: "source";
      sectionId: string;
      sourceType: SourceType;
      title: string;
      url?: string;
      publisher?: string;
      notes?: string;
    }
  | {
      kind: "update";
      sectionId: string;
      mode: ContributionApplyMode;
      content: string;
    };

export type AdminContributionApplyResult = {
  contribution: AdminContributionSummary;
  appliedResource:
    | {
        kind: "source";
        sectionId: string;
        sourceId: string;
        sourceTitle: string;
      }
    | {
        kind: "update";
        sectionId: string;
        mode: ContributionApplyMode;
      };
};

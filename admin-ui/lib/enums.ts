import { sentenceCase } from "@/lib/utils";

export const ENTITY_TYPES = [
  "OBJECT",
  "SERVICE",
  "SITUATION",
  "SCAM_PATTERN",
  "BRAND",
  "PLATFORM",
  "CONCEPT"
] as const;

export const ENTITY_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export const VISIBILITIES = ["PUBLIC", "PRIVATE", "HIDDEN"] as const;

export const SECTION_TYPES = [
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

export const REPORT_TYPES = [
  "NORMAL_EXPERIENCE",
  "BAD_EXPERIENCE",
  "SCAM_ATTEMPT",
  "SAFETY_INCIDENT",
  "MISUSE_CASE",
  "QUALITY_ISSUE",
  "FRAUD_LOSS",
  "WARNING"
] as const;

export const REPORT_OUTCOMES = [
  "SAFE",
  "RESOLVED",
  "NOT_RESOLVED",
  "MONEY_LOST",
  "TIME_LOST",
  "ACCOUNT_COMPROMISED",
  "ITEM_DAMAGED",
  "INJURY",
  "NEAR_MISS",
  "UNKNOWN"
] as const;

export const SEVERITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const VERIFICATION_STATES = [
  "UNVERIFIED",
  "PARTIALLY_VERIFIED",
  "VERIFIED",
  "REJECTED"
] as const;
export const MODERATION_STATES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "FLAGGED",
  "REMOVED"
] as const;

export function enumOptions(values: readonly string[]) {
  return values.map((value) => ({ value, label: sentenceCase(value) }));
}

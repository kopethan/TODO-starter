import { formatEnum } from "../../lib/format";
import { Badge } from "../ui/badge";

export function EntityStatusBadge({ value }: { value?: string | null }) {
  return <Badge tone={value === "PUBLISHED" ? "theme" : value === "ARCHIVED" ? "default" : "info"}>{formatEnum(value)}</Badge>;
}
export function VisibilityBadge({ value }: { value?: string | null }) {
  return <Badge tone={value === "PUBLIC" ? "info" : value === "HIDDEN" ? "warning" : "default"}>{formatEnum(value)}</Badge>;
}
export function EntityTypeBadge({ value }: { value?: string | null }) {
  return <Badge tone="theme">{formatEnum(value)}</Badge>;
}
export function VerificationBadge({ value }: { value?: string | null }) {
  return <Badge tone={value === "VERIFIED" ? "info" : value === "REJECTED" ? "danger" : value === "PARTIALLY_VERIFIED" ? "theme" : "warning"}>{formatEnum(value)}</Badge>;
}
export function ModerationBadge({ value }: { value?: string | null }) {
  return <Badge tone={value === "APPROVED" ? "theme" : value === "PENDING" || value === "FLAGGED" ? "warning" : "danger"}>{formatEnum(value)}</Badge>;
}
export function SeverityBadge({ value }: { value?: string | null }) {
  return <Badge tone={value === "CRITICAL" || value === "HIGH" ? "danger" : value === "MEDIUM" ? "warning" : "default"}>{formatEnum(value)}</Badge>;
}

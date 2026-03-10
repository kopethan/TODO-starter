import { Badge } from "@/components/ui/badge";
import { formatEnum } from "@/lib/utils/format";

export function EntityStatusBadge({ value }: { value?: string | null }) {
  return <Badge tone={value === "PUBLISHED" ? "success" : value === "ARCHIVED" ? "default" : "theme"}>{formatEnum(value)}</Badge>;
}
export function VisibilityBadge({ value }: { value?: string | null }) {
  return <Badge tone={value === "PUBLIC" ? "info" : value === "HIDDEN" ? "warning" : "default"}>{formatEnum(value)}</Badge>;
}
export function EntityTypeBadge({ value }: { value?: string | null }) {
  return <Badge tone="theme">{formatEnum(value)}</Badge>;
}
export function VerificationBadge({ value }: { value?: string | null }) {
  return <Badge tone={value === "VERIFIED" ? "success" : value === "REJECTED" ? "danger" : value === "PARTIALLY_VERIFIED" ? "info" : "warning"}>{formatEnum(value)}</Badge>;
}
export function ModerationBadge({ value }: { value?: string | null }) {
  return <Badge tone={value === "APPROVED" ? "success" : value === "PENDING" || value === "FLAGGED" ? "warning" : "danger"}>{formatEnum(value)}</Badge>;
}
export function SeverityBadge({ value }: { value?: string | null }) {
  return <Badge tone={value === "CRITICAL" || value === "HIGH" ? "danger" : value === "MEDIUM" ? "warning" : "default"}>{formatEnum(value)}</Badge>;
}

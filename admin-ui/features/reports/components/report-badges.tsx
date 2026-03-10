import { Badge } from "@/components/ui/badge";
import { sentenceCase } from "@/lib/utils";

export function VerificationBadge({ value }: { value: string }) {
  const variant =
    value === "VERIFIED"
      ? "success"
      : value === "PARTIALLY_VERIFIED"
        ? "theme"
        : value === "REJECTED"
          ? "danger"
          : "neutral";

  return <Badge variant={variant}>{sentenceCase(value)}</Badge>;
}

export function ModerationBadge({ value }: { value: string }) {
  const variant =
    value === "APPROVED"
      ? "success"
      : value === "FLAGGED"
        ? "warning"
        : value === "REJECTED" || value === "REMOVED"
          ? "danger"
          : "neutral";

  return <Badge variant={variant}>{sentenceCase(value)}</Badge>;
}

export function SeverityBadge({ value }: { value: string }) {
  const variant = value === "CRITICAL" || value === "HIGH" ? "danger" : value === "MEDIUM" ? "warning" : "neutral";
  return <Badge variant={variant}>{sentenceCase(value)}</Badge>;
}

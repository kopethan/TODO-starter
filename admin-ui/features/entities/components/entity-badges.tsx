import { Badge } from "@/components/ui/badge";
import { sentenceCase } from "@/lib/utils";

export function EntityStatusBadge({ value }: { value: string }) {
  const variant = value === "PUBLISHED" ? "success" : value === "ARCHIVED" ? "warning" : "neutral";
  return <Badge variant={variant}>{sentenceCase(value)}</Badge>;
}

export function VisibilityBadge({ value }: { value: string }) {
  const variant = value === "PUBLIC" ? "theme" : value === "PRIVATE" ? "neutral" : "warning";
  return <Badge variant={variant}>{sentenceCase(value)}</Badge>;
}

export function SectionTypeBadge({ value }: { value: string }) {
  return <Badge variant="theme">{sentenceCase(value)}</Badge>;
}

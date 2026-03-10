import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 py-10">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[var(--text-strong)]">{title}</h3>
          <p className="max-w-xl text-sm text-[var(--text-muted)]">{description}</p>
        </div>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className={buttonClasses({ variant: "secondary" })}>
            {actionLabel}
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}

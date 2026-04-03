"use client";

import { Button, Card } from "@todo/ui";
import { InlineNotice } from "@/components/shared/inline-notice";

export function BulkModerationActions({
  selectedCount,
  visibleCount,
  allVisibleSelected,
  loading,
  onToggleSelectAll,
  onClearSelection,
  onApprove,
  onFlag,
  onReject,
  onMarkVerified,
  onMarkUnverified
}: {
  selectedCount: number;
  visibleCount: number;
  allVisibleSelected: boolean;
  loading: boolean;
  onToggleSelectAll: () => void;
  onClearSelection: () => void;
  onApprove: () => void;
  onFlag: () => void;
  onReject: () => void;
  onMarkVerified: () => void;
  onMarkUnverified: () => void;
}) {
  if (visibleCount === 0) return null;

  return (
    <Card className="space-y-4 border border-[var(--border-default)] p-4">
      {selectedCount > 0 ? (
        <InlineNotice
          tone="info"
          title={`${selectedCount} report${selectedCount === 1 ? "" : "s"} selected`}
          description="Apply moderation and verification changes to the selected reports in one step."
        />
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={onToggleSelectAll}>
            {allVisibleSelected ? "Clear page selection" : `Select all visible (${visibleCount})`}
          </Button>
          {selectedCount > 0 ? (
            <Button variant="ghost" onClick={onClearSelection}>
              Clear selected
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary" disabled={selectedCount === 0 || loading} onClick={onApprove}>
            {loading ? "Saving..." : "Approve selected"}
          </Button>
          <Button variant="ghost" disabled={selectedCount === 0 || loading} onClick={onFlag}>
            Flag selected
          </Button>
          <Button variant="danger" disabled={selectedCount === 0 || loading} onClick={onReject}>
            Reject selected
          </Button>
          <Button variant="secondary" disabled={selectedCount === 0 || loading} onClick={onMarkVerified}>
            Mark verified
          </Button>
          <Button variant="secondary" disabled={selectedCount === 0 || loading} onClick={onMarkUnverified}>
            Mark unverified
          </Button>
        </div>
      </div>
    </Card>
  );
}

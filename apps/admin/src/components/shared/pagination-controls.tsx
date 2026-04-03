"use client";

import { Button, Card, Select } from "@todo/ui";

const defaultPageSizeOptions = [10, 20, 50] as const;

export function PaginationControls({
  page,
  pageSize,
  totalItems,
  totalPages,
  currentCount,
  itemLabel,
  onPageChange,
  onPageSizeChange
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  currentCount: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = totalItems === 0 ? 0 : start + currentCount - 1;

  return (
    <Card className="flex flex-col gap-4 border border-[var(--border-default)] p-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1 text-sm text-[var(--text-secondary)]">
        <p>
          Showing <span className="font-medium text-[var(--text-primary)]">{start}-{end}</span> of{' '}
          <span className="font-medium text-[var(--text-primary)]">{totalItems}</span> {itemLabel}
        </p>
        <p>
          Page <span className="font-medium text-[var(--text-primary)]">{page}</span> of{' '}
          <span className="font-medium text-[var(--text-primary)]">{totalPages}</span>
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-secondary)]">Rows</span>
          <Select
            className="w-24"
            value={String(pageSize)}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {defaultPageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
            Previous
          </Button>
          <Button variant="secondary" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}

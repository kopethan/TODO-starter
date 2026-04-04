"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@todo/api-client";
import type { PaginatedResponse, PublicSignalDetail, PublicSignalSummary } from "@todo/types";

export type { PublicSignalDetail, PublicSignalSummary } from "@todo/types";

export function useSignals(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: ["signals", filters],
    queryFn: () => apiRequest<PaginatedResponse<PublicSignalSummary>>("/signals", undefined, filters)
  });
}

export function useSignalBySlug(slug: string) {
  return useQuery({
    queryKey: ["signal", slug],
    enabled: Boolean(slug),
    queryFn: () => apiRequest<PublicSignalDetail>(`/signals/${slug}`)
  });
}

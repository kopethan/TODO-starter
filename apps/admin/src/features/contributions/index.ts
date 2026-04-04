"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@todo/api-client";
import type {
  AdminContributionApplyInput,
  AdminContributionApplyResult,
  AdminContributionFilters,
  AdminContributionReviewInput,
  AdminContributionSummary,
  PaginatedResponse
} from "@todo/types";
import { adminQueryKeys } from "@/lib/query-keys";

export type {
  AdminContributionApplyInput,
  AdminContributionApplyResult,
  AdminContributionFilters,
  AdminContributionReviewInput,
  AdminContributionSummary,
  PaginatedResponse
} from "@todo/types";

export function useContributions(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: adminQueryKeys.contributions.list(filters),
    queryFn: () => apiRequest<PaginatedResponse<AdminContributionSummary>>("/contributions", undefined, filters),
    placeholderData: keepPreviousData
  });
}

export function useUpdateContribution(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminContributionReviewInput) =>
      apiRequest<AdminContributionSummary>(`/contributions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.contributions.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.contributions.detail(id) });
    }
  });
}

export function useApplyContribution(id: string, entityId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminContributionApplyInput) =>
      apiRequest<AdminContributionApplyResult>(`/contributions/${id}/apply`, {
        method: "POST",
        body: JSON.stringify(cleanApplyPayload(payload))
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.contributions.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.contributions.detail(id) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.entities.all });
      if (entityId) {
        queryClient.invalidateQueries({ queryKey: adminQueryKeys.entities.detail(entityId) });
      }
    }
  });
}

function cleanApplyPayload(payload: AdminContributionApplyInput) {
  if (payload.kind === "source") {
    return {
      ...payload,
      url: payload.url || undefined,
      publisher: payload.publisher || undefined,
      notes: payload.notes || undefined
    };
  }

  return payload;
}

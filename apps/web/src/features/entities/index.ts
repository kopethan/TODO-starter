"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@todo/api-client";
import type { EntityDetail, EntitySummary } from "@todo/types";

export function useEntities(filters: Record<string, string> = {}) {
  return useQuery({ queryKey: ["entities", filters], queryFn: () => apiRequest<EntitySummary[]>("/entities", undefined, filters) });
}

export function useEntityBySlug(slug: string) {
  return useQuery({ queryKey: ["entityBySlug", slug], queryFn: () => apiRequest<EntityDetail>(`/entities/${slug}`), enabled: Boolean(slug) });
}

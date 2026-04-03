"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@todo/api-client";
import type {
  EntityDetail,
  EntityFormInput,
  EntitySection,
  EntitySummary,
  PaginatedResponse,
  SectionFormInput
} from "@todo/types";
import { adminQueryKeys } from "@/lib/query-keys";

export type {
  EntityDetail,
  EntityFormInput,
  EntitySection,
  EntitySummary,
  PaginatedResponse,
  SectionFormInput
} from "@todo/types";

export function useEntities(filters: Record<string, string> = {}) {
  return useQuery({
    queryKey: adminQueryKeys.entities.list(filters),
    queryFn: () => apiRequest<PaginatedResponse<EntitySummary>>("/entities", undefined, filters),
    placeholderData: keepPreviousData
  });
}

export function useEntity(id: string) {
  return useQuery({
    queryKey: adminQueryKeys.entities.detail(id),
    queryFn: () => apiRequest<EntityDetail>(`/entities/id/${id}`),
    enabled: Boolean(id)
  });
}

export function useEntityBySlug(slug: string) {
  return useQuery({
    queryKey: adminQueryKeys.entities.bySlug(slug),
    queryFn: () => apiRequest<EntityDetail>(`/entities/${slug}`),
    enabled: Boolean(slug)
  });
}

export function useCreateEntity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EntityFormInput) => apiRequest<EntityDetail>("/entities", { method: "POST", body: JSON.stringify(clean(payload)) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.entities.all });
    }
  });
}

export function useUpdateEntity(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<EntityFormInput>) => apiRequest<EntityDetail>(`/entities/id/${id}`, { method: "PATCH", body: JSON.stringify(clean(payload)) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.entities.all });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.entities.detail(id) });
    }
  });
}

export function useDeleteEntity(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiRequest<void>(`/entities/id/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.entities.all });
      queryClient.removeQueries({ queryKey: adminQueryKeys.entities.detail(id) });
    }
  });
}

export function useCreateSection(entityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SectionFormInput) => apiRequest<EntitySection>(`/entities/${entityId}/sections`, { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.entities.detail(entityId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.entities.all });
    }
  });
}

export function useUpdateSection(entityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sectionId, payload }: { sectionId: string; payload: Partial<SectionFormInput> }) => apiRequest<EntitySection>(`/entities/${entityId}/sections/${sectionId}`, { method: "PATCH", body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.entities.detail(entityId) });
    }
  });
}

export function useDeleteSection(entityId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sectionId: string) => apiRequest<void>(`/entities/${entityId}/sections/${sectionId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.entities.detail(entityId) });
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.entities.all });
    }
  });
}

function clean<T extends { slug?: string; longDescription?: string }>(payload: T) {
  return {
    ...payload,
    slug: payload.slug || undefined,
    longDescription: payload.longDescription || undefined
  };
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@todo/api-client";

export type { EntityDetail, EntitySection, EntitySummary, EntityFormInput, SectionFormInput } from "@todo/types";
import type { EntityDetail, EntitySection, EntitySummary, EntityFormInput, SectionFormInput } from "@todo/types";

export function useEntities(filters: Record<string, string> = {}) {
  return useQuery({ queryKey: ["entities", filters], queryFn: () => apiRequest<EntitySummary[]>("/entities", undefined, filters) });
}
export function useEntity(id: string) {
  return useQuery({ queryKey: ["entity", id], queryFn: () => apiRequest<EntityDetail>(`/entities/id/${id}`), enabled: Boolean(id) });
}
export function useEntityBySlug(slug: string) {
  return useQuery({ queryKey: ["entityBySlug", slug], queryFn: () => apiRequest<EntityDetail>(`/entities/${slug}`), enabled: Boolean(slug) });
}
export function useCreateEntity() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: EntityFormInput) => apiRequest<EntityDetail>("/entities", { method: "POST", body: JSON.stringify(clean(payload)) }), onSuccess: () => qc.invalidateQueries({ queryKey: ["entities"] }) });
}
export function useUpdateEntity(id: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: Partial<EntityFormInput>) => apiRequest<EntityDetail>(`/entities/id/${id}`, { method: "PATCH", body: JSON.stringify(clean(payload)) }), onSuccess: () => { qc.invalidateQueries({ queryKey: ["entity", id] }); qc.invalidateQueries({ queryKey: ["entities"] }); qc.invalidateQueries({ queryKey: ["entityBySlug"] }); } });
}
export function useDeleteEntity(id: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => apiRequest<void>(`/entities/id/${id}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["entities"] }) });
}
export function useCreateSection(entityId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: SectionFormInput) => apiRequest<EntitySection>(`/entities/${entityId}/sections`, { method: "POST", body: JSON.stringify(payload) }), onSuccess: () => qc.invalidateQueries({ queryKey: ["entity", entityId] }) });
}
export function useUpdateSection(entityId: string, sectionId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (payload: Partial<SectionFormInput>) => apiRequest<EntitySection>(`/entities/${entityId}/sections/${sectionId}`, { method: "PATCH", body: JSON.stringify(payload) }), onSuccess: () => qc.invalidateQueries({ queryKey: ["entity", entityId] }) });
}
export function useDeleteSection(entityId: string, sectionId: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => apiRequest<void>(`/entities/${entityId}/sections/${sectionId}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: ["entity", entityId] }) });
}
function clean<T extends { slug?: string; longDescription?: string }>(payload: T) { return { ...payload, slug: payload.slug || undefined, longDescription: payload.longDescription || undefined }; }

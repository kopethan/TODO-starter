"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api/client";

export type EntityStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type Visibility = "PUBLIC" | "PRIVATE" | "HIDDEN";
export type EntityType = "OBJECT" | "SERVICE" | "SITUATION" | "SCAM_PATTERN" | "BRAND" | "PLATFORM" | "CONCEPT";
export type SectionType = "DEFINITION" | "PURPOSE" | "COMMON_USES" | "NORMAL_PROCESS" | "SAFE_USAGE" | "DANGERS" | "RED_FLAGS" | "COMMON_SCAMS" | "HOW_TO_PROTECT_YOURSELF" | "WHAT_TO_DO_IF_AFFECTED" | "RELATED_ALTERNATIVES" | "NOTES";

export type EntitySection = { id: string; entityId: string; sectionType: SectionType; title: string; content: string; sortOrder: number; };
export type EntitySummary = { id: string; slug: string; title: string; entityType: EntityType; shortDescription: string; longDescription?: string | null; status: EntityStatus; visibility: Visibility; createdAt?: string; updatedAt?: string; _count?: { sections: number; reports: number; }; };
export type EntityDetail = EntitySummary & { sections: EntitySection[]; trustStatus?: { factualConfidence?: string | null; communitySignalStrength?: string | null; moderationConfidence?: string | null } | null; };
export type EntityFormInput = { title: string; slug?: string; entityType: EntityType; shortDescription: string; longDescription?: string; status: EntityStatus; visibility: Visibility; };
export type SectionFormInput = { sectionType: SectionType; title: string; content: string; sortOrder: number; };

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

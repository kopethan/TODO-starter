import { apiFetch } from "@/lib/api/client";
import { toQueryString } from "@/lib/utils";
import type {
  EntityDetail,
  EntityListItem,
  EntityPayload,
  EntitySection,
  SectionPayload
} from "@/types/entity";

export async function listEntities(filters: {
  q?: string;
  type?: string;
  status?: string;
  visibility?: string;
}) {
  return apiFetch<EntityListItem[]>(
    `/entities${toQueryString({
      q: filters.q,
      type: filters.type,
      status: filters.status,
      visibility: filters.visibility
    })}`
  );
}

export async function getEntityById(entityId: string) {
  return apiFetch<EntityDetail>(`/entities/id/${entityId}`);
}

export async function createEntity(payload: EntityPayload) {
  return apiFetch<EntityDetail>(`/entities`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateEntity(entityId: string, payload: Partial<EntityPayload>) {
  return apiFetch<EntityDetail>(`/entities/id/${entityId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function createSection(entityId: string, payload: SectionPayload) {
  return apiFetch<EntitySection>(`/entities/${entityId}/sections`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateSection(
  entityId: string,
  sectionId: string,
  payload: Partial<SectionPayload>
) {
  return apiFetch<EntitySection>(`/entities/${entityId}/sections/${sectionId}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function deleteSection(entityId: string, sectionId: string) {
  return apiFetch<void>(`/entities/${entityId}/sections/${sectionId}`, {
    method: "DELETE"
  });
}

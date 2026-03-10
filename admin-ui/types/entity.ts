import type {
  ENTITY_STATUSES,
  ENTITY_TYPES,
  SECTION_TYPES,
  VISIBILITIES
} from "@/lib/enums";

export type EntityType = (typeof ENTITY_TYPES)[number];
export type EntityStatus = (typeof ENTITY_STATUSES)[number];
export type Visibility = (typeof VISIBILITIES)[number];
export type SectionType = (typeof SECTION_TYPES)[number];

export type EntityListItem = {
  id: string;
  slug: string;
  title: string;
  entityType: EntityType;
  shortDescription: string;
  longDescription?: string | null;
  status: EntityStatus;
  visibility: Visibility;
  updatedAt: string;
  publishedAt?: string | null;
  _count: {
    sections: number;
    reports: number;
  };
};

export type EntitySection = {
  id: string;
  entityId: string;
  sectionType: SectionType;
  title: string;
  content: string;
  sortOrder: number;
  updatedAt: string;
};

export type EntityDetail = {
  id: string;
  slug: string;
  title: string;
  entityType: EntityType;
  shortDescription: string;
  longDescription?: string | null;
  status: EntityStatus;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  sections: EntitySection[];
  _count: {
    reports: number;
  };
};

export type EntityPayload = {
  title: string;
  slug?: string;
  entityType: EntityType;
  shortDescription: string;
  longDescription?: string | null;
  status: EntityStatus;
  visibility: Visibility;
};

export type SectionPayload = {
  sectionType: SectionType;
  title: string;
  content: string;
  sortOrder: number;
};

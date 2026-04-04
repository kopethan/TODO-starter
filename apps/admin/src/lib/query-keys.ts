export const adminQueryKeys = {
  entities: {
    all: ["entities"] as const,
    lists: () => [...adminQueryKeys.entities.all, "list"] as const,
    list: (filters: Record<string, string>) => [...adminQueryKeys.entities.lists(), filters] as const,
    details: () => [...adminQueryKeys.entities.all, "detail"] as const,
    detail: (id: string) => [...adminQueryKeys.entities.details(), id] as const,
    bySlug: (slug: string) => [...adminQueryKeys.entities.all, "slug", slug] as const
  },
  reports: {
    all: ["reports"] as const,
    lists: () => [...adminQueryKeys.reports.all, "list"] as const,
    list: (filters: Record<string, string>) => [...adminQueryKeys.reports.lists(), filters] as const,
    details: () => [...adminQueryKeys.reports.all, "detail"] as const,
    detail: (id: string) => [...adminQueryKeys.reports.details(), id] as const
  },
  contributions: {
    all: ["contributions"] as const,
    lists: () => [...adminQueryKeys.contributions.all, "list"] as const,
    list: (filters: Record<string, string>) => [...adminQueryKeys.contributions.lists(), filters] as const,
    details: () => [...adminQueryKeys.contributions.all, "detail"] as const,
    detail: (id: string) => [...adminQueryKeys.contributions.details(), id] as const
  }
};

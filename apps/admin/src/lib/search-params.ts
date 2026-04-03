export function toSearchString(filters: Record<string, string>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    const next = value.trim();
    if (next) {
      params.set(key, next);
    }
  });

  return params.toString();
}

export function hasActiveFilters(filters: Record<string, string>) {
  return Object.values(filters).some((value) => value.trim().length > 0);
}

export function parsePositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

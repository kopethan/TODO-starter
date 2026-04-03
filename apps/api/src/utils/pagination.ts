export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export function getPagination(page: number, pageSize: number, totalItems: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const skip = (currentPage - 1) * pageSize;

  return {
    page: currentPage,
    pageSize,
    totalItems,
    totalPages,
    skip,
    take: pageSize,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  };
}

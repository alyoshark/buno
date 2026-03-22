import type { PaginationInfo } from "./theme-api.ts";

export type PaginatedResult<T> = {
  items: T[];
  pagination: PaginationInfo;
};

export function paginateItems<T>(items: T[], pageSize: number, baseUrl: string): PaginatedResult<T>[] {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.max(1, Math.ceil(items.length / safePageSize));
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  return Array.from({ length: totalPages }, (_, index) => {
    const currentPage = index + 1;
    const start = index * safePageSize;
    const end = start + safePageSize;
    const pageItems = items.slice(start, end);

    return {
      items: pageItems,
      pagination: {
        currentPage,
        totalPages,
        pageSize: safePageSize,
        totalItems: items.length,
        prevUrl: currentPage > 1 ? pageUrl(normalizedBaseUrl, currentPage - 1) : undefined,
        nextUrl: currentPage < totalPages ? pageUrl(normalizedBaseUrl, currentPage + 1) : undefined,
        links: Array.from({ length: totalPages }, (_page, pageIndex) => {
          const number = pageIndex + 1;
          return {
            number,
            url: pageUrl(normalizedBaseUrl, number),
            current: number === currentPage,
          };
        }),
      },
    };
  });
}

function pageUrl(baseUrl: string, pageNumber: number): string {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  return pageNumber <= 1 ? normalizedBaseUrl : `${normalizedBaseUrl}page/${pageNumber}/`;
}

function normalizeBaseUrl(baseUrl: string): string {
  const withLeadingSlash = baseUrl.startsWith("/") ? baseUrl : `/${baseUrl}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.min(50, Math.max(5, Number(searchParams.get('limit') ?? '10')));
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  return { page, limit, search, status, skip: (page - 1) * limit };
}

export function buildPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
}
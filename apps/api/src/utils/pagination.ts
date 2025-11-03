export function parsePagination(q: any) {
  const page = Number(q.page) || 1;
  const limit = Number(q.limit) || 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
export function toInt(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

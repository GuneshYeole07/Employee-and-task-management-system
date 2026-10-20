const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 'YYYY-MM-DD' -> '05 Oct 2026' (string parsing avoids timezone shifts). */
export function formatDate(value) {
  if (!value) return '—';
  const [y, m, d] = String(value).slice(0, 10).split('-');
  return `${d} ${MONTHS[Number(m) - 1]} ${y}`;
}
export const todayInputValue = () => new Date().toLocaleDateString('en-CA');

export function parseSort(value) {
  const [sortBy, order] = value.split(':');
  return { sortBy, order };
}
export const currentSortValue = (params, fallback = 'createdAt:desc') =>
  params.sortBy ? `${params.sortBy}:${params.order || (['createdAt', 'priority'].includes(params.sortBy) ? 'desc' : 'asc')}` : fallback;

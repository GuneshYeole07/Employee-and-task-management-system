import { ACTIVE_TASK_STATUSES } from './constants.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const isValidDateString = (s) => {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return false;
  const d = new Date(`${s}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
export const toDate = (s) => (s ? new Date(`${s}T00:00:00.000Z`) : null);
export const toDateString = (d) => (d ? new Date(d).toISOString().slice(0, 10) : null);
export const startOfToday = (now = new Date()) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

/** Single definition of "overdue", used by list, details, dashboard (query form) and CSV. */
export const isOverdue = ({ status, dueDate }, now = new Date()) =>
  ACTIVE_TASK_STATUSES.includes(status) && !!dueDate && new Date(dueDate) < startOfToday(now);

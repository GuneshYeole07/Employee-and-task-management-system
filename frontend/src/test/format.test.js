import { describe, expect, it } from 'vitest';
import { taskFormSchema } from '../schemas/task.schema.js';
import { currentSortValue, formatDate } from '../utils/format.js';

describe('format helpers', () => {
  it('formats dates without timezone shift', () => {
    expect(formatDate('2026-10-05')).toBe('05 Oct 2026');
    expect(formatDate(null)).toBe('—');
  });
  it('derives default sort order', () => {
    expect(currentSortValue({ sortBy: 'dueDate' })).toBe('dueDate:asc');
    expect(currentSortValue({ sortBy: 'priority' })).toBe('priority:desc');
  });
});

describe('task form validation', () => {
  const base = { title: 'Fix bug', employee: 'abc', priority: 'High', department: 'QA', startDate: '2026-10-10', dueDate: '2026-10-12', description: '' };
  it('accepts valid data', () => expect(taskFormSchema.safeParse(base).success).toBe(true));
  it('rejects due date before start date', () => {
    const r = taskFormSchema.safeParse({ ...base, dueDate: '2026-10-01' });
    expect(r.success).toBe(false);
    expect(r.error.issues[0].path).toEqual(['dueDate']);
  });
});

import { describe, expect, it } from 'vitest';
import { assertDateOrder, assertEmployeeAssignable, assertValidTransition, getAllowedStatuses } from '../src/services/taskRules.js';
import { buildTaskFilter, buildTaskSort } from '../src/services/task.service.js';
import { isOverdue } from '../src/utils/dates.js';
import { toCsvRow } from '../src/utils/csv.js';

const d = (s) => new Date(`${s}T00:00:00.000Z`);

describe('status transitions', () => {
  it('allows the documented flow', () => {
    expect(() => assertValidTransition('Todo', 'In Progress')).not.toThrow();
    expect(() => assertValidTransition('In Progress', 'Completed')).not.toThrow();
    expect(() => assertValidTransition('Todo', 'Cancelled')).not.toThrow();
    expect(() => assertValidTransition('In Progress', 'Cancelled')).not.toThrow();
  });
  it('rejects everything else', () => {
    expect(() => assertValidTransition('Todo', 'Completed')).toThrow(/Cannot change status/);
    expect(() => assertValidTransition('Completed', 'Todo')).toThrow();
    expect(() => assertValidTransition('Cancelled', 'In Progress')).toThrow();
    expect(getAllowedStatuses('Completed')).toEqual([]);
  });
});

describe('assignment rules', () => {
  const onLeave = { status: 'On Leave', leaveStartDate: d('2026-11-10'), leaveEndDate: d('2026-11-15') };
  it('rejects inactive employees always', () => {
    expect(() => assertEmployeeAssignable({ status: 'Inactive' }, d('2026-01-01'))).toThrow(/Inactive/);
  });
  it('accepts active employees', () => {
    expect(() => assertEmployeeAssignable({ status: 'Active' }, d('2026-01-01'))).not.toThrow();
  });
  it('rejects on-leave only when start date is inside the leave (inclusive)', () => {
    expect(() => assertEmployeeAssignable(onLeave, d('2026-11-10'))).toThrow(/on leave/);
    expect(() => assertEmployeeAssignable(onLeave, d('2026-11-15'))).toThrow(/on leave/);
    expect(() => assertEmployeeAssignable(onLeave, d('2026-11-12'))).toThrow(/on leave/);
    expect(() => assertEmployeeAssignable(onLeave, d('2026-11-09'))).not.toThrow();
    expect(() => assertEmployeeAssignable(onLeave, d('2026-11-16'))).not.toThrow();
  });
});

describe('dates', () => {
  it('rejects due before start, allows same day', () => {
    expect(() => assertDateOrder(d('2026-10-10'), d('2026-10-09'))).toThrow();
    expect(() => assertDateOrder(d('2026-10-10'), d('2026-10-10'))).not.toThrow();
  });
  it('overdue only when today is after due date and task is active', () => {
    const now = new Date('2026-10-19T10:00:00Z');
    expect(isOverdue({ status: 'Todo', dueDate: d('2026-10-18') }, now)).toBe(true);
    expect(isOverdue({ status: 'Todo', dueDate: d('2026-10-19') }, now)).toBe(false);
    expect(isOverdue({ status: 'Completed', dueDate: d('2026-10-01') }, now)).toBe(false);
    expect(isOverdue({ status: 'Cancelled', dueDate: d('2026-10-01') }, now)).toBe(false);
  });
});

describe('query building', () => {
  it('combines filters with $and and escapes search text', () => {
    const f = buildTaskFilter({ q: 'a.b(', status: 'Todo', priority: 'High', department: 'QA', dueFrom: '2026-10-01', dueTo: '2026-10-31' });
    expect(f.$and).toHaveLength(6);
    expect(f.$and[0].$or[0].title.source).toBe('a\\.b\\(');
  });
  it('sorts priority by rank, not alphabetically', () => {
    expect(buildTaskSort({ sortBy: 'priority' })).toEqual({ priorityRank: -1, _id: 1 });
    expect(buildTaskSort({ sortBy: 'dueDate', order: 'desc' })).toEqual({ dueDate: -1, _id: 1 });
  });
});

describe('csv', () => {
  it('quotes commas and neutralises formulas', () => {
    expect(toCsvRow(['a,b', '=SUM(A1)', 'say "hi"'])).toBe('"a,b",\'=SUM(A1),"say ""hi"""\r\n');
  });
});

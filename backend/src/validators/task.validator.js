import { z } from 'zod';
import { DEPARTMENTS, PRIORITIES, TASK_STATUSES } from '../utils/constants.js';
import { dateString, objectId, pagination, sortOrder } from './common.js';

export const taskSchema = z
  .object({
    title: z.string({ required_error: 'Title is required' }).trim().min(3, 'Title must be at least 3 characters').max(120, 'Title is too long'),
    description: z.string().trim().max(1000, 'Description is too long').optional().default(''),
    employee: objectId,
    department: z.enum(DEPARTMENTS, { errorMap: () => ({ message: 'Select a valid department' }) }),
    priority: z.enum(PRIORITIES, { errorMap: () => ({ message: 'Select a valid priority' }) }),
    startDate: dateString,
    dueDate: dateString,
  })
  .strict()
  .superRefine((d, ctx) => {
    if (d.startDate && d.dueDate && d.dueDate < d.startDate) {
      ctx.addIssue({ code: 'custom', path: ['dueDate'], message: 'Due date cannot be earlier than start date' });
    }
  });

export const statusSchema = z
  .object({ status: z.enum(TASK_STATUSES, { errorMap: () => ({ message: `Status must be one of: ${TASK_STATUSES.join(', ')}` }) }) })
  .strict();

export const taskListQuery = z
  .object({
    ...pagination,
    q: z.string().trim().max(100).optional(),
    department: z.enum(DEPARTMENTS).optional(),
    priority: z.enum(PRIORITIES).optional(),
    status: z.enum(TASK_STATUSES).optional(),
    employee: objectId.optional(),
    dueFrom: dateString.optional(),
    dueTo: dateString.optional(),
    overdue: z.enum(['true', 'false']).optional(),
    sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'title']).default('createdAt'),
    order: sortOrder.optional(),
  })
  .refine((q) => !(q.dueFrom && q.dueTo) || q.dueTo >= q.dueFrom, {
    path: ['dueTo'],
    message: 'Due "to" date cannot be earlier than "from" date',
  });

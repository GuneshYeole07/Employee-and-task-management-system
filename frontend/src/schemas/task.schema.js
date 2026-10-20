import { z } from 'zod';
import { DEPARTMENTS, PRIORITIES } from '../constants/options.js';

export const taskFormSchema = z
  .object({
    title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120, 'Title is too long'),
    employee: z.string().min(1, 'Select an employee'),
    priority: z.enum(PRIORITIES, { errorMap: () => ({ message: 'Select a priority' }) }),
    department: z.enum(DEPARTMENTS, { errorMap: () => ({ message: 'Select a department' }) }),
    startDate: z.string().min(1, 'Start date is required'),
    dueDate: z.string().min(1, 'Due date is required'),
    description: z.string().trim().max(1000, 'Description is too long'),
  })
  .refine((d) => !d.startDate || !d.dueDate || d.dueDate >= d.startDate, {
    path: ['dueDate'],
    message: 'Due date cannot be earlier than start date',
  });

export const taskDefaults = { title: '', employee: '', priority: '', department: '', startDate: '', dueDate: '', description: '' };

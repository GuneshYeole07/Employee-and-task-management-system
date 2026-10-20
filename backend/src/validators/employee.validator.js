import { z } from 'zod';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../utils/constants.js';
import { dateString, pagination, sortOrder } from './common.js';

const optionalDate = z.union([dateString, z.literal(''), z.null()]).optional().transform((v) => v || null);

export const employeeSchema = z
  .object({
    employeeId: z
      .string({ required_error: 'Employee ID is required' })
      .trim()
      .min(1, 'Employee ID is required')
      .max(30, 'Employee ID is too long')
      .regex(/^[A-Za-z0-9_-]+$/, 'Use only letters, numbers, - and _')
      .transform((s) => s.toUpperCase()),
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name is too long')
      .regex(/^[\p{L}][\p{L}\s.'-]*$/u, 'Name can only contain letters, spaces, . \' and -'),
    email: z.string({ required_error: 'Email is required' }).trim().toLowerCase().email('Enter a valid email address').max(254),
    phone: z
      .string({ required_error: 'Phone is required' })
      .trim()
      .regex(/^\+?[0-9\s()-]+$/, 'Phone can contain digits, spaces, ( ) - and a leading +')
      .refine((v) => {
        const digits = v.replace(/\D/g, '').length;
        return digits >= 10 && digits <= 15;
      }, 'Phone must have 10 to 15 digits'),
    department: z.enum(DEPARTMENTS, { errorMap: () => ({ message: 'Select a valid department' }) }),
    role: z.string({ required_error: 'Role is required' }).trim().min(2, 'Role is required').max(60),
    joiningDate: dateString.refine(
      (d) => d <= new Date().toISOString().slice(0, 10),
      'Joining date cannot be in the future'
    ),
    status: z.enum(EMPLOYEE_STATUSES, { errorMap: () => ({ message: 'Select a valid status' }) }).default('Active'),
    skills: z
      .array(z.string().trim().min(1).max(40, 'Skill is too long'))
      .max(20, 'At most 20 skills')
      .default([])
      .transform((arr) => [...new Set(arr)]),
    leaveStartDate: optionalDate,
    leaveEndDate: optionalDate,
  })
  .superRefine((d, ctx) => {
    if (d.status !== 'On Leave') return;
    if (!d.leaveStartDate) ctx.addIssue({ code: 'custom', path: ['leaveStartDate'], message: 'Leave start date is required' });
    if (!d.leaveEndDate) ctx.addIssue({ code: 'custom', path: ['leaveEndDate'], message: 'Leave end date is required' });
    if (d.leaveStartDate && d.leaveEndDate && d.leaveEndDate < d.leaveStartDate) {
      ctx.addIssue({ code: 'custom', path: ['leaveEndDate'], message: 'Leave end date cannot be earlier than start date' });
    }
  })
  // Leave dates only make sense while On Leave: clear them otherwise so no stale data is stored.
  .transform((d) => (d.status === 'On Leave' ? d : { ...d, leaveStartDate: null, leaveEndDate: null }));

export const employeeListQuery = z.object({
  ...pagination,
  q: z.string().trim().max(100).optional(),
  department: z.enum(DEPARTMENTS).optional(),
  status: z.enum(EMPLOYEE_STATUSES).optional(),
  sortBy: z.enum(['createdAt', 'fullName', 'joiningDate', 'employeeId']).default('createdAt'),
  order: sortOrder.optional(),
});

export const employeeOptionsQuery = z.object({
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(200),
});

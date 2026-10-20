import { z } from 'zod';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../constants/options.js';
import { todayInputValue } from '../utils/format.js';

export const employeeFormSchema = z
  .object({
    employeeId: z.string().trim().min(1, 'Employee ID is required').max(30, 'Employee ID is too long').regex(/^[A-Za-z0-9_-]+$/, 'Use only letters, numbers, - and _'),
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100).regex(/^[\p{L}][\p{L}\s.'-]*$/u, "Name can only contain letters, spaces, . ' and -"),
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
    phone: z
      .string()
      .trim()
      .min(1, 'Phone is required')
      .regex(/^\+?[0-9\s()-]+$/, 'Phone can contain digits, spaces, ( ) - and a leading +')
      .refine((v) => v.replace(/\D/g, '').length >= 10 && v.replace(/\D/g, '').length <= 15, 'Phone must have 10 to 15 digits'),
    department: z.enum(DEPARTMENTS, { errorMap: () => ({ message: 'Select a department' }) }),
    role: z.string().trim().min(2, 'Role is required').max(60),
    joiningDate: z.string().min(1, 'Joining date is required').refine((d) => d <= todayInputValue(), 'Joining date cannot be in the future'),
    status: z.enum(EMPLOYEE_STATUSES),
    skills: z.string().refine((s) => s.split(',').filter((x) => x.trim()).length <= 20, 'At most 20 skills'),
    leaveStartDate: z.string().optional(),
    leaveEndDate: z.string().optional(),
  })
  .superRefine((d, ctx) => {
    if (d.status !== 'On Leave') return;
    if (!d.leaveStartDate) ctx.addIssue({ code: 'custom', path: ['leaveStartDate'], message: 'Leave start date is required' });
    if (!d.leaveEndDate) ctx.addIssue({ code: 'custom', path: ['leaveEndDate'], message: 'Leave end date is required' });
    if (d.leaveStartDate && d.leaveEndDate && d.leaveEndDate < d.leaveStartDate) {
      ctx.addIssue({ code: 'custom', path: ['leaveEndDate'], message: 'Leave end date cannot be earlier than start date' });
    }
  });

export const employeeDefaults = {
  employeeId: '', fullName: '', email: '', phone: '', department: '', role: '',
  joiningDate: '', status: 'Active', skills: '', leaveStartDate: '', leaveEndDate: '',
};

export const toEmployeePayload = (v) => ({
  ...v,
  skills: v.skills.split(',').map((s) => s.trim()).filter(Boolean),
  leaveStartDate: v.status === 'On Leave' ? v.leaveStartDate : null,
  leaveEndDate: v.status === 'On Leave' ? v.leaveEndDate : null,
});

import { z } from 'zod';
import { isValidDateString } from '../utils/dates.js';

export const dateString = z
  .string({ required_error: 'Date is required', invalid_type_error: 'Date is required' })
  .refine(isValidDateString, 'Use a valid date (YYYY-MM-DD)');

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
};

export const sortOrder = z.enum(['asc', 'desc']);

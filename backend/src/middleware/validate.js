import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

export const validate = (schema, source = 'body') => (req, res, next) => {
  let input = req[source];
  if (source === 'query') {
    input = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== ''));
  }
  const result = schema.safeParse(input);
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    return next(new AppError(400, errors[0]?.message || 'Invalid data', errors));
  }
  if (source === 'query') req.validatedQuery = result.data;
  else req[source] = result.data;
  return next();
};

/** Status and completedAt must never come through create / edit. */
export const rejectProtectedTaskFields = (req, res, next) => {
  const protectedKeys = ['status', 'completedAt', 'completedDate', 'taskId'];
  const sent = protectedKeys.filter((k) => req.body && Object.hasOwn(req.body, k));
  if (sent.length) {
    return next(new AppError(400, `${sent.join(', ')} cannot be set here. Use PUT /api/tasks/:id/status to change status.`));
  }
  return next();
};

export const validateIdParam = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) && /^[a-f\d]{24}$/i.test(req.params.id)
    ? next()
    : next(new AppError(404, 'Record not found.'));

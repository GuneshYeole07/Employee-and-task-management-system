import { AppError } from '../utils/AppError.js';

export const notFound = (req, res, next) => next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    const label = { email: 'email address', employeeId: 'Employee ID' }[field] || field;
    return res.status(409).json({
      success: false,
      message: `An employee with this ${label} already exists.`,
      errors: [{ path: field, message: `This ${label} is already in use` }],
    });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON.' });
  }
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ success: false, message: err.message });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  return res.status(status).json({
    success: false,
    message: status >= 500 ? 'Something went wrong on the server.' : err.message,
    ...(err.errors && { errors: err.errors }),
  });
};

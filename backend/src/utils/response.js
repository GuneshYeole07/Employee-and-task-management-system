export const sendSuccess = (res, data, { status = 200, meta, message } = {}) =>
  res.status(status).json({ success: true, ...(message && { message }), data, ...(meta && { meta }) });

export const buildMeta = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

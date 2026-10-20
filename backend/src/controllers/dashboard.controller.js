import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import { getDashboard } from '../services/dashboard.service.js';

export const summary = asyncHandler(async (req, res) => sendSuccess(res, await getDashboard()));

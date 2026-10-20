import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';
import * as service from '../services/employee.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listEmployees(req.validatedQuery);
  sendSuccess(res, items, { meta });
});
export const options = asyncHandler(async (req, res) => sendSuccess(res, await service.listEmployeeOptions(req.validatedQuery)));
export const get = asyncHandler(async (req, res) => sendSuccess(res, await service.getEmployee(req.params.id)));
export const create = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.createEmployee(req.body), { status: 201, message: 'Employee created.' })
);
export const update = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.updateEmployee(req.params.id, req.body), { message: 'Employee updated.' })
);
export const remove = asyncHandler(async (req, res) => {
  await service.deleteEmployee(req.params.id);
  sendSuccess(res, null, { message: 'Employee deleted.' });
});

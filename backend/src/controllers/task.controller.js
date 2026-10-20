import { asyncHandler } from '../utils/asyncHandler.js';
import { toCsvRow } from '../utils/csv.js';
import { toDateString } from '../utils/dates.js';
import { sendSuccess } from '../utils/response.js';
import * as service from '../services/task.service.js';

export const list = asyncHandler(async (req, res) => {
  const { items, meta } = await service.listTasks(req.validatedQuery);
  sendSuccess(res, items, { meta });
});
export const get = asyncHandler(async (req, res) => sendSuccess(res, await service.getTask(req.params.id)));
export const create = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.createTask(req.body), { status: 201, message: 'Task created.' })
);
export const update = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.updateTask(req.params.id, req.body), { message: 'Task updated.' })
);
export const updateStatus = asyncHandler(async (req, res) =>
  sendSuccess(res, await service.changeStatus(req.params.id, req.body.status), { message: 'Status updated.' })
);
export const remove = asyncHandler(async (req, res) => {
  await service.deleteTask(req.params.id);
  sendSuccess(res, null, { message: 'Task deleted.' });
});

const CSV_HEADER = [
  'Task ID', 'Title', 'Description', 'Employee', 'Employee ID', 'Employee Deleted', 'Department',
  'Priority', 'Status', 'Start Date', 'Due Date', 'Created Date', 'Completed Date', 'Overdue',
];

export const exportCsv = asyncHandler(async (req, res) => {
  const now = new Date();
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="tasks-${toDateString(now)}.csv"`);
  res.write('\uFEFF' + toCsvRow(CSV_HEADER));
  for await (const t of service.exportCursor(req.validatedQuery)) {
    const row = service.serializeTask(t, now);
    res.write(
      toCsvRow([
        row.taskId, row.title, row.description, row.employee.fullName, row.employee.employeeId,
        row.employee.isDeleted ? 'Yes' : 'No', row.department, row.priority, row.status,
        row.startDate, row.dueDate, toDateString(row.createdAt), toDateString(row.completedAt),
        row.isOverdue ? 'Yes' : 'No',
      ])
    );
  }
  res.end();
});

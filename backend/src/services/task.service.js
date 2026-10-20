import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { nextSequence } from '../models/Counter.js';
import { AppError } from '../utils/AppError.js';
import { ACTIVE_TASK_STATUSES, MAX_ACTIVE_TASKS, PRIORITY_RANK } from '../utils/constants.js';
import { isOverdue, startOfToday, toDate, toDateString } from '../utils/dates.js';
import { escapeRegex } from '../utils/regex.js';
import { buildMeta } from '../utils/response.js';
import { assertDateOrder, assertEmployeeAssignable, assertValidTransition, getAllowedStatuses } from './taskRules.js';

export const serializeTask = (t, now = new Date()) => ({
  id: String(t._id),
  taskId: t.taskId,
  title: t.title,
  description: t.description,
  employee: { id: String(t.employee), ...t.employeeSnapshot, isDeleted: !!t.employeeDeleted },
  department: t.department,
  priority: t.priority,
  status: t.status,
  startDate: toDateString(t.startDate),
  dueDate: toDateString(t.dueDate),
  createdAt: t.createdAt,
  completedAt: t.completedAt,
  isOverdue: isOverdue(t, now),
  allowedStatuses: getAllowedStatuses(t.status),
});

const snapshotOf = (e) => ({
  employeeId: e.employeeId,
  fullName: e.fullName,
  email: e.email,
  department: e.department,
  role: e.role,
});

/* ---------- capacity (3 active tasks) – atomic, so parallel requests cannot exceed the limit ---------- */
async function reserveSlot(employeeId) {
  const reserved = await Employee.findOneAndUpdate(
    { _id: employeeId, activeTaskCount: { $lt: MAX_ACTIVE_TASKS } },
    { $inc: { activeTaskCount: 1 } }
  );
  if (!reserved) throw new AppError(400, 'Employee already has 3 active tasks. Please choose another employee.');
}
const releaseSlot = (employeeId) =>
  Employee.updateOne({ _id: employeeId, activeTaskCount: { $gt: 0 } }, { $inc: { activeTaskCount: -1 } });

/* ---------- list / filter / sort ---------- */
export function buildTaskFilter(q, now = new Date()) {
  const and = [];
  if (q.q) {
    const rx = new RegExp(escapeRegex(q.q), 'i');
    and.push({ $or: [{ title: rx }, { 'employeeSnapshot.fullName': rx }] });
  }
  ['department', 'priority', 'status'].forEach((k) => q[k] && and.push({ [k]: q[k] }));
  if (q.employee) and.push({ employee: new mongoose.Types.ObjectId(q.employee) });
  if (q.dueFrom) and.push({ dueDate: { $gte: toDate(q.dueFrom) } });
  if (q.dueTo) and.push({ dueDate: { $lte: toDate(q.dueTo) } });
  const overdueClause = { status: { $in: ACTIVE_TASK_STATUSES }, dueDate: { $lt: startOfToday(now) } };
  if (q.overdue === 'true') and.push(overdueClause);
  if (q.overdue === 'false') and.push({ $nor: [overdueClause] });
  return and.length ? { $and: and } : {};
}

const SORT_FIELDS = { createdAt: 'createdAt', dueDate: 'dueDate', priority: 'priorityRank', title: 'title' };
export function buildTaskSort({ sortBy = 'createdAt', order }) {
  const defaultOrder = sortBy === 'createdAt' || sortBy === 'priority' ? 'desc' : 'asc';
  return { [SORT_FIELDS[sortBy]]: (order ?? defaultOrder) === 'asc' ? 1 : -1, _id: 1 };
}

export async function listTasks(query) {
  const now = new Date();
  const filter = buildTaskFilter(query, now);
  const [rows, total] = await Promise.all([
    Task.find(filter)
      .sort(buildTaskSort(query))
      .collation({ locale: 'en', strength: 2 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean(),
    Task.countDocuments(filter),
  ]);
  return { items: rows.map((t) => serializeTask(t, now)), meta: buildMeta(query.page, query.limit, total) };
}

/** Cursor over ALL tasks matching the filters (no pagination) for CSV export. */
export const exportCursor = (query) =>
  Task.find(buildTaskFilter(query)).sort(buildTaskSort(query)).collation({ locale: 'en', strength: 2 }).lean().cursor();

const findTaskOrThrow = async (id) => {
  const task = await Task.findById(id).lean();
  if (!task) throw new AppError(404, 'Task not found.');
  return task;
};

export async function getTask(id) {
  return serializeTask(await findTaskOrThrow(id));
}

const findEmployeeOrThrow = async (id) => {
  const employee = await Employee.findById(id).lean();
  if (!employee) throw new AppError(404, 'Assigned employee not found.');
  return employee;
};

/* ---------- create ---------- */
export async function createTask(body) {
  const startDate = toDate(body.startDate);
  const dueDate = toDate(body.dueDate);
  assertDateOrder(startDate, dueDate);
  const employee = await findEmployeeOrThrow(body.employee);
  assertEmployeeAssignable(employee, startDate);
  await reserveSlot(employee._id);
  try {
    const seq = await nextSequence('task');
    const task = await Task.create({
      taskId: `TSK-${String(seq).padStart(3, '0')}`,
      title: body.title,
      description: body.description,
      employee: employee._id,
      employeeSnapshot: snapshotOf(employee),
      department: body.department,
      priority: body.priority,
      startDate,
      dueDate,
      status: 'Todo',
    });
    return serializeTask(task.toObject());
  } catch (err) {
    await releaseSlot(employee._id);
    throw err;
  }
}

/* ---------- edit (never touches status / completedAt) ---------- */
export async function updateTask(id, body) {
  const task = await findTaskOrThrow(id);
  if (!ACTIVE_TASK_STATUSES.includes(task.status)) {
    throw new AppError(400, `${task.status} tasks cannot be edited.`);
  }
  const startDate = toDate(body.startDate);
  const dueDate = toDate(body.dueDate);
  assertDateOrder(startDate, dueDate);
  const employee = await findEmployeeOrThrow(body.employee);
  const employeeChanged = String(task.employee) !== String(employee._id);
  const startChanged = task.startDate.getTime() !== startDate.getTime();
  if (employeeChanged || startChanged) assertEmployeeAssignable(employee, startDate);
  if (employeeChanged) await reserveSlot(employee._id);

  const updated = await Task.findOneAndUpdate(
    { _id: id, status: { $in: ACTIVE_TASK_STATUSES } },
    {
      $set: {
        title: body.title,
        description: body.description,
        employee: employee._id,
        employeeSnapshot: snapshotOf(employee),
        employeeDeleted: false,
        department: body.department,
        priority: body.priority,
        priorityRank: PRIORITY_RANK[body.priority],
        startDate,
        dueDate,
      },
    },
    { new: true }
  ).lean();
  if (!updated) {
    if (employeeChanged) await releaseSlot(employee._id);
    throw new AppError(400, 'This task can no longer be edited. Refresh and try again.');
  }
  if (employeeChanged) await releaseSlot(task.employee);
  return serializeTask(updated);
}

/* ---------- status (the ONLY place status changes) ---------- */
export async function changeStatus(id, nextStatus) {
  const task = await findTaskOrThrow(id);
  assertValidTransition(task.status, nextStatus);
  const $set = { status: nextStatus };
  if (nextStatus === 'Completed') $set.completedAt = new Date(); // server clock only
  // compare-and-set on the old status so two concurrent requests cannot both succeed
  const updated = await Task.findOneAndUpdate({ _id: id, status: task.status }, { $set }, { new: true }).lean();
  if (!updated) throw new AppError(400, 'Task status was changed by someone else. Refresh and try again.');
  if (!ACTIVE_TASK_STATUSES.includes(nextStatus)) await releaseSlot(task.employee);
  return serializeTask(updated);
}

export async function deleteTask(id) {
  const task = await Task.findByIdAndDelete(id).lean();
  if (!task) throw new AppError(404, 'Task not found.');
  if (ACTIVE_TASK_STATUSES.includes(task.status)) await releaseSlot(task.employee);
}

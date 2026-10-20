import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { AppError } from '../utils/AppError.js';
import { ACTIVE_TASK_STATUSES } from '../utils/constants.js';
import { toDate, toDateString } from '../utils/dates.js';
import { escapeRegex } from '../utils/regex.js';
import { buildMeta } from '../utils/response.js';

export const serializeEmployee = (e) => ({
  id: String(e._id),
  employeeId: e.employeeId,
  fullName: e.fullName,
  email: e.email,
  phone: e.phone,
  department: e.department,
  role: e.role,
  joiningDate: toDateString(e.joiningDate),
  status: e.status,
  skills: e.skills,
  leaveStartDate: toDateString(e.leaveStartDate),
  leaveEndDate: toDateString(e.leaveEndDate),
  activeTaskCount: e.activeTaskCount ?? 0,
  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
});

const toDocument = (body) => ({
  ...body,
  joiningDate: toDate(body.joiningDate),
  leaveStartDate: toDate(body.leaveStartDate),
  leaveEndDate: toDate(body.leaveEndDate),
});

const snapshotOf = (e) => ({
  employeeId: e.employeeId,
  fullName: e.fullName,
  email: e.email,
  department: e.department,
  role: e.role,
});

const findOrThrow = async (id) => {
  const employee = await Employee.findById(id);
  if (!employee) throw new AppError(404, 'Employee not found.');
  return employee;
};

export async function listEmployees(query) {
  const { page, limit, q, department, status, sortBy, order } = query;
  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ fullName: rx }, { email: rx }, { employeeId: rx }];
  }
  if (department) filter.department = department;
  if (status) filter.status = status;
  const dir = (order ?? (sortBy === 'createdAt' || sortBy === 'joiningDate' ? 'desc' : 'asc')) === 'asc' ? 1 : -1;
  const [rows, total] = await Promise.all([
    Employee.find(filter)
      .sort({ [sortBy]: dir, _id: 1 })
      .collation({ locale: 'en', strength: 2 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Employee.countDocuments(filter),
  ]);
  return { items: rows.map(serializeEmployee), meta: buildMeta(page, limit, total) };
}

/** Lightweight list for the "Assigned Employee" dropdown. */
export async function listEmployeeOptions({ q, limit }) {
  const filter = q ? { fullName: new RegExp(escapeRegex(q), 'i') } : {};
  const rows = await Employee.find(filter).sort({ fullName: 1 }).limit(limit).lean();
  return rows.map((e) => ({
    id: String(e._id),
    employeeId: e.employeeId,
    fullName: e.fullName,
    department: e.department,
    status: e.status,
    leaveStartDate: toDateString(e.leaveStartDate),
    leaveEndDate: toDateString(e.leaveEndDate),
  }));
}

export async function getEmployee(id) {
  return serializeEmployee(await findOrThrow(id));
}

export async function createEmployee(body) {
  const employee = await Employee.create(toDocument(body));
  return serializeEmployee(employee);
}

export async function updateEmployee(id, body) {
  const employee = await findOrThrow(id);
  employee.set(toDocument(body));
  await employee.save();
  // keep the denormalised snapshot on the employee's tasks in sync
  await Task.updateMany({ employee: employee._id }, { $set: { employeeSnapshot: snapshotOf(employee) } });
  return serializeEmployee(employee);
}

export async function deleteEmployee(id) {
  const employee = await findOrThrow(id);
  const activeTasks = await Task.countDocuments({ employee: employee._id, status: { $in: ACTIVE_TASK_STATUSES } });
  if (activeTasks > 0) {
    throw new AppError(
      400,
      `Cannot delete ${employee.fullName}: ${activeTasks} task${activeTasks > 1 ? 's are' : ' is'} still Todo / In Progress. Complete, cancel or reassign them first.`
    );
  }
  // Atomic guard: a task reserved for this employee between the check above and now still blocks deletion.
  const deleted = await Employee.findOneAndDelete({ _id: employee._id, activeTaskCount: { $lte: 0 } });
  if (!deleted) throw new AppError(400, 'Cannot delete employee: a task was just assigned to them.');
  await Task.updateMany({ employee: employee._id }, { $set: { employeeDeleted: true } });
}

import Employee from '../models/Employee.js';
import Task from '../models/Task.js';
import { ACTIVE_TASK_STATUSES } from '../utils/constants.js';
import { startOfToday } from '../utils/dates.js';

const countBy = (rows) => Object.fromEntries(rows.map((r) => [r._id, r.count]));

export async function getDashboard() {
  const [employeeRows, taskRows, overdue, workload] = await Promise.all([
    Employee.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.countDocuments({ status: { $in: ACTIVE_TASK_STATUSES }, dueDate: { $lt: startOfToday() } }),
    Task.aggregate([
      { $match: { status: { $in: ACTIVE_TASK_STATUSES } } },
      {
        $group: {
          _id: '$employee',
          fullName: { $first: '$employeeSnapshot.fullName' },
          employeeId: { $first: '$employeeSnapshot.employeeId' },
          isDeleted: { $first: '$employeeDeleted' },
          activeTasks: { $sum: 1 },
        },
      },
      { $sort: { activeTasks: -1, fullName: 1 } },
      { $limit: 20 },
    ]),
  ]);
  const e = countBy(employeeRows);
  const t = countBy(taskRows);
  const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
  return {
    employees: { total: sum(e), active: e.Active ?? 0, inactive: e.Inactive ?? 0, onLeave: e['On Leave'] ?? 0 },
    tasks: {
      total: sum(t),
      todo: t.Todo ?? 0,
      inProgress: t['In Progress'] ?? 0,
      completed: t.Completed ?? 0,
      cancelled: t.Cancelled ?? 0,
      overdue,
    },
    workload: workload.map((w) => ({
      employeeId: String(w._id),
      employeeCode: w.employeeId,
      fullName: w.fullName,
      isDeleted: !!w.isDeleted,
      activeTasks: w.activeTasks,
    })),
  };
}

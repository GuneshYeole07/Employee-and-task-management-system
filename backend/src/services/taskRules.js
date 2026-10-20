import { AppError } from '../utils/AppError.js';
import { STATUS_TRANSITIONS } from '../utils/constants.js';
import { toDateString } from '../utils/dates.js';

export const getAllowedStatuses = (status) => STATUS_TRANSITIONS[status] ?? [];

export function assertValidTransition(from, to) {
  const allowed = getAllowedStatuses(from);
  if (!allowed.includes(to)) {
    throw new AppError(
      400,
      `Cannot change status from ${from} to ${to}. ${allowed.length ? `Allowed: ${allowed.join(', ')}.` : `${from} is a final status.`}`
    );
  }
}

export function assertDateOrder(startDate, dueDate) {
  if (dueDate < startDate) throw new AppError(400, 'Due date cannot be earlier than start date.');
}

export function assertEmployeeAssignable(employee, startDate) {
  if (employee.status === 'Inactive') {
    throw new AppError(400, 'Inactive employees cannot be assigned tasks.');
  }
  if (employee.status === 'On Leave' && employee.leaveStartDate && employee.leaveEndDate) {
    if (startDate >= employee.leaveStartDate && startDate <= employee.leaveEndDate) {
      throw new AppError(
        400,
        `Employee is on leave from ${toDateString(employee.leaveStartDate)} to ${toDateString(employee.leaveEndDate)}. The task start date falls inside this period.`
      );
    }
  }
}

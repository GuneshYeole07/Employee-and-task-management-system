export const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];
export const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave'];
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
export const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];
export const PAGE_SIZE = 10;

export const TASK_SORTS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'dueDate:asc', label: 'Due date (earliest)' },
  { value: 'dueDate:desc', label: 'Due date (latest)' },
  { value: 'priority:desc', label: 'Priority (most important)' },
  { value: 'priority:asc', label: 'Priority (least important)' },
  { value: 'title:asc', label: 'Title A–Z' },
  { value: 'title:desc', label: 'Title Z–A' },
];
export const EMPLOYEE_SORTS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'fullName:asc', label: 'Name A–Z' },
  { value: 'fullName:desc', label: 'Name Z–A' },
  { value: 'joiningDate:desc', label: 'Joined (recent)' },
  { value: 'joiningDate:asc', label: 'Joined (earliest)' },
];

export const STATUS_STYLES = {
  Todo: 'bg-slate-500 text-white',
  'In Progress': 'bg-blue-600 text-white',
  Completed: 'bg-green-700 text-white',
  Cancelled: 'bg-amber-800 text-white',
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-slate-200 text-slate-700',
  'On Leave': 'bg-amber-100 text-amber-800',
};
export const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-700',
  Medium: 'bg-sky-100 text-sky-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800',
};

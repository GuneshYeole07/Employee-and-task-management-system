import { formatDate } from '../../utils/format.js';
import { OverdueBadge } from '../ui/Badge.jsx';

export default function DueDate({ task }) {
  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${task.isOverdue ? 'font-semibold text-red-700' : ''}`}>
      {formatDate(task.dueDate)}
      {task.isOverdue && <OverdueBadge />}
    </span>
  );
}

import { PRIORITY_STYLES, STATUS_STYLES } from '../../constants/options.js';

const base = 'inline-block whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold';

export const StatusBadge = ({ status }) => <span className={`${base} ${STATUS_STYLES[status] || ''}`}>{status}</span>;
export const PriorityBadge = ({ priority }) => <span className={`${base} ${PRIORITY_STYLES[priority] || ''}`}>{priority}</span>;
export const OverdueBadge = () => <span className={`${base} bg-red-100 text-red-700`}>Overdue</span>;

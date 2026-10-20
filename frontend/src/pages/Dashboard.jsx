import { getDashboard } from '../api/tasks.js';
import ErrorBanner from '../components/ui/ErrorBanner.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import useFetch from '../hooks/useFetch.js';
import { Link } from 'react-router-dom';

function StatCard({ label, value, color, to }) {
  const body = (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className={`mt-1 text-3xl font-extrabold ${color}`}>{value}</div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(getDashboard, []);
  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;
  const { employees: e, tasks: t, workload } = data;
  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total Employees" value={e.total} color="text-slate-900" to="/employees" />
        <StatCard label="Active" value={e.active} color="text-green-700" to="/employees?status=Active" />
        <StatCard label="Inactive" value={e.inactive} color="text-slate-500" to="/employees?status=Inactive" />
        <StatCard label="On Leave" value={e.onLeave} color="text-amber-600" to="/employees?status=On%20Leave" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Tasks" value={t.total} color="text-slate-900" to="/tasks" />
        <StatCard label="Todo" value={t.todo} color="text-slate-500" to="/tasks?status=Todo" />
        <StatCard label="In Progress" value={t.inProgress} color="text-blue-700" to="/tasks?status=In%20Progress" />
        <StatCard label="Completed" value={t.completed} color="text-green-700" to="/tasks?status=Completed" />
        <StatCard label="Cancelled" value={t.cancelled} color="text-amber-800" to="/tasks?status=Cancelled" />
        <StatCard label="Overdue" value={t.overdue} color="text-red-600" to="/tasks?overdue=true" />
      </div>
      <h2 className="mb-2 mt-8 text-lg font-bold text-slate-900">Employee Workload</h2>
      <div className="card max-w-xl overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Employee</th>
              <th className="th">Active Tasks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workload.length === 0 && (
              <tr><td className="td text-slate-500" colSpan={2}>No active tasks yet.</td></tr>
            )}
            {workload.map((w) => (
              <tr key={w.employeeId}>
                <td className="td">
                  {w.isDeleted ? `${w.fullName} (deleted)` : <Link to={`/employees/${w.employeeId}`} className="hover:underline">{w.fullName}</Link>}
                </td>
                <td className="td font-semibold">{w.activeTasks} / 3</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

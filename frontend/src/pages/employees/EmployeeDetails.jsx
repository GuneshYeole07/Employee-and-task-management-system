import { Link, useParams } from 'react-router-dom';
import { getEmployee } from '../../api/employees.js';
import { listTasks } from '../../api/tasks.js';
import DueDate from '../../components/tasks/DueDate.jsx';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge.jsx';
import DetailItem from '../../components/ui/DetailItem.jsx';
import ErrorBanner from '../../components/ui/ErrorBanner.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import useFetch from '../../hooks/useFetch.js';
import { formatDate } from '../../utils/format.js';

export default function EmployeeDetails() {
  const { id } = useParams();
  const { data: e, loading, error, reload } = useFetch(() => getEmployee(id), [id]);
  const tasks = useFetch(() => listTasks({ employee: id, limit: 5, sortBy: 'dueDate' }), [id]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;

  return (
    <>
      <PageHeader title={e.fullName} subtitle={`${e.employeeId} · ${e.role}`}>
        <Link to={`/employees/${id}/edit`} className="btn-secondary">Edit</Link>
        <Link to="/employees" className="btn-secondary">Back</Link>
      </PageHeader>
      <div className="card p-6">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Status"><StatusBadge status={e.status} /></DetailItem>
          <DetailItem label="Department">{e.department}</DetailItem>
          <DetailItem label="Active Tasks">{e.activeTaskCount} / 3</DetailItem>
          <DetailItem label="Email">{e.email}</DetailItem>
          <DetailItem label="Phone">{e.phone}</DetailItem>
          <DetailItem label="Joining Date">{formatDate(e.joiningDate)}</DetailItem>
          {e.status === 'On Leave' && <DetailItem label="Leave Period">{formatDate(e.leaveStartDate)} – {formatDate(e.leaveEndDate)}</DetailItem>}
          <div className="sm:col-span-2 lg:col-span-3">
            <DetailItem label="Skills">
              {e.skills.length > 0 && (
                <span className="flex flex-wrap gap-2">
                  {e.skills.map((s) => <span key={s} className="rounded bg-slate-100 px-2 py-0.5 text-xs">{s}</span>)}
                </span>
              )}
            </DetailItem>
          </div>
        </dl>
      </div>
      <div className="mb-2 mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Tasks</h2>
        <Link to={`/tasks?employee=${id}`} className="text-sm font-semibold text-brand hover:underline">View all</Link>
      </div>
      <div className="card overflow-x-auto">
        {tasks.loading ? <Spinner /> : (
          <table className="w-full">
            <thead><tr>{['ID', 'Title', 'Priority', 'Status', 'Due Date'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {(tasks.data?.data ?? []).map((t) => (
                <tr key={t.id}>
                  <td className="td font-semibold"><Link to={`/tasks/${t.id}`} className="hover:underline">{t.taskId}</Link></td>
                  <td className="td">{t.title}</td>
                  <td className="td"><PriorityBadge priority={t.priority} /></td>
                  <td className="td"><StatusBadge status={t.status} /></td>
                  <td className="td"><DueDate task={t} /></td>
                </tr>
              ))}
              {tasks.data?.data.length === 0 && <tr><td className="td text-slate-500" colSpan={5}>No tasks assigned.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

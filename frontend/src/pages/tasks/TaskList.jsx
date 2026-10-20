import { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { deleteTask, exportTasksCsv, listTasks, updateTaskStatus } from '../../api/tasks.js';
import { getBlobErrorMessage, getErrorMessage } from '../../api/client.js';
import DueDate from '../../components/tasks/DueDate.jsx';
import EmployeeCell from '../../components/tasks/EmployeeCell.jsx';
import StatusSelect from '../../components/tasks/StatusSelect.jsx';
import { PriorityBadge } from '../../components/ui/Badge.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorBanner from '../../components/ui/ErrorBanner.jsx';
import { FilterSelect, SearchBox } from '../../components/ui/ListFilters.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import RowActions from '../../components/ui/RowActions.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { DEPARTMENTS, PAGE_SIZE, PRIORITIES, TASK_SORTS, TASK_STATUSES } from '../../constants/options.js';
import useFetch from '../../hooks/useFetch.js';
import useListParams from '../../hooks/useListParams.js';
import { currentSortValue, parseSort } from '../../utils/format.js';

export default function TaskList() {
  const { params, update, key } = useListParams();
  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data, loading, error, reload } = useFetch(() => listTasks({ ...params, limit: PAGE_SIZE }), [key]);
  const tasks = data?.data ?? [];
  const meta = data?.meta;

  async function handleStatus(task, status) {
    setBusyId(task.id);
    try {
      await updateTaskStatus(task.id, status);
      toast.success(`${task.taskId} moved to ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
      reload();
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTask(toDelete.id);
      toast.success('Task deleted');
      setToDelete(null);
      if (tasks.length === 1 && meta.page > 1) update({ page: meta.page - 1 }, { resetPage: false });
      else reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const { page, limit, ...filters } = params; // all matching rows, not just this page
      const blob = await exportTasksCsv(filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tasks-${new Date().toLocaleDateString('en-CA')}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch (err) {
      toast.error(await getBlobErrorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <PageHeader title="Tasks">
        <Link to="/tasks/new" className="btn-primary"><Plus className="h-4 w-4" /> Add Task</Link>
        <button type="button" className="btn-secondary" onClick={handleExport} disabled={exporting}>
          <Download className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export To CSV'}
        </button>
      </PageHeader>

      <div className="card mb-4 space-y-3 p-4">
        <SearchBox value={params.q} placeholder="Search title or employee" onSearch={(q) => update({ q })} />
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect label="Department" value={params.department} options={DEPARTMENTS} onChange={(v) => update({ department: v })} />
          <FilterSelect label="Priority" value={params.priority} options={PRIORITIES} onChange={(v) => update({ priority: v })} />
          <FilterSelect label="Status" value={params.status} options={TASK_STATUSES} onChange={(v) => update({ status: v })} />
          <label className="flex items-center gap-1 text-sm text-slate-600">
            Due from
            <input type="date" className="input w-auto" value={params.dueFrom || ''} max={params.dueTo || undefined} onChange={(e) => update({ dueFrom: e.target.value })} />
          </label>
          <label className="flex items-center gap-1 text-sm text-slate-600">
            to
            <input type="date" className="input w-auto" value={params.dueTo || ''} min={params.dueFrom || undefined} onChange={(e) => update({ dueTo: e.target.value })} />
          </label>
          <label className="flex items-center gap-1 text-sm text-slate-600">
            <input type="checkbox" checked={params.overdue === 'true'} onChange={(e) => update({ overdue: e.target.checked ? 'true' : '' })} />
            Overdue only
          </label>
          <FilterSelect
            label="Sort"
            allLabel="Newest first"
            value={currentSortValue(params) === 'createdAt:desc' ? '' : currentSortValue(params)}
            options={TASK_SORTS.slice(1)}
            onChange={(v) => update(v ? parseSort(v) : { sortBy: '', order: '' })}
          />
          {params.employee && (
            <button type="button" className="btn-secondary" onClick={() => update({ employee: '' })}>
              Single employee <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <ErrorBanner message={error} onRetry={reload} />
      <div className="card overflow-x-auto">
        {loading && !data ? (
          <Spinner />
        ) : (
          <table className={`w-full ${loading ? 'opacity-60' : ''}`}>
            <thead>
              <tr>
                {['ID', 'Title', 'Employee', 'Priority', 'Status', 'Due Date', 'Action'].map((h) => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td className="td font-semibold"><Link to={`/tasks/${t.id}`} className="hover:underline">{t.taskId}</Link></td>
                  <td className="td min-w-48">{t.title}</td>
                  <td className="td"><EmployeeCell employee={t.employee} /></td>
                  <td className="td"><PriorityBadge priority={t.priority} /></td>
                  <td className="td">
                    <StatusSelect current={t.status} allowed={t.allowedStatuses} disabled={busyId === t.id} onChange={(s) => handleStatus(t, s)} />
                  </td>
                  <td className="td"><DueDate task={t} /></td>
                  <td className="td">
                    <RowActions
                      label={t.taskId}
                      viewTo={`/tasks/${t.id}`}
                      editTo={t.allowedStatuses.length ? `/tasks/${t.id}/edit` : null}
                      onDelete={() => setToDelete(t)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !error && tasks.length === 0 && <EmptyState message="No tasks match the current filters." />}
        <Pagination meta={meta} itemLabel="tasks" onPageChange={(page) => update({ page }, { resetPage: false })} />
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete task?"
        message={toDelete ? `${toDelete.taskId} – ${toDelete.title} will be permanently deleted.` : ''}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

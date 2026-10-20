import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage } from '../../api/client.js';
import { deleteTask, getTask, updateTaskStatus } from '../../api/tasks.js';
import DueDate from '../../components/tasks/DueDate.jsx';
import EmployeeCell from '../../components/tasks/EmployeeCell.jsx';
import StatusSelect from '../../components/tasks/StatusSelect.jsx';
import { PriorityBadge } from '../../components/ui/Badge.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import DetailItem from '../../components/ui/DetailItem.jsx';
import ErrorBanner from '../../components/ui/ErrorBanner.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import useFetch from '../../hooks/useFetch.js';
import { formatDate } from '../../utils/format.js';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: task, loading, error, reload } = useFetch(() => getTask(id), [id]);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleStatus(status) {
    setBusy(true);
    try {
      await updateTaskStatus(id, status);
      toast.success(`Status changed to ${status}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
      reload();
    }
  }

  async function handleDelete() {
    setBusy(true);
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      navigate('/tasks');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setBusy(false);
    }
  }

  if (loading && !task) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={reload} />;
  const editable = task.allowedStatuses.length > 0;

  return (
    <>
      <PageHeader title={`${task.taskId} · ${task.title}`}>
        {editable && <Link to={`/tasks/${id}/edit`} className="btn-secondary">Edit</Link>}
        <button type="button" className="btn-danger" onClick={() => setConfirm(true)}>Delete</button>
        <Link to="/tasks" className="btn-secondary">Back</Link>
      </PageHeader>
      <div className="card p-6">
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Status">
            <StatusSelect current={task.status} allowed={task.allowedStatuses} disabled={busy} onChange={handleStatus} />
          </DetailItem>
          <DetailItem label="Priority"><PriorityBadge priority={task.priority} /></DetailItem>
          <DetailItem label="Department">{task.department}</DetailItem>
          <DetailItem label="Assigned Employee">
            <EmployeeCell employee={task.employee} />
            <div className="text-xs text-slate-500">{task.employee.employeeId} · {task.employee.role}</div>
          </DetailItem>
          <DetailItem label="Start Date">{formatDate(task.startDate)}</DetailItem>
          <DetailItem label="Due Date"><DueDate task={task} /></DetailItem>
          <DetailItem label="Created">{formatDate(task.createdAt)}</DetailItem>
          <DetailItem label="Completed">{formatDate(task.completedAt)}</DetailItem>
          <div className="sm:col-span-2 lg:col-span-3">
            <DetailItem label="Description"><p className="whitespace-pre-wrap">{task.description}</p></DetailItem>
          </div>
        </dl>
      </div>
      <ConfirmDialog open={confirm} title="Delete task?" message={`${task.taskId} will be permanently deleted.`} busy={busy} onConfirm={handleDelete} onCancel={() => setConfirm(false)} />
    </>
  );
}

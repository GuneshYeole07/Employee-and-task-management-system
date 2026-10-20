import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage, getFieldErrors } from '../../api/client.js';
import { listEmployeeOptions } from '../../api/employees.js';
import { createTask, getTask, updateTask } from '../../api/tasks.js';
import ErrorBanner from '../../components/ui/ErrorBanner.jsx';
import FormField from '../../components/ui/FormField.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { DEPARTMENTS, PRIORITIES } from '../../constants/options.js';
import useFetch from '../../hooks/useFetch.js';
import { taskDefaults, taskFormSchema } from '../../schemas/task.schema.js';

export default function TaskForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, reset, setError, setValue, getValues, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: taskDefaults,
  });

  const employees = useFetch(listEmployeeOptions, []);
  const task = useFetch(() => (isEdit ? getTask(id) : Promise.resolve(null)), [id]);

  useEffect(() => {
    if (!task.data) return;
    const t = task.data;
    reset({ title: t.title, employee: t.employee.id, priority: t.priority, department: t.department, startDate: t.startDate, dueDate: t.dueDate, description: t.description });
  }, [task.data, reset]);

  const locked = isEdit && task.data && task.data.allowedStatuses.length === 0;

  function handleEmployeeChange(e) {
    const picked = employees.data?.find((emp) => emp.id === e.target.value);
    if (picked && !getValues('department')) setValue('department', picked.department);
  }

  async function onSubmit(values) {
    setServerError('');
    try {
      const res = isEdit ? await updateTask(id, values) : await createTask(values);
      toast.success(res.message);
      navigate('/tasks');
    } catch (err) {
      const message = getErrorMessage(err);
      setServerError(message);
      toast.error(message);
      getFieldErrors(err).forEach(({ path, message: m }) => path && setError(path, { message: m }));
    }
  }

  if (employees.loading || (isEdit && task.loading)) return <Spinner />;
  if (task.error || employees.error) return <ErrorBanner message={task.error || employees.error} />;

  const fieldClass = (name) => `input ${errors[name] ? 'input-error' : ''}`;
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={isEdit ? `Edit ${task.data.taskId}` : 'Add Task'} />
      {locked && <div className="mb-4"><ErrorBanner message={`${task.data.status} tasks cannot be edited.`} /></div>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-4 p-6">
        <fieldset disabled={locked} className="grid gap-4 sm:grid-cols-2">
          <FormField label="Title" error={errors.title?.message}>
            <input className={fieldClass('title')} placeholder="Enter title" {...register('title')} />
          </FormField>
          <FormField label="Assigned Employee" error={errors.employee?.message}>
            <select className={fieldClass('employee')} {...register('employee', { onChange: handleEmployeeChange })}>
              <option value="">Select…</option>
              {employees.data.map((e) => (
                <option key={e.id} value={e.id} disabled={e.status === 'Inactive'}>
                  {e.fullName} ({e.employeeId}) – {e.status}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Priority" error={errors.priority?.message}>
            <select className={fieldClass('priority')} {...register('priority')}>
              <option value="">Select…</option>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </FormField>
          <FormField label="Department" error={errors.department?.message}>
            <select className={fieldClass('department')} {...register('department')}>
              <option value="">Select…</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Start Date" error={errors.startDate?.message}>
            <input type="date" className={fieldClass('startDate')} {...register('startDate')} />
          </FormField>
          <FormField label="Due Date" error={errors.dueDate?.message}>
            <input type="date" className={fieldClass('dueDate')} {...register('dueDate')} />
          </FormField>
          <FormField label="Description" error={errors.description?.message} className="sm:col-span-2">
            <textarea rows={4} className={fieldClass('description')} placeholder="Enter description" {...register('description')} />
          </FormField>
        </fieldset>
        <ErrorBanner message={serverError} />
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1" disabled={isSubmitting || locked}>
            {isSubmitting ? 'Saving…' : 'Submit'}
          </button>
          <Link to="/tasks" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

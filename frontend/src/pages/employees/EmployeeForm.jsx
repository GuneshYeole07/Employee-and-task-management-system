import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getErrorMessage, getFieldErrors } from '../../api/client.js';
import { createEmployee, getEmployee, updateEmployee } from '../../api/employees.js';
import ErrorBanner from '../../components/ui/ErrorBanner.jsx';
import FormField from '../../components/ui/FormField.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../constants/options.js';
import useFetch from '../../hooks/useFetch.js';
import { employeeDefaults, employeeFormSchema, toEmployeePayload } from '../../schemas/employee.schema.js';
import { todayInputValue } from '../../utils/format.js';

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, reset, setError, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: employeeDefaults,
  });
  const { data: existing, loading, error } = useFetch(() => (isEdit ? getEmployee(id) : Promise.resolve(null)), [id]);
  const onLeave = watch('status') === 'On Leave';

  useEffect(() => {
    if (!existing) return;
    reset({ ...employeeDefaults, ...existing, skills: existing.skills.join(', '), leaveStartDate: existing.leaveStartDate || '', leaveEndDate: existing.leaveEndDate || '' });
  }, [existing, reset]);

  async function onSubmit(values) {
    setServerError('');
    try {
      const payload = toEmployeePayload(values);
      const res = isEdit ? await updateEmployee(id, payload) : await createEmployee(payload);
      toast.success(res.message);
      navigate('/employees');
    } catch (err) {
      const message = getErrorMessage(err);
      setServerError(message);
      toast.error(message);
      getFieldErrors(err).forEach(({ path, message: m }) => path && setError(path, { message: m }));
    }
  }

  if (isEdit && loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  const cls = (name) => `input ${errors[name] ? 'input-error' : ''}`;

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={isEdit ? 'Edit Employee' : 'Add Employee'} />
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Employee ID" error={errors.employeeId?.message}>
            <input className={cls('employeeId')} placeholder="EMP-001" {...register('employeeId')} />
          </FormField>
          <FormField label="Full Name" error={errors.fullName?.message}>
            <input className={cls('fullName')} {...register('fullName')} />
          </FormField>
          <FormField label="Email" error={errors.email?.message}>
            <input type="email" className={cls('email')} {...register('email')} />
          </FormField>
          <FormField label="Phone" error={errors.phone?.message}>
            <input type="tel" className={cls('phone')} placeholder="+91 98765 43210" {...register('phone')} />
          </FormField>
          <FormField label="Department" error={errors.department?.message}>
            <select className={cls('department')} {...register('department')}>
              <option value="">Select…</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Role" error={errors.role?.message}>
            <input className={cls('role')} {...register('role')} />
          </FormField>
          <FormField label="Joining Date" error={errors.joiningDate?.message}>
            <input type="date" max={todayInputValue()} className={cls('joiningDate')} {...register('joiningDate')} />
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <select className={cls('status')} {...register('status')}>
              {EMPLOYEE_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormField>
          {onLeave && (
            <>
              <FormField label="Leave Start Date" error={errors.leaveStartDate?.message}>
                <input type="date" className={cls('leaveStartDate')} {...register('leaveStartDate')} />
              </FormField>
              <FormField label="Leave End Date" error={errors.leaveEndDate?.message}>
                <input type="date" className={cls('leaveEndDate')} {...register('leaveEndDate')} />
              </FormField>
            </>
          )}
          <FormField label="Skills (comma separated)" error={errors.skills?.message} className="sm:col-span-2">
            <input className={cls('skills')} placeholder="React, Node.js, MongoDB" {...register('skills')} />
          </FormField>
        </div>
        <ErrorBanner message={serverError} />
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Submit'}</button>
          <Link to="/employees" className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

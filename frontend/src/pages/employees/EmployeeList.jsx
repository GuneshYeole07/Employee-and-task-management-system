import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../api/client.js';
import { deleteEmployee, listEmployees } from '../../api/employees.js';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorBanner from '../../components/ui/ErrorBanner.jsx';
import { FilterSelect, SearchBox } from '../../components/ui/ListFilters.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import RowActions from '../../components/ui/RowActions.jsx';
import Spinner from '../../components/ui/Spinner.jsx';
import { DEPARTMENTS, EMPLOYEE_SORTS, EMPLOYEE_STATUSES, PAGE_SIZE } from '../../constants/options.js';
import useFetch from '../../hooks/useFetch.js';
import useListParams from '../../hooks/useListParams.js';
import { currentSortValue, parseSort } from '../../utils/format.js';

export default function EmployeeList() {
  const { params, update, key } = useListParams();
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { data, loading, error, reload } = useFetch(() => listEmployees({ ...params, limit: PAGE_SIZE }), [key]);
  const employees = data?.data ?? [];
  const meta = data?.meta;

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteEmployee(toDelete.id);
      toast.success('Employee deleted');
      setToDelete(null);
      if (employees.length === 1 && meta.page > 1) update({ page: meta.page - 1 }, { resetPage: false });
      else reload();
    } catch (err) {
      toast.error(getErrorMessage(err)); // e.g. "still has Todo / In Progress tasks"
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader title="Employees">
        <Link to="/employees/new" className="btn-primary"><Plus className="h-4 w-4" /> Add Employee</Link>
      </PageHeader>
      <div className="card mb-4 space-y-3 p-4">
        <SearchBox value={params.q} placeholder="Search name, email or ID" onSearch={(q) => update({ q })} />
        <div className="flex flex-wrap gap-2">
          <FilterSelect label="Department" value={params.department} options={DEPARTMENTS} onChange={(v) => update({ department: v })} />
          <FilterSelect label="Status" value={params.status} options={EMPLOYEE_STATUSES} onChange={(v) => update({ status: v })} />
          <FilterSelect
            label="Sort"
            allLabel="Newest first"
            value={currentSortValue(params) === 'createdAt:desc' ? '' : currentSortValue(params)}
            options={EMPLOYEE_SORTS.slice(1)}
            onChange={(v) => update(v ? parseSort(v) : { sortBy: '', order: '' })}
          />
        </div>
      </div>
      <ErrorBanner message={error} onRetry={reload} />
      <div className="card overflow-x-auto">
        {loading && !data ? (
          <Spinner />
        ) : (
          <table className={`w-full ${loading ? 'opacity-60' : ''}`}>
            <thead>
              <tr>{['ID', 'Name', 'Department', 'Role', 'Status', 'Active Tasks', 'Action'].map((h) => <th key={h} className="th">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((e) => (
                <tr key={e.id}>
                  <td className="td font-semibold">{e.employeeId}</td>
                  <td className="td">
                    <Link to={`/employees/${e.id}`} className="font-medium hover:underline">{e.fullName}</Link>
                    <div className="text-xs text-slate-500">{e.email}</div>
                  </td>
                  <td className="td">{e.department}</td>
                  <td className="td">{e.role}</td>
                  <td className="td"><StatusBadge status={e.status} /></td>
                  <td className="td">{e.activeTaskCount} / 3</td>
                  <td className="td"><RowActions label={e.fullName} viewTo={`/employees/${e.id}`} editTo={`/employees/${e.id}/edit`} onDelete={() => setToDelete(e)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !error && employees.length === 0 && <EmptyState message="No employees match the current filters." />}
        <Pagination meta={meta} itemLabel="employees" onPageChange={(page) => update({ page }, { resetPage: false })} />
      </div>
      <ConfirmDialog
        open={!!toDelete}
        title="Delete employee?"
        message={toDelete ? `${toDelete.fullName} will be deleted. Their past tasks keep a record of their details.` : ''}
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

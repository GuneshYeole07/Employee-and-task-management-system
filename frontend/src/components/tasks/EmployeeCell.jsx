import { Link } from 'react-router-dom';

/** Uses the stored snapshot, so deleted employees still show a real name. */
export default function EmployeeCell({ employee }) {
  if (employee.isDeleted) {
    return (
      <span>
        {employee.fullName} <span className="text-xs italic text-slate-400">(deleted)</span>
      </span>
    );
  }
  return (
    <Link to={`/employees/${employee.id}`} className="text-slate-800 hover:underline">
      {employee.fullName}
    </Link>
  );
}

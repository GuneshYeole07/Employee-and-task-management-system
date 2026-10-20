import { STATUS_STYLES } from '../../constants/options.js';

/** Shows the current status plus ONLY the valid next statuses supplied by the server. */
export default function StatusSelect({ current, allowed, onChange, disabled }) {
  const locked = allowed.length === 0;
  return (
    <select
      aria-label="Task status"
      value={current}
      disabled={disabled || locked}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded px-2 py-1 text-xs font-semibold disabled:opacity-100 ${STATUS_STYLES[current]}`}
    >
      <option value={current}>{current}</option>
      {allowed.map((s) => (
        <option key={s} value={s} className="bg-white text-slate-800">
          {s}
        </option>
      ))}
    </select>
  );
}

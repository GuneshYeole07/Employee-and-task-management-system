import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

/** Search box: typed text is pushed to the URL on submit; everything else is a plain control. */
export function SearchBox({ value, placeholder, onSearch }) {
  const [text, setText] = useState(value || '');
  useEffect(() => setText(value || ''), [value]);
  return (
    <form
      className="flex flex-1 gap-2 sm:max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(text.trim());
      }}
    >
      <input className="input" value={text} placeholder={placeholder} onChange={(e) => setText(e.target.value)} aria-label="Search" />
      <button type="submit" className="btn-secondary">
        <Search className="h-4 w-4" /> Search
      </button>
    </form>
  );
}

export function FilterSelect({ label, value, options, onChange, allLabel }) {
  return (
    <select className="input w-auto min-w-36" aria-label={label} value={value || ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">{allLabel || label}</option>
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>
          {o.label ?? o}
        </option>
      ))}
    </select>
  );
}

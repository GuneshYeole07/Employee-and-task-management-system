import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Keeps search / filters / sort / page in the URL query string (source of truth). */
export default function useListParams() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams]);

  const update = useCallback(
    (changes, { resetPage = true } = {}) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([k, v]) => (v === '' || v == null ? next.delete(k) : next.set(k, v)));
        if (resetPage && !('page' in changes)) next.delete('page');
        return next;
      });
    },
    [setSearchParams]
  );

  return { params, update, key: searchParams.toString() };
}

import { MoreVertical } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

const MENU_WIDTH = 128;
const itemClass = 'block w-full px-4 py-2 text-left text-sm font-medium hover:bg-slate-50';

export default function RowActions({ viewTo, editTo, onDelete, label }) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useLayoutEffect(() => {
    if (!open || !menuRef.current || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const menu = menuRef.current;
    const height = menu.offsetHeight;
    const openUp = rect.bottom + height + 8 > window.innerHeight;
    menu.style.top = `${openUp ? rect.top - height - 4 : rect.bottom + 4}px`;
    menu.style.left = `${Math.max(8, rect.right - MENU_WIDTH)}px`;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setOpen(false);
    const onMouseDown = (e) => {
      if (!menuRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) close();
    };
    const onKeyDown = (e) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Actions for ${label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="rounded p-1.5 text-slate-600 hover:bg-slate-100"
      >
        <MoreVertical className="h-5 w-5" />
      </button>
      {open &&
        createPortal(
          <div ref={menuRef} role="menu" className="fixed left-0 top-0 z-50 w-32 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg">
            <Link role="menuitem" to={viewTo} className={`${itemClass} text-green-700`} onClick={() => setOpen(false)}>
              View
            </Link>
            {editTo && (
              <Link role="menuitem" to={editTo} className={`${itemClass} text-blue-600`} onClick={() => setOpen(false)}>
                Edit
              </Link>
            )}
            <button
              type="button"
              role="menuitem"
              className={`${itemClass} text-red-600`}
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
            >
              Delete
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

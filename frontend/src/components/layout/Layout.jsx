import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/employees', label: 'Employees' },
  { to: '/tasks', label: 'Tasks' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-4">
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-white underline underline-offset-8' : 'text-slate-300 hover:text-white'}`}
              >
                {label}
              </NavLink>
            ))}
          </div>
          <span className="text-sm font-semibold text-slate-200">Employee &amp; Task Management</span>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

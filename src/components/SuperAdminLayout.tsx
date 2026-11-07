import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getStoredAdmin, logout } from '../lib/auth';
import MobileSectionNav from './MobileSectionNav';

const navItems = [
  { to: '/super-admin', label: 'Overview', end: true },
  { to: '/super-admin/orgs', label: 'Organizations', end: false },
];

export default function SuperAdminLayout() {
  const navigate = useNavigate();
  const admin = getStoredAdmin();

  function handleLogout() {
    logout();
    navigate('/super-admin/login');
  }

  return (
    <div className="tf-shell flex h-dvh flex-col overflow-hidden md:flex-row">
      <aside className="tf-sidebar flex shrink-0 flex-col border-b md:h-full md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:block md:px-5 md:py-6 md:border-b md:border-line">
          <div className="min-w-0">
            <p className="tf-kicker">Platform</p>
            <div className="tf-title text-xl mt-0.5">TransportFlow</div>
            {admin && <p className="text-xs text-mute mt-1 truncate">{admin.email}</p>}
          </div>
          <div className="md:hidden">
            <button type="button" onClick={handleLogout} className="tf-btn tf-btn-ghost">
              Log out
            </button>
          </div>
        </div>
        <MobileSectionNav prefix="Platform" items={navItems} />
        <nav className="hidden md:flex md:flex-1 md:flex-col md:space-y-1 md:py-4">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `tf-nav ${isActive ? 'tf-nav-active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mx-3 mb-4 hidden md:block">
          <button type="button" onClick={handleLogout} className="tf-btn tf-btn-ghost w-full justify-start">
            Log out
          </button>
        </div>
      </aside>
      <main className="tf-main flex-1 min-w-0 overflow-auto p-4 md:p-8 tf-enter">
        <Outlet />
      </main>
    </div>
  );
}

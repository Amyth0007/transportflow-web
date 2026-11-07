import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import api, { type WorkspaceView } from '../lib/api';
import { getStoredAdmin, logout } from '../lib/auth';
import MobileTabBar, { type TabItem } from './MobileTabBar';

const navItems = [
  { to: '/dashboard', label: 'Home', end: true },
  { to: '/trips', label: 'Trips', end: false },
  { to: '/routes', label: 'Routes', end: false },
  { to: '/vehicles', label: 'Vehicles', end: false },
  { to: '/drivers', label: 'Drivers', end: false },
  { to: '/settings', label: 'Settings', end: false },
];

const mobileTabs: TabItem[] = [
  { to: '/dashboard', label: 'Home', end: true, icon: 'home' },
  { to: '/trips', label: 'Trips', icon: 'trips' },
  { to: '/routes', label: 'Routes', icon: 'routes' },
  { to: '/vehicles', label: 'Vehicles', icon: 'vehicles' },
  { to: '/drivers', label: 'Drivers', icon: 'drivers' },
];

export default function Layout() {
  const navigate = useNavigate();
  const admin = getStoredAdmin();
  const [orgName, setOrgName] = useState('TransportFlow');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ data: WorkspaceView }>('/workspace');
        setOrgName(res.data.data.org.name);
      } catch {
        // keep default
      }
    }
    void load();
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="tf-shell flex h-dvh flex-col overflow-hidden md:flex-row">
      <aside className="tf-sidebar flex shrink-0 flex-col border-b md:h-full md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3 md:block md:px-5 md:py-6 md:border-b md:border-line">
          <div className="min-w-0">
            <p className="tf-kicker">Organization</p>
            <div className="tf-title text-lg mt-0.5 truncate max-w-[10rem] md:max-w-[12rem]">{orgName}</div>
            {admin && <p className="text-xs text-mute mt-1 truncate">{admin.name}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <Link to="/settings" className="tf-btn tf-btn-ghost text-sm">
              Settings
            </Link>
            <button type="button" onClick={handleLogout} className="tf-btn tf-btn-ghost">
              Log out
            </button>
          </div>
        </div>
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
      <MobileTabBar items={mobileTabs} />
    </div>
  );
}

import { Outlet, useNavigate } from 'react-router-dom';
import { getStoredDriver, logout } from '../lib/auth';

export default function DriverLayout() {
  const navigate = useNavigate();
  const driver = getStoredDriver();

  function handleLogout() {
    logout();
    navigate('/driver/login');
  }

  return (
    <div className="tf-shell min-h-dvh flex flex-col">
      <header className="tf-sidebar sticky top-0 z-20 border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="tf-kicker">Driver</p>
            <p className="tf-title text-lg leading-tight">{driver?.name ?? 'TransportFlow'}</p>
          </div>
          <button type="button" onClick={handleLogout} className="tf-btn tf-btn-ghost text-sm">
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 tf-enter">
        <Outlet />
      </main>
    </div>
  );
}

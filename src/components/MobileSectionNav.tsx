import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export type NavItem = { to: string; label: string; end?: boolean };

function isCurrent(item: NavItem, pathname: string): boolean {
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

function ItemIcon({ label }: { label: string }) {
  const common = {
    viewBox: '0 0 24 24',
    width: 22,
    height: 22,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (label) {
    case 'Home':
    case 'Overview':
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
        </svg>
      );
    case 'Trips':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'Routes':
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="2.2" />
          <circle cx="18" cy="18" r="2.2" />
          <path d="M8 7.2C12 7 12 17 16 16.8" />
        </svg>
      );
    case 'Vehicles':
      return (
        <svg {...common}>
          <path d="M3 15V10h11l4 4v5H3z" />
          <path d="M14 10v4h4" />
          <circle cx="7.5" cy="18.5" r="1.6" />
          <circle cx="16.5" cy="18.5" r="1.6" />
        </svg>
      );
    case 'Drivers':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 19c1.2-3.2 3.4-4.8 7-4.8s5.8 1.6 7 4.8" />
        </svg>
      );
    case 'Organizations':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="7" height="7" rx="1" />
          <rect x="14" y="4" width="7" height="7" rx="1" />
          <rect x="3" y="13" width="7" height="7" rx="1" />
          <rect x="14" y="13" width="7" height="7" rx="1" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 5v2M12 17v2M5 12h2M17 12h2" />
        </svg>
      );
  }
}

export default function MobileSectionNav({
  prefix,
  items,
}: {
  prefix: string;
  items: NavItem[];
}) {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const current = items.find((item) => isCurrent(item, pathname)) ?? items[0];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="tf-mnav flex md:hidden">
      <button type="button" className="tf-mnav-burger" aria-label="Open menu" onClick={() => setOpen(true)}>
        <MenuIcon />
      </button>
      <p className="tf-mnav-trail">
        <span className="tf-mnav-prefix">{prefix}</span>
        <span className="tf-mnav-sep" aria-hidden>
          ›
        </span>
        <span className="tf-mnav-here">{current?.label}</span>
      </p>

      {open && (
        <>
          <button type="button" className="tf-mnav-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="tf-mnav-sheet" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="tf-mnav-sheet-head">
              <div>
                <p className="tf-kicker">Menu</p>
                <p className="tf-title text-lg mt-1 truncate">{prefix}</p>
              </div>
              <button type="button" className="tf-mnav-close" aria-label="Close menu" onClick={() => setOpen(false)}>
                <CloseIcon />
              </button>
            </div>
            <nav className="tf-mnav-list">
              {items.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `tf-mnav-item ${isActive ? 'tf-mnav-item-active' : ''}`}
                >
                  <span className="tf-mnav-ico">
                    <ItemIcon label={label} />
                  </span>
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}

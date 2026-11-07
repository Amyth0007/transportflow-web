import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export type NavItem = { to: string; label: string; end?: boolean };

function isCurrent(item: NavItem, pathname: string): boolean {
  if (item.end) return pathname === item.to;
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
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

  return (
    <div className="tf-crumb md:hidden">
      <button
        type="button"
        className="tf-crumb-btn"
        aria-expanded={open}
        aria-controls="tf-mobile-section-menu"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate">
          <span className="tf-crumb-prefix">{prefix}</span>
          <span className="tf-crumb-sep"> / </span>
          <span>{current?.label}</span>
        </span>
        <span className="tf-crumb-caret" aria-hidden>
          {open ? '▴' : '▾'}
        </span>
      </button>
      {open && (
        <nav id="tf-mobile-section-menu" className="tf-crumb-menu" aria-label="Section">
          {items.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `tf-crumb-link ${isActive ? 'tf-crumb-link-active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}

import { NavLink } from 'react-router-dom';

export type TabItem = {
  to: string;
  label: string;
  end?: boolean;
  icon: 'home' | 'trips' | 'routes' | 'vehicles' | 'drivers' | 'overview' | 'orgs';
};

function TabGlyph({ icon }: { icon: TabItem['icon'] }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'tf-tab-icon',
    'aria-hidden': true,
  };

  switch (icon) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
        </svg>
      );
    case 'trips':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case 'routes':
      return (
        <svg {...common}>
          <circle cx="6" cy="6" r="2.2" />
          <circle cx="18" cy="18" r="2.2" />
          <path d="M8 7.2C12 7 12 17 16 16.8" />
        </svg>
      );
    case 'vehicles':
      return (
        <svg {...common}>
          <path d="M3 15V10h11l4 4v5H3z" />
          <path d="M14 10v4h4" />
          <circle cx="7.5" cy="18.5" r="1.6" />
          <circle cx="16.5" cy="18.5" r="1.6" />
        </svg>
      );
    case 'drivers':
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 19c1.2-3.2 3.4-4.8 7-4.8s5.8 1.6 7 4.8" />
        </svg>
      );
    case 'overview':
      return (
        <svg {...common}>
          <path d="M4 19V9l8-5 8 5v10" />
          <path d="M9 19v-6h6v6" />
        </svg>
      );
    case 'orgs':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="7" height="7" rx="1" />
          <rect x="14" y="4" width="7" height="7" rx="1" />
          <rect x="3" y="13" width="7" height="7" rx="1" />
          <rect x="14" y="13" width="7" height="7" rx="1" />
        </svg>
      );
  }
}

export default function MobileTabBar({ items }: { items: TabItem[] }) {
  return (
    <nav className="tf-tabbar flex md:hidden" aria-label="Main">
      {items.map(({ to, label, end, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `tf-tab ${isActive ? 'tf-tab-active' : ''}`}
        >
          <TabGlyph icon={icon} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { type PlatformOverview } from '../lib/api';
import StatCard from '../components/StatCard';

export default function SuperAdminOverviewPage() {
  const [data, setData] = useState<PlatformOverview | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ data: PlatformOverview }>('/admin/orgs/overview');
        setData(res.data.data);
      } catch {
        setError('Could not load platform overview');
      }
    }
    void load();
  }, []);

  if (error) return <p className="text-sm text-coral">{error}</p>;
  if (!data) return <p className="text-sm text-mute">Loading platform…</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="tf-kicker">Platform</p>
        <h1 className="tf-title text-3xl mt-1">Super Admin</h1>
        <p className="text-sm text-mute mt-1">
          Tenants are isolated. You provision orgs; you cannot open an org dashboard with this account.
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Organizations" value={data.orgsTotal} />
        <StatCard label="Active" value={data.orgsActive} />
        <StatCard label="Disabled" value={data.orgsDisabled} />
        <StatCard label="Live trips" value={data.tripsLive} live />
        <StatCard label="Scheduled" value={data.tripsScheduled} />
      </div>
      <Link to="/super-admin/orgs" className="tf-btn tf-btn-primary inline-flex">
        Manage organizations
      </Link>
    </div>
  );
}

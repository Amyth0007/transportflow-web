import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { type WorkspaceView } from '../lib/api';
import StatCard from '../components/StatCard';

export default function DashboardPage() {
  const [data, setData] = useState<WorkspaceView | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  async function load() {
    try {
      const res = await api.get<{ data: WorkspaceView }>('/workspace');
      setData(res.data.data);
      setError('');
    } catch {
      setError('Could not load workspace');
    }
  }

  useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), 15000);
    return () => window.clearInterval(t);
  }, []);

  function copyTrack(token: string) {
    void navigator.clipboard.writeText(`${window.location.origin}/track/${token}`);
    setCopied(token);
    window.setTimeout(() => setCopied(null), 1600);
  }

  if (error) return <p className="text-sm text-coral">{error}</p>;
  if (!data) return <p className="text-sm text-mute">Loading workspace…</p>;

  const c = data.counts;

  return (
    <div className="space-y-6">
      <div>
        <p className="tf-kicker">{data.org.orgType}</p>
        <h1 className="tf-title text-3xl mt-1">{data.org.name}</h1>
        <p className="text-sm text-mute mt-1">Live operations across this organization only.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard label="Live trips" value={c.tripsLive} live hint="Broadcasting GPS now" />
        <StatCard label="Scheduled" value={c.tripsScheduled} />
        <StatCard label="Completed" value={c.tripsCompleted} />
        <StatCard label="Vehicles" value={c.vehicles} hint="Active" />
        <StatCard label="Drivers" value={c.drivers} hint="Active" />
        <StatCard label="Routes" value={c.routes} />
      </div>

      <section className="tf-card p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="tf-title text-lg">Live now</h2>
          <Link to="/trips" className="tf-link text-sm">All trips</Link>
        </div>
        {data.liveTrips.length === 0 ? (
          <p className="text-sm text-mute">No trip is in progress. Start one from Trips or the driver portal.</p>
        ) : (
          <ul className="space-y-2">
            {data.liveTrips.map((t) => (
              <li key={t._id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-ink px-3 py-2 border border-line">
                <div>
                  <p className="text-sand font-medium">{t.routeName}</p>
                  <p className="text-xs text-mute">{t.vehicleNumber} · {t.driverName}</p>
                </div>
                <div className="flex gap-3 items-center">
                  <span className="tf-badge tf-badge-live">Live</span>
                  <Link to={`/trips/${t._id}`} className="tf-link text-sm">Open</Link>
                  <button type="button" className="text-sm tf-link" onClick={() => copyTrack(t.publicTrackingToken)}>
                    {copied === t.publicTrackingToken ? 'Copied' : 'Copy link'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

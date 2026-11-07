import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { type OrganizationDetail } from '../lib/api';
import StatCard from '../components/StatCard';

const ORG_TYPES = ['generic', 'gas', 'school', 'corporate'] as const;

export default function SuperAdminOrgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [org, setOrg] = useState<OrganizationDetail | null>(null);
  const [name, setName] = useState('');
  const [orgType, setOrgType] = useState<OrganizationDetail['orgType']>('generic');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!id) return;
    try {
      const res = await api.get<{ data: OrganizationDetail }>(`/admin/orgs/${id}`);
      setOrg(res.data.data);
      setName(res.data.data.name);
      setOrgType(res.data.data.orgType);
      setError('');
    } catch {
      setOrg(null);
      setError('Organization not found');
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError('');
    setOk('');
    try {
      await api.patch(`/admin/orgs/${id}`, { name, orgType });
      setOk('Saved');
      await load();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function setActive(isActive: boolean) {
    if (!id || !org) return;
    const verb = isActive ? 'Enable' : 'Disable';
    if (!confirm(`${verb} "${org.name}"?`)) return;
    try {
      await api.patch(`/admin/orgs/${id}/${isActive ? 'enable' : 'disable'}`);
      await load();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error ?? 'Update failed');
    }
  }

  if (error && !org) return <p className="text-sm text-coral">{error}</p>;
  if (!org) return <p className="text-sm text-mute">Loading…</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link to="/super-admin/orgs" className="tf-link text-sm">← Organizations</Link>
        <h1 className="tf-title text-3xl mt-2">{org.name}</h1>
        <span className={`tf-badge mt-2 ${org.isActive ? 'tf-badge-ok' : 'tf-badge-muted'}`}>
          {org.isActive ? 'active' : 'disabled'}
        </span>
      </div>
      {error && <p className="text-sm text-coral">{error}</p>}
      {ok && <p className="text-sm text-mint">{ok}</p>}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard label="Live trips" value={org.stats.tripsLive} live />
        <StatCard label="Scheduled" value={org.stats.tripsScheduled} />
        <StatCard label="Completed" value={org.stats.tripsCompleted} />
        <StatCard label="Vehicles" value={org.stats.vehicles} />
        <StatCard label="Drivers" value={org.stats.drivers} />
        <StatCard label="Routes" value={org.stats.routes} />
      </div>

      <form onSubmit={handleSave} className="tf-card p-5 space-y-3">
        <h2 className="tf-title text-lg">Tenant settings</h2>
        <label className="block space-y-1">
          <span className="text-xs text-mute">Name</span>
          <input className="tf-field" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-mute">Type (vertical routing later)</span>
          <select
            className="tf-field"
            value={orgType}
            onChange={(e) => setOrgType(e.target.value as OrganizationDetail['orgType'])}
          >
            {ORG_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="tf-btn tf-btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          {org.isActive ? (
            <button type="button" className="tf-btn tf-btn-danger" onClick={() => void setActive(false)}>
              Disable org
            </button>
          ) : (
            <button type="button" className="tf-btn tf-btn-primary" onClick={() => void setActive(true)}>
              Enable org
            </button>
          )}
        </div>
      </form>

      <div className="tf-card tf-table-wrap">
        <div className="px-4 py-3 border-b border-line">
          <h2 className="tf-title text-lg">Org admins</h2>
        </div>
        <table>
          <thead>
            <tr>
              {['Name', 'Email', 'Role', 'Created'].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {org.admins.map((a) => (
              <tr key={a._id}>
                <td className="text-sand">{a.name}</td>
                <td>{a.email}</td>
                <td className="text-mute">{a.role}</td>
                <td className="text-mute">{new Date(a.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {org.admins.length === 0 && (
              <tr><td colSpan={4} className="text-center text-mute">No admins</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

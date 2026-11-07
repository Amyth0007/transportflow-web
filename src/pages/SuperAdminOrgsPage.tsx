import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { type Organization, type OrganizationListItem } from '../lib/api';

const ORG_TYPES = ['generic', 'gas', 'school', 'corporate'] as const;

const EMPTY_FORM = {
  name: '',
  orgType: 'generic' as Organization['orgType'],
  adminName: '',
  adminEmail: '',
  adminPassword: '',
};

export default function SuperAdminOrgsPage() {
  const [orgs, setOrgs] = useState<OrganizationListItem[]>([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  async function load() {
    setListLoading(true);
    try {
      const res = await api.get<{ data: OrganizationListItem[] }>('/admin/orgs');
      setOrgs(res.data.data);
      setError('');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error ?? 'Could not load organizations');
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orgs;
    return orgs.filter(
      (o) => o.name.toLowerCase().includes(q) || o.orgType.toLowerCase().includes(q)
    );
  }, [orgs, query]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api.post<{ data: { org: Organization; admin: { email: string } } }>(
        '/admin/orgs',
        form
      );
      setSuccess(`Created "${res.data.data.org.name}" — admin ${res.data.data.admin.email}`);
      setForm(EMPTY_FORM);
      setShowForm(false);
      await load();
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error ?? 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="tf-kicker">Tenants</p>
          <h1 className="tf-title text-2xl mt-1">Organizations</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setError('');
            setSuccess('');
          }}
          className="tf-btn tf-btn-primary"
        >
          {showForm ? 'Cancel' : 'Create org'}
        </button>
      </div>

      {error && <p className="text-sm text-coral tf-card px-4 py-2">{error}</p>}
      {success && <p className="text-sm text-mint tf-card px-4 py-2">{success}</p>}

      {showForm && (
        <form onSubmit={handleCreate} className="tf-card p-6 space-y-4">
          <h2 className="font-semibold text-sand">New organization + first admin</h2>
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Organization name *"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="tf-field col-span-2"
            />
            <select
              value={form.orgType}
              onChange={(e) => setForm((f) => ({ ...f, orgType: e.target.value as Organization['orgType'] }))}
              className="tf-field col-span-2"
            >
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              placeholder="Admin name *"
              required
              value={form.adminName}
              onChange={(e) => setForm((f) => ({ ...f, adminName: e.target.value }))}
              className="tf-field"
            />
            <input
              placeholder="Admin email *"
              required
              type="email"
              value={form.adminEmail}
              onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))}
              className="tf-field"
            />
            <input
              placeholder="Admin password *"
              required
              type="password"
              minLength={8}
              value={form.adminPassword}
              onChange={(e) => setForm((f) => ({ ...f, adminPassword: e.target.value }))}
              className="tf-field col-span-2"
            />
          </div>
          <button type="submit" disabled={loading} className="tf-btn tf-btn-primary">
            {loading ? 'Creating…' : 'Create organization'}
          </button>
        </form>
      )}

      <input
        className="tf-field max-w-sm"
        placeholder="Search orgs…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="tf-card tf-table-wrap">
        <table>
          <thead>
            <tr>
              {['Name', 'Type', 'Status', 'Live', 'Vehicles', 'Drivers', ''].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listLoading && (
              <tr><td colSpan={7} className="text-center text-mute">Loading…</td></tr>
            )}
            {!listLoading && filtered.map((org) => (
              <tr key={org._id}>
                <td className="font-medium text-sand">{org.name}</td>
                <td className="text-mute">{org.orgType}</td>
                <td>
                  <span className={`tf-badge ${org.isActive ? 'tf-badge-ok' : 'tf-badge-muted'}`}>
                    {org.isActive ? 'active' : 'disabled'}
                  </span>
                </td>
                <td>{org.stats.tripsLive}</td>
                <td>{org.stats.vehicles}</td>
                <td>{org.stats.drivers}</td>
                <td>
                  <Link to={`/super-admin/orgs/${org._id}`} className="tf-link">Open</Link>
                </td>
              </tr>
            ))}
            {!listLoading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center text-mute">No organizations match</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

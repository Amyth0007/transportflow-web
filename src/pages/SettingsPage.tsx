import { useEffect, useState, type FormEvent } from 'react';
import api, { type WorkspaceView } from '../lib/api';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [orgType, setOrgType] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<{ data: WorkspaceView }>('/workspace');
        setName(res.data.data.org.name);
        setOrgType(res.data.data.org.orgType);
      } catch {
        setError('Could not load settings');
      }
    }
    void load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setOk('');
    setLoading(true);
    try {
      await api.patch('/workspace', { name });
      setOk('Organization name saved');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error ?? 'Could not save');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <p className="tf-kicker">Organization</p>
        <h1 className="tf-title text-2xl mt-1">Settings</h1>
        <p className="text-sm text-mute mt-1">
          Display name for this tenant. Type is reserved for a future vertical and does not change product behavior yet.
        </p>
      </div>
      {error && <p className="text-sm text-coral">{error}</p>}
      {ok && <p className="text-sm text-mint">{ok}</p>}
      <form onSubmit={handleSubmit} className="tf-card p-5 space-y-3">
        <label className="block space-y-1">
          <span className="text-xs text-mute">Organization name</span>
          <input className="tf-field" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-mute">Business type</span>
          <input className="tf-field" value={orgType} disabled />
        </label>
        <button type="submit" className="tf-btn tf-btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}

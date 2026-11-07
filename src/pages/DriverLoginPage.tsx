import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginDriver } from '../lib/auth';

export default function DriverLoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginDriver(phone.trim(), password);
      navigate('/driver');
    } catch {
      setError('Invalid phone number or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tf-login min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-md tf-enter">
        <form onSubmit={handleSubmit} className="tf-card p-8 space-y-4">
          <p className="tf-kicker">Driver</p>
          <h1 className="tf-title text-3xl">Start your run</h1>
          <p className="text-sm text-mute">
            Sign in with the phone and password your manager set. Keep this tab open while you drive so GPS stays live.
          </p>
          {error && <p className="text-sm text-coral">{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-1 text-fog">Phone</label>
            <input
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="tf-field text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-fog">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="tf-field text-base"
            />
          </div>
          <button type="submit" disabled={loading} className="tf-btn tf-btn-primary w-full py-3 text-base">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-sm text-mute mt-4">
          Manager?{' '}
          <Link to="/login" className="tf-link">
            Org admin login
          </Link>
        </p>
      </div>
    </div>
  );
}

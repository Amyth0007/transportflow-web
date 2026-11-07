import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../lib/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@transportflow.local');
  const [password, setPassword] = useState('changeme');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'super_admin' ? '/super-admin' : '/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tf-login min-h-dvh grid md:grid-cols-2">
      <div className="tf-sidebar hidden md:flex flex-col justify-between p-10">
        <div>
          <p className="tf-kicker">Live operations</p>
          <h1 className="tf-title text-4xl mt-3 max-w-sm">Vehicles on routes. Location you can trust.</h1>
        </div>
        <p className="text-sm text-mute max-w-xs">
          Assign drivers, draw stops on Indian roads, share a public tracking link. Drivers run the same web app from their phone.
        </p>
      </div>
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-sm tf-enter">
          <form onSubmit={handleSubmit} className="tf-card p-8 space-y-4">
            <p className="tf-kicker">Org admin</p>
            <h2 className="tf-title text-2xl">TransportFlow</h2>
            <p className="text-sm text-mute">
              Org admin for one business. Seed login is filled in: <span className="text-sand">changeme</span>.
              Super admin is a different page.
            </p>
            {error && <p className="text-sm text-coral">{error}</p>}
            <div>
              <label className="block text-sm font-medium mb-1 text-fog">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="tf-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-fog">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="tf-field"
              />
            </div>
            <button type="submit" disabled={loading} className="tf-btn tf-btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-sm text-mute mt-4">
            Driving today?{' '}
            <Link to="/driver/login" className="tf-link">
              Driver login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

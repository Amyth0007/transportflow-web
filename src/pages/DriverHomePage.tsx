import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { type DriverTripView } from '../lib/api';

const STATUS_CLASS: Record<DriverTripView['status'], string> = {
  in_progress: 'tf-badge-live',
  scheduled: 'tf-badge-warn',
  completed: 'tf-badge-muted',
};

const STATUS_LABEL: Record<DriverTripView['status'], string> = {
  in_progress: 'Live',
  scheduled: 'Scheduled',
  completed: 'Completed',
};

export default function DriverHomePage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<DriverTripView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function load() {
    setError('');
    try {
      const res = await api.get<{ data: DriverTripView[] }>('/trips/my');
      const list = res.data.data;
      setTrips(list);
      const live = list.find((t) => t.status === 'in_progress');
      const already = sessionStorage.getItem('tf_driver_autolive');
      if (live && already !== live._id) {
        sessionStorage.setItem('tf_driver_autolive', live._id);
        navigate(`/driver/trips/${live._id}`);
      }
    } catch {
      setError('Could not load trips. Pull to refresh or try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return <p className="text-mute text-sm py-12 text-center">Loading your trips…</p>;
  }

  return (
    <div className="space-y-4 pb-8">
      <div>
        <p className="tf-kicker">Assigned</p>
        <h1 className="tf-title text-2xl mt-1">Your trips</h1>
      </div>
      {error && (
        <p className="text-sm text-coral">
          {error}{' '}
          <button type="button" className="tf-link" onClick={() => void load()}>
            Retry
          </button>
        </p>
      )}
      {trips.length === 0 && (
        <div className="tf-card p-6 text-center space-y-2">
          <p className="text-sand font-semibold">No trip assigned</p>
          <p className="text-sm text-mute">Ask your manager to create a trip, then refresh.</p>
          <button type="button" className="tf-btn tf-btn-ghost" onClick={() => void load()}>
            Refresh
          </button>
        </div>
      )}
      <ul className="space-y-3">
        {trips.map((trip) => (
          <li key={trip._id}>
            <button
              type="button"
              onClick={() => navigate(`/driver/trips/${trip._id}`)}
              className="tf-card w-full text-left p-4 hover:border-cyan/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sand font-semibold">{trip.route.name}</p>
                <span className={`tf-badge shrink-0 ${STATUS_CLASS[trip.status]}`}>
                  {STATUS_LABEL[trip.status]}
                </span>
              </div>
              <p className="text-sm text-fog mt-1">{trip.vehicle.vehicleNumber}</p>
              <p className="text-sm text-mute mt-0.5">{new Date(trip.scheduledAt).toLocaleString()}</p>
              <p className="text-xs text-mute mt-2">
                {trip.route.stops.length} stop{trip.route.stops.length === 1 ? '' : 's'}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { type DriverTripView } from '../lib/api';
import { getSocket } from '../lib/socket';
import { HAS_MAPS_API_KEY } from '../lib/routeMapTypes';
import { requestScreenWakeLock, startForegroundGps } from '../lib/driverGps';

const RouteMap = lazy(() => import('../components/RouteMap'));

export default function DriverTripPage() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<DriverTripView | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const stopGpsRef = useRef<(() => void) | null>(null);
  const releaseWakeRef = useRef<(() => void) | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const stopGps = useCallback(() => {
    stopGpsRef.current?.();
    stopGpsRef.current = null;
    releaseWakeRef.current?.();
    releaseWakeRef.current = null;
  }, []);

  const startGps = useCallback((tripId: string) => {
    if (stopGpsRef.current) return;
    const socket = getSocket();
    socket.emit('trip:join', { tripId });
    stopGpsRef.current = startForegroundGps(
      (point) => {
        socket.emit('location:update', {
          tripId,
          lat: point.lat,
          lng: point.lng,
          timestamp: point.timestamp,
          speed: point.speed,
        });
        setTrip((prev) =>
          prev
            ? {
                ...prev,
                lastKnownLocation: {
                  lat: point.lat,
                  lng: point.lng,
                  updatedAt: point.timestamp,
                },
              }
            : prev
        );
      },
      (message) => setError(message)
    );
    void requestScreenWakeLock().then((release) => {
      releaseWakeRef.current = release;
    });
  }, []);

  const loadTrip = useCallback(async () => {
    if (!id) return;
    setError('');
    try {
      const res = await api.get<{ data: DriverTripView }>(`/trips/my/${id}`);
      const view = res.data.data;
      setTrip(view);
      activeIdRef.current = view._id;
      if (view.status === 'in_progress') {
        startGps(view._id);
      }
    } catch {
      setTrip(null);
      setError('Could not load this trip');
    } finally {
      setLoading(false);
    }
  }, [id, startGps]);

  useEffect(() => {
    const socket = getSocket();

    function joinIfActive() {
      if (activeIdRef.current) {
        socket.emit('trip:join', { tripId: activeIdRef.current });
      }
    }

    socket.on('connect', joinIfActive);
    socket.on('trip:status_changed', (payload: { tripId: string; status: DriverTripView['status'] }) => {
      if (payload.tripId !== activeIdRef.current) return;
      setTrip((prev) => (prev ? { ...prev, status: payload.status } : prev));
      if (payload.status === 'completed') {
        stopGps();
        activeIdRef.current = null;
      }
    });
    socket.on('stop:reached_broadcast', (payload: { tripId: string; stopIndex: number }) => {
      if (payload.tripId === activeIdRef.current) {
        setTrip((prev) => (prev ? { ...prev, currentStopIndex: payload.stopIndex } : prev));
      }
    });

    void loadTrip();

    return () => {
      socket.off('connect', joinIfActive);
      socket.off('trip:status_changed');
      socket.off('stop:reached_broadcast');
      stopGps();
    };
  }, [loadTrip, stopGps]);

  async function handleStart() {
    if (!trip) return;
    setActionLoading(true);
    setError('');
    try {
      await api.patch(`/trips/${trip._id}/start`);
      setTrip({ ...trip, status: 'in_progress' });
      activeIdRef.current = trip._id;
      startGps(trip._id);
    } catch (err: unknown) {
      const ax = err as { response?: { status?: number; data?: { error?: string } } };
      if (ax.response?.status === 409) {
        await loadTrip();
        return;
      }
      setError(ax.response?.data?.error ?? 'Failed to start trip');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleEnd() {
    if (!trip) return;
    setActionLoading(true);
    setError('');
    try {
      await api.patch(`/trips/${trip._id}/end`);
      stopGps();
      getSocket().emit('trip:leave', { tripId: trip._id });
      activeIdRef.current = null;
      setTrip({ ...trip, status: 'completed' });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { error?: string } } };
      setError(ax.response?.data?.error ?? 'Failed to end trip');
    } finally {
      setActionLoading(false);
    }
  }

  function handleArrived(stopIndex: number) {
    if (!trip) return;
    getSocket().emit('stop:reached', { tripId: trip._id, stopIndex });
  }

  if (loading) {
    return <p className="text-mute text-sm py-12 text-center">Loading trip…</p>;
  }

  if (!trip) {
    return (
      <div className="tf-card p-6 text-center space-y-3">
        <p className="text-sand font-semibold">{error || 'Trip not found'}</p>
        <Link to="/driver" className="tf-link text-sm">
          Back to trips
        </Link>
      </div>
    );
  }

  const showMap = trip.status === 'scheduled' || trip.status === 'in_progress';
  const lastKnownLocation = trip.lastKnownLocation
    ? { lat: trip.lastKnownLocation.lat, lng: trip.lastKnownLocation.lng }
    : null;

  return (
    <div className="flex flex-1 flex-col gap-4 pb-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to="/driver" className="tf-link text-sm">
            ← Trips
          </Link>
          <h1 className="tf-title text-2xl mt-1">{trip.route.name}</h1>
          <p className="text-sm text-mute mt-0.5">
            {trip.vehicle.vehicleNumber} · {new Date(trip.scheduledAt).toLocaleString()}
          </p>
        </div>
        <span
          className={`tf-badge shrink-0 ${
            trip.status === 'in_progress'
              ? 'tf-badge-live'
              : trip.status === 'scheduled'
                ? 'tf-badge-warn'
                : 'tf-badge-muted'
          }`}
        >
          {trip.status === 'in_progress' ? 'Live' : trip.status.replace('_', ' ')}
        </span>
      </div>

      {!!error && <p className="text-sm text-coral">{error}</p>}

      {trip.status === 'in_progress' && (
        <p className="text-xs text-amber tf-card px-3 py-2">
          Keep this tab open and the screen on. Location only updates while the browser is in the foreground.
        </p>
      )}

      {!HAS_MAPS_API_KEY && (
        <p className="text-sm text-amber tf-card px-3 py-2">MAPS_API_KEY is not set — the map will not load.</p>
      )}

      {showMap && (
        <div className="tf-map-frame" style={{ height: 'min(52vh, 420px)' }}>
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center text-sm text-mute">Loading map…</div>
            }
          >
            <RouteMap
              stops={trip.route.stops}
              roadPath={trip.route.roadPath}
              currentStopIndex={trip.currentStopIndex}
              lastKnownLocation={lastKnownLocation}
              tripId={trip._id}
              live={trip.status === 'in_progress'}
            />
          </Suspense>
        </div>
      )}

      <div className="tf-card p-4 space-y-3">
        <p className="text-sm font-medium text-sand">Stops</p>
        <ol className="space-y-2">
          {trip.route.stops.map((stop, idx) => {
            const isReached = idx <= trip.currentStopIndex;
            const canReach = trip.status === 'in_progress' && idx === trip.currentStopIndex + 1;
            return (
              <li key={stop.order} className="flex items-center gap-2 text-sm">
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                    isReached ? 'bg-mint text-ink' : 'bg-cyan text-ink'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className={`flex-1 ${isReached ? 'text-mute line-through' : 'text-sand'}`}>{stop.label}</span>
                {isReached ? (
                  <span className="tf-badge tf-badge-ok">Reached</span>
                ) : canReach ? (
                  <button type="button" className="tf-btn tf-btn-primary py-1 px-3 text-xs" onClick={() => handleArrived(idx)}>
                    Arrived
                  </button>
                ) : (
                  <span className="text-mute text-xs">Pending</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {trip.status === 'scheduled' && (
        <button
          type="button"
          className="tf-btn tf-btn-primary w-full py-3 text-base"
          disabled={actionLoading}
          onClick={() => void handleStart()}
        >
          {actionLoading ? 'Starting…' : 'Start trip'}
        </button>
      )}
      {trip.status === 'in_progress' && (
        <button
          type="button"
          className="tf-btn tf-btn-danger w-full py-3 text-base"
          disabled={actionLoading}
          onClick={() => void handleEnd()}
        >
          {actionLoading ? 'Ending…' : 'End trip'}
        </button>
      )}
      {trip.status === 'completed' && (
        <p className="text-center text-sm text-mute">Trip completed. GPS has stopped.</p>
      )}
    </div>
  );
}

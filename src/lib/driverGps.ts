export type GpsPoint = { lat: number; lng: number; timestamp: string; speed?: number };

/**
 * Foreground browser GPS. The tab must stay open (see DECISIONS.md).
 * Returns a cleanup function.
 */
export function startForegroundGps(
  onPoint: (point: GpsPoint) => void,
  onError: (message: string) => void
): () => void {
  if (!navigator.geolocation) {
    onError('This browser cannot share location. Use Chrome or Safari on the phone.');
    return () => {};
  }

  const emit = (pos: GeolocationPosition) => {
    onPoint({
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      timestamp: new Date(pos.timestamp).toISOString(),
      speed: pos.coords.speed ?? undefined,
    });
  };

  const watchId = navigator.geolocation.watchPosition(emit, () => {
    onError('Location was denied or unavailable. Allow location for this site.');
  }, {
    enableHighAccuracy: true,
    maximumAge: 2000,
    timeout: 15000,
  });

  const intervalId = window.setInterval(() => {
    navigator.geolocation.getCurrentPosition(emit, () => {
      // watchPosition already reported errors
    }, { enableHighAccuracy: true, maximumAge: 4000, timeout: 10000 });
  }, 5000);

  return () => {
    navigator.geolocation.clearWatch(watchId);
    window.clearInterval(intervalId);
  };
}

export async function requestScreenWakeLock(): Promise<() => void> {
  const nav = navigator as Navigator & {
    wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
  };
  if (!nav.wakeLock) return () => {};
  try {
    const sentinel = await nav.wakeLock.request('screen');
    return () => {
      void sentinel.release();
    };
  } catch {
    return () => {};
  }
}

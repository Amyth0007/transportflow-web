import axios from 'axios';

/** Backend API root. Vite proxy `/api` → :3000, or set VITE_API_URL (e.g. http://localhost:3000/api). */
export const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api';

export function backendOrigin(): string {
  if (API_BASE_URL.startsWith('/')) return '';
  return API_BASE_URL.replace(/\/api$/i, '');
}

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

// ── Types mirroring backend plain-object returns ──────────────────────────────

export interface Vehicle {
  _id: string;
  vehicleNumber: string;
  type: string;
  capacity: number | null;
  status: 'active' | 'inactive' | 'maintenance';
  createdAt: string;
}

export interface Driver {
  _id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  status: 'active' | 'inactive';
  assignedVehicleId: string | null;
  createdAt: string;
}

export interface Stop {
  order: number;
  label: string;
  lat: number;
  lng: number;
}

export interface Route {
  _id: string;
  name: string;
  stops: Stop[];
  roadPath: { lat: number; lng: number }[] | null;
  createdAt: string;
}

export interface Organization {
  _id: string;
  name: string;
  orgType: 'gas' | 'school' | 'corporate' | 'generic';
  isActive: boolean;
  createdAt: string;
}

export interface Trip {
  _id: string;
  routeId: string;
  vehicleId: string;
  driverId: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  publicTrackingToken: string;
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  lastKnownLocation: { lat: number; lng: number; updatedAt: string } | null;
  currentStopIndex: number;
  createdAt: string;
  route?: { name: string };
  vehicle?: { vehicleNumber: string };
  driver?: { name: string };
}

export interface OrgStats {
  vehicles: number;
  drivers: number;
  routes: number;
  tripsLive: number;
  tripsScheduled: number;
  tripsCompleted: number;
}

export interface OrganizationListItem extends Organization {
  stats: OrgStats;
}

export interface OrganizationDetail extends Organization {
  stats: OrgStats;
  admins: { _id: string; name: string; email: string; role: string; createdAt: string }[];
}

export interface PlatformOverview {
  orgsTotal: number;
  orgsActive: number;
  orgsDisabled: number;
  tripsLive: number;
  tripsScheduled: number;
}

export interface WorkspaceView {
  org: { _id: string; name: string; orgType: string; isActive: boolean };
  counts: OrgStats;
  liveTrips: {
    _id: string;
    status: 'in_progress';
    scheduledAt: string;
    routeName: string;
    vehicleNumber: string;
    driverName: string;
    publicTrackingToken: string;
  }[];
}

/** GET /api/trips/my — assigned trips with route + vehicle. */
export interface DriverTripView {
  _id: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  scheduledAt: string;
  startedAt: string | null;
  endedAt: string | null;
  lastKnownLocation: { lat: number; lng: number; updatedAt: string } | null;
  currentStopIndex: number;
  route: Route;
  vehicle: { vehicleNumber: string };
}

import api from './api';

export interface AuthUser {
  userId: string;
  organizationId: string;
  role: string;
  email: string;
}

export interface DriverSession {
  _id: string;
  name: string;
  phone: string;
  licenseNumber: string;
}

const TOKEN_KEY = 'tf_token';
const DRIVER_KEY = 'tf_driver';
const ADMIN_KEY = 'tf_admin';

export async function login(
  email: string,
  password: string
): Promise<{ _id: string; name: string; email: string; role: string }> {
  const res = await api.post<{ data: { token: string; user: { _id: string; name: string; email: string; role: string } } }>(
    '/auth/admin/login',
    { email: email.trim().toLowerCase(), password }
  );
  localStorage.removeItem(DRIVER_KEY);
  localStorage.setItem(TOKEN_KEY, res.data.data.token);
  localStorage.setItem(ADMIN_KEY, JSON.stringify(res.data.data.user));
  return res.data.data.user;
}

export async function loginDriver(phone: string, password: string): Promise<DriverSession> {
  const res = await api.post<{ data: { token: string; driver: DriverSession } }>(
    '/auth/driver/login',
    { phone, password }
  );
  const { token, driver } = res.data.data;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(DRIVER_KEY, JSON.stringify(driver));
  sessionStorage.removeItem('tf_driver_autolive');
  return driver;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(DRIVER_KEY);
  localStorage.removeItem(ADMIN_KEY);
}

export function getStoredAdmin(): { name: string; email: string; role: string } | null {
  const raw = localStorage.getItem(ADMIN_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { name: string; email: string; role: string };
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function getStoredDriver(): DriverSession | null {
  const raw = localStorage.getItem(DRIVER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DriverSession;
  } catch {
    return null;
  }
}

/** Decode the JWT payload (no verification — trust is established server-side). */
function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getRole(): string | null {
  const token = getToken();
  if (!token) return null;
  return (decodeToken(token)?.role as string) ?? null;
}

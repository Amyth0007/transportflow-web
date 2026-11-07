import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedSuperAdminRoute from './components/ProtectedSuperAdminRoute';
import ProtectedDriverRoute from './components/ProtectedDriverRoute';
import Layout from './components/Layout';
import SuperAdminLayout from './components/SuperAdminLayout';
import DriverLayout from './components/DriverLayout';
import LoginPage from './pages/LoginPage';
import DriverLoginPage from './pages/DriverLoginPage';
import DriverHomePage from './pages/DriverHomePage';
import DriverTripPage from './pages/DriverTripPage';
import SuperAdminLoginPage from './pages/SuperAdminLoginPage';
import SuperAdminOverviewPage from './pages/SuperAdminOverviewPage';
import SuperAdminOrgsPage from './pages/SuperAdminOrgsPage';
import SuperAdminOrgDetailPage from './pages/SuperAdminOrgDetailPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import VehiclesPage from './pages/VehiclesPage';
import DriversPage from './pages/DriversPage';
import RoutesPage from './pages/RoutesPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import PublicTrackingPage from './pages/PublicTrackingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/driver/login" element={<DriverLoginPage />} />
        <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
        <Route path="/track/:token" element={<PublicTrackingPage />} />

        <Route element={<ProtectedSuperAdminRoute />}>
          <Route element={<SuperAdminLayout />}>
            <Route path="/super-admin" element={<SuperAdminOverviewPage />} />
            <Route path="/super-admin/orgs" element={<SuperAdminOrgsPage />} />
            <Route path="/super-admin/orgs/:id" element={<SuperAdminOrgDetailPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedDriverRoute />}>
          <Route element={<DriverLayout />}>
            <Route path="/driver" element={<DriverHomePage />} />
            <Route path="/driver/trips/:id" element={<DriverTripPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/trips/:id" element={<TripDetailPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ThemeProvider from './theme/ThemeProvider';
import Layout from './components/Layout';
import StandaloneHeader from './components/common/StandaloneHeader';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PredictionsPage from './pages/PredictionsPage';
import LeaguePage from './pages/LeaguePage';
import ProfilePage from './pages/ProfilePage';
import CreateLeaguePage from './pages/CreateLeaguePage';
import CreatePlayerPage from './pages/CreatePlayerPage';
import BracketPage from './pages/BracketPage';

function CreateLeagueRoute() {
  const { logout } = useAuth();
  return (
    <>
      <StandaloneHeader title="Create League" onLogout={logout} />
      <div className="container mx-auto mt-8 px-4">
        <CreateLeaguePage />
      </div>
    </>
  );
}

function CreatePlayerRoute() {
  const { logout } = useAuth();
  return (
    <>
      <StandaloneHeader title="Create Player" onLogout={logout} />
      <div className="container mx-auto mt-8 px-4">
        <CreatePlayerPage />
      </div>
    </>
  );
}

function AppLayoutRoute({ children }) {
  const { logout } = useAuth();
  return <Layout onLogout={logout}>{children}</Layout>;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<LandingPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/create-league" element={<CreateLeagueRoute />} />
        <Route path="/create-player" element={<CreatePlayerRoute />} />

        <Route
          path="/dashboard"
          element={(
            <AppLayoutRoute>
              <Dashboard />
            </AppLayoutRoute>
          )}
        />

        <Route
          path="/predictions"
          element={(
            <AppLayoutRoute>
              <PredictionsPage />
            </AppLayoutRoute>
          )}
        />

        <Route
          path="/league"
          element={(
            <AppLayoutRoute>
              <LeaguePage />
            </AppLayoutRoute>
          )}
        />

        <Route
          path="/profile"
          element={(
            <AppLayoutRoute>
              <ProfilePage />
            </AppLayoutRoute>
          )}
        />

        <Route
          path="/bracket"
          element={(
            <AppLayoutRoute>
              <BracketPage />
            </AppLayoutRoute>
          )}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </>,
  ),
);

function AppContent() {
  return <RouterProvider router={router} />;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
        <ToastContainer position="top-right" autoClose={5000} />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

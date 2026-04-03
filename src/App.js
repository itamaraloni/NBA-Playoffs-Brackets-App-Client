import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ThemeProvider from './theme/ThemeProvider';
import Layout from './components/Layout';
import StandaloneHeader from './components/common/StandaloneHeader';
import FirstLoginDialog from './components/common/FirstLoginDialog';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PredictionsPage from './pages/PredictionsPage';
import LeaguePage from './pages/LeaguePage';
import ProfilePage from './pages/ProfilePage';
import CreateLeaguePage from './pages/CreateLeaguePage';
import CreatePlayerPage from './pages/CreatePlayerPage';
import BracketPage from './pages/BracketPage';
import InviteLandingPage from './pages/InviteLandingPage';
import AdminPage from './pages/AdminPage';
import AdminRoute from './components/admin/AdminRoute';

const PENDING_FIRST_LOGIN_WELCOME_KEY = 'pendingFirstLoginWelcome';
const HAS_COMPLETED_ONBOARDING_KEY = 'hasCompletedOnboarding';
const PENDING_INVITE_TOKEN_KEY = 'pendingInviteToken';

function FirstLoginGuard() {
  const { isNewUser, clearIsNewUser } = useAuth();
  const location = useLocation();
  const isInvitePage = location.pathname.startsWith('/invite');
  const isPublicLandingPage = location.pathname === '/';
  const isInviteJoinPage = location.pathname === '/create-player'
    && Boolean(sessionStorage.getItem(PENDING_INVITE_TOKEN_KEY));
  const [dismissed, setDismissed] = useState(false);
  const hasCompletedOnboarding = localStorage.getItem(HAS_COMPLETED_ONBOARDING_KEY) === 'true';
  const hasPendingFirstLoginWelcome = sessionStorage.getItem(PENDING_FIRST_LOGIN_WELCOME_KEY) === 'true';
  const suppressForInviteFlow = isInvitePage || isInviteJoinPage;

  useEffect(() => {
    setDismissed(false);
  }, [isNewUser, location.pathname]);

  const show = !dismissed
    && (isNewUser || hasPendingFirstLoginWelcome)
    && !suppressForInviteFlow
    && !isPublicLandingPage
    && !hasCompletedOnboarding;

  const handleClose = () => {
    sessionStorage.removeItem(PENDING_FIRST_LOGIN_WELCOME_KEY);
    localStorage.setItem(HAS_COMPLETED_ONBOARDING_KEY, 'true');
    setDismissed(true);
    clearIsNewUser();
  };

  return <FirstLoginDialog open={show} onClose={handleClose} />;
}

function AppContent() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/invite/:token" element={<InviteLandingPage />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/create-league"
            element={
              <>
                <StandaloneHeader title="Create League" onLogout={handleLogout} />
                <div className="container mx-auto mt-8 px-4">
                  <CreateLeaguePage />
                </div>
              </>
            }
          />

          <Route
            path="/create-player"
            element={
              <>
                <StandaloneHeader title="Create Player" onLogout={handleLogout} />
                <div className="container mx-auto mt-8 px-4">
                  <CreatePlayerPage />
                </div>
              </>
            }
          />

          <Route
            path="/dashboard"
            element={
              <Layout onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            }
          />

          <Route
            path="/predictions"
            element={
              <Layout onLogout={handleLogout}>
                <PredictionsPage />
              </Layout>
            }
          />

          <Route
            path="/league"
            element={
              <Layout onLogout={handleLogout}>
                <LeaguePage />
              </Layout>
            }
          />

          <Route
            path="/profile"
            element={
              <Layout onLogout={handleLogout}>
                <ProfilePage />
              </Layout>
            }
          />

          <Route
            path="/bracket"
            element={
              <Layout onLogout={handleLogout}>
                <BracketPage />
              </Layout>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <Layout onLogout={handleLogout}>
                  <AdminPage />
                </Layout>
              </AdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <FirstLoginGuard />
    </Router>
  );
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

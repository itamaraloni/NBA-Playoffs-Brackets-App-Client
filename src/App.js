import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ThemeProvider from './theme/ThemeProvider';
import Layout from './components/Layout';
import StandaloneHeader from './components/common/StandaloneHeader';
import FirstLoginGuard from './components/common/FirstLoginGuard';
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

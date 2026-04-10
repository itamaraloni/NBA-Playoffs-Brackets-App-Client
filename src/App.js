import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Box, Container } from '@mui/material';
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

const STANDALONE_BACKGROUND_SRC = '/og-image-clean-layout.jpg';

function AppContent() {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const renderStandaloneFlowPage = (title, child) => (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <Box
        component="img"
        src={STANDALONE_BACKGROUND_SRC}
        aria-hidden="true"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '62% center',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: 0.18,
          filter: 'blur(10px)',
          transform: 'scale(1.05)',
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        <StandaloneHeader title={title} onLogout={handleLogout} />
        <Container
          maxWidth="lg"
          sx={{
            mt: { xs: 3, sm: 4 },
            px: { xs: 2, sm: 3 },
            pb: { xs: 4, sm: 5 },
          }}
        >
          {child}
        </Container>
      </Box>
    </Box>
  );

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/invite/:token" element={<InviteLandingPage />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/create-league"
            element={renderStandaloneFlowPage('Create League', <CreateLeaguePage />)}
          />

          <Route
            path="/create-player"
            element={renderStandaloneFlowPage('Create Player', <CreatePlayerPage />)}
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

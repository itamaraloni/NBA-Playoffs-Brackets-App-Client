import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ThemeProvider from './theme/ThemeProvider';
import Layout from './components/Layout';
import StandaloneHeader from './components/common/StandaloneHeader';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import PredictionsPage from './pages/PredictionsPage';
import LeaguePage from './pages/LeaguePage';
import ProfilePage from './pages/ProfilePage';
import CreateLeaguePage from './pages/CreateLeaguePage';
import CreatePlayerPage from './pages/CreatePlayerPage';

function AppContent() {
  const { logout } = useAuth();
  
  const handleLogout = () => {
      logout(); // From AuthContext.useAuth()
  };
  
  return (
    <Router>
      <Routes>
        {/* Landing page route - no header */}
        <Route path="/landing" element={<LandingPage />} />
        
        {/* Create pages with minimal header */}
        <Route path="/create-league" element={
          <>
            <StandaloneHeader title="Create League" onLogout={handleLogout} />
            <div className="container mx-auto mt-8 px-4">
              <CreateLeaguePage />
            </div>
          </>
        } />
        
        <Route path="/create-player" element={
          <>
            <StandaloneHeader title="Create Player" onLogout={handleLogout} />
            <div className="container mx-auto mt-8 px-4">
              <CreatePlayerPage />
            </div>
          </>
        } />
        
        {/* App routes with Layout */}
        <Route path="/dashboard" element={
          <Layout onLogout={handleLogout}>
            <Dashboard />
          </Layout>
        } />
        
        <Route path="/predictions" element={
          <Layout onLogout={handleLogout}>
            <PredictionsPage />
          </Layout>
        } />
        
        <Route path="/league" element={
          <Layout onLogout={handleLogout}>
            <LeaguePage />
          </Layout>
        } />
        
        {/* Profile route */}
        <Route path="/profile" element={
          <Layout onLogout={handleLogout}>
            <ProfilePage />
          </Layout>
        } />
        
        {/* Default redirect to landing page */}
        <Route path="/" element={<Navigate to="/landing" replace />} />
        <Route path="*" element={<Navigate to="/landing" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
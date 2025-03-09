import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppNavigation from './components/AppNavigation';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import RoundPredictions from './pages/RoundPredictions';
import LeaguePage from './pages/LeaguePage';
import ProfilePage from './pages/ProfilePage';
import CreateLeaguePage from './pages/CreateLeaguePage';
import CreatePlayerPage from './pages/CreatePlayerPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Routes component now outside the nav and container */}
          <Routes>
            {/* Landing page route */}
            <Route path="/landing" element={<LandingPage />} />
            
            {/* App routes with navigation */}
            <Route path="/dashboard" element={
              <div>
                <AppNavigation />
                <div className="container mx-auto mt-8 px-4">
                  <Dashboard />
                </div>
              </div>
            } />
            <Route path="/predictions" element={
              <div>
                <AppNavigation />
                <div className="container mx-auto mt-8 px-4">
                  <RoundPredictions />
                </div>
              </div>
            } />
            <Route path="/league" element={
              <div>
                <AppNavigation />
                <div className="container mx-auto mt-8 px-4">
                  <LeaguePage />
                </div>
              </div>
            } />

            {/* Profile route */}
            <Route path="/profile" element={
              <div>
                <AppNavigation />
                <div className="container mx-auto mt-8 px-4">
                  <ProfilePage />
                </div>
              </div>
            } />

            {/* Create League route */}
            <Route path="/create-league" element={
              <div>
                <div className="container mx-auto mt-8 px-4">
                  <CreateLeaguePage />
                </div>
              </div>
            } />

            {/* Create Player entity route */}
            <Route path="/create-player" element={
              <div>
                <div className="container mx-auto mt-8 px-4">
                  <CreatePlayerPage />
                </div>
              </div>
            } />
            
            {/* Default redirect to landing page */}
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="*" element={<Navigate to="/landing" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
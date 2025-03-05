import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import RoundPredictions from './pages/RoundPredictions';
import LeaguePage from './pages/LeaguePage';

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
            
            {/* Default redirect to landing page */}
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="*" element={<Navigate to="/landing" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Navigation component extracted to avoid repeating in each route
function AppNavigation() {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">NBA Playoff Predictions</h1>
        <div className="space-x-4">
          <a href="/dashboard" className="text-white hover:text-blue-200">Dashboard</a>
          <a href="/predictions" className="text-white hover:text-blue-200">Predictions</a>
          <a href="/league" className="text-white hover:text-blue-200">My League</a>
        </div>
      </div>
    </nav>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import RoundPredictions from './pages/RoundPredictions';
import LeaguePage from './pages/LeaguePage';
import ProfilePage from './pages/ProfilePage';

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
            
            {/* Default redirect to landing page */}
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="*" element={<Navigate to="/landing" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Navigation component with logout button, profile button and tabs
function AppNavigation() {
  // Get the logout function from AuthContext
  const { logout, currentUser } = useAuth();
  // Get current location for active tab highlighting
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to landing page after logout
      window.location.href = '/landing';
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto">
        {/* Top row: Title and Logout */}
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-white text-2xl font-bold">NBA Playoff Predictions</h1>
          <div>
            {currentUser && (
              <div className="flex items-center space-x-4">
                <a href="/profile" className="flex items-center text-white hover:text-blue-200 font-medium">
                  <div className="bg-blue-500 p-1 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {currentUser.displayName || currentUser.email}
                </a>
                <button 
                  onClick={handleLogout}
                  className="bg-white text-blue-600 px-4 py-1 rounded hover:bg-blue-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Bottom row: Navigation tabs */}
        <div className="flex space-x-6">
          <a 
            href="/dashboard" 
            className={`text-white pb-1 border-b-2 transition-colors ${
              location.pathname === '/dashboard' 
                ? 'border-white font-bold' 
                : 'border-transparent hover:border-white hover:text-blue-200'
            }`}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Dashboard
            </div>
          </a>
          <a 
            href="/predictions" 
            className={`text-white pb-1 border-b-2 transition-colors ${
              location.pathname === '/predictions' 
                ? 'border-white font-bold' 
                : 'border-transparent hover:border-white hover:text-blue-200'
            }`}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12zm0-2a4 4 0 100-8 4 4 0 000 8zm0-2a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              Predictions
            </div>
          </a>
          <a 
            href="/league" 
            className={`text-white pb-1 border-b-2 transition-colors ${
              location.pathname === '/league' 
                ? 'border-white font-bold' 
                : 'border-transparent hover:border-white hover:text-blue-200'
            }`}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              My League
            </div>
          </a>
        </div>
      </div>
    </nav>
  );
}

export default App;
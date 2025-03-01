import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RoundPredictions from './pages/RoundPredictions';
import LeaguePage from './pages/LeaguePage';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="bg-blue-600 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-white text-2xl font-bold">NBA Playoff Predictions</h1>
            <div className="space-x-4">
              <Link to="/" className="text-white hover:text-blue-200">Home</Link>
              <Link to="/predictions" className="text-white hover:text-blue-200">Predictions</Link>
              <Link to="/league" className="text-white hover:text-blue-200">My League</Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto mt-8 px-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/predictions" element={<RoundPredictions />} />
            <Route path="/league" element={<LeaguePage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaBasketballBall } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const LandingPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is already logged in and redirect accordingly
  useEffect(() => {
    if (currentUser) {
      // For now, always redirect to dashboard
      // Later we'll add backend check for new vs existing users
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
      // Redirect will be handled by the useEffect when currentUser updates
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <FaBasketballBall className="text-orange-500 text-3xl mr-2" />
            <h1 className="text-2xl font-bold">NBA Playoff Predictions</h1>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-grow bg-gradient-to-b from-blue-700 to-blue-900 text-white py-20">
        <div className="container mx-auto px-4">
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6 max-w-md mx-auto">
              {error}
            </div>
          )}

          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6">Predict. Compete. Win.</h2>
            <p className="text-xl mb-8">
              Join thousands of basketball fans in predicting the NBA Playoff outcomes. 
              Test your basketball knowledge and climb the leaderboards!
            </p>
            
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg text-xl font-bold flex items-center mx-auto"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                <>
                  <FaGoogle className="mr-2" />
                  Get Started with Google
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <FaBasketballBall className="text-orange-500 text-xl mr-2" />
            <span className="font-bold">NBA Playoff Predictor</span>
          </div>
          <p className="text-gray-400 text-sm">© {new Date().getFullYear()} All Rights Reserved to Darch & Itapita8</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Component that protects routes requiring authentication
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // If authentication is still loading, show nothing (or a loading spinner)
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // If user is not authenticated, redirect to landing page
  // Otherwise, render the child routes
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
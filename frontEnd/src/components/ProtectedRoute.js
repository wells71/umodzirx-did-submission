import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const ProtectedRoute = ({ allowedRoles }) => {
  const { authState, loading, isTokenExpired } = useAuth();
  const { token, user } = authState;
  const navigate = useNavigate();
  
  // For development, check localStorage for role
  const userRole = localStorage.getItem('userRole');

  // Store current path for back button handling
  useEffect(() => {
    sessionStorage.setItem('lastProtectedPath', window.location.pathname);
    
    // Add navigation function to window for global access
    // This helps with handling navigation from components that don't have direct access
    window.handleNavigation = (path) => {
      console.log('Global navigation handler called with path:', path);
      navigate(path);
    };
    
    return () => {
      // Clean up when unmounted
      window.handleNavigation = undefined;
    };
  }, [window.location.pathname, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-lg">Loading...</div>;
  }

  // Check if token exists
  // if (!token || isTokenExpired()) {
  //   return <Navigate to="/session-expired" replace />;
  // }

  // Check if user has the required role
  // First check user object from auth state, then fallback to localStorage for development
  // const role = user?.role || userRole;
  
  // if (!role || !allowedRoles.includes(role)) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  return <Outlet />;
};

export default ProtectedRoute;

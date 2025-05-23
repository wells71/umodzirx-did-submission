import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
    localStorage.clear();
  };

  // Define all protected routes
  const protectedRoutes = ["/admin", "/doctor", "/pharmacist", "/patient", "/view-patient-prescriptions"];

  // Check if current route is protected
  const isProtectedRoute = protectedRoutes.includes(location.pathname);

  // ignore protection for dev purposes
  if (isProtectedRoute) {
    return null; // or some fallback UI
  }
  
}

export default Navbar;
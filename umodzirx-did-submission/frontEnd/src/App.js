import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ViewPatientPrescriptions from "./pages/ViewPatientPrescriptions";
import Unauthorized from "./pages/Unauthorized";
import AuthCallback from "./pages/AuthCallback";
import ProtectedRoute from "./components/ProtectedRoute"; 
import SessionExpired from './pages/SessionExpired';
import Learn from './pages/LearnMore';
import Contact from './pages/Contact';
import VerifyPrescriptionPage from './pages/VerifyPrescriptionPage';
import Dashboard from './pages/Dashboard';
import "./App.css";

function App() {
  // Set role based on the current URL path
  useEffect(() => {
    const updateRoleBasedOnPath = () => {
      const path = window.location.pathname;
      let role = '';
      
      // Determine role based on URL path
      if (path.startsWith('/admin')) {
        role = 'admin';
      } else if (path.startsWith('/doctor')) {
        role = 'doctor';
      } else if (path.startsWith('/patient')) {
        role = 'patient';
      } else if (path.startsWith('/pharmacist')) {
        role = 'pharmacist';
      } else if (path === '/' || path === '/login') {
        // Don't change role on home or login page
        return;
      } else {
        // Default role if no specific path matches
        role = 'patient';
      }
      
      const currentRole = localStorage.getItem('userRole');
      
      // Check role needs to be updated
      const shouldUpdateRole = !currentRole || 
        (path.includes(`/${role}`) && currentRole !== role);
      
      if (shouldUpdateRole) {
        // Set the role in localStorage
        localStorage.setItem('userRole', role);
        localStorage.setItem('userId', `dev-${role}-123`);
        localStorage.setItem('userName', `${role.charAt(0).toUpperCase() + role.slice(1)} User`);
        localStorage.setItem('token', `dev-token-${role}-123`);
        
        console.log(`Set user role to: ${role} based on path: ${path}`);
      }
    };

    // Update role on initial load
    updateRoleBasedOnPath();

    // Listen for route changes
    const handleRouteChange = () => {
      updateRoleBasedOnPath();
    };

    // Add event listener for popstate (browser back/forward)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background dark:bg-background-dark">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/session-expired" element={<SessionExpired />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/verify-prescription/:id?" element={<VerifyPrescriptionPage />} />

            {/* Protected Routes with Role-Based Access Control */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin/*" element={<Dashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["doctor"]} />}>
              <Route path="/doctor/*" element={<Dashboard />} />
              <Route path="/doctor/patient/:id" element={<ViewPatientPrescriptions />} />
              <Route path="/doctor/appointment/:id" element={<ViewPatientPrescriptions />} />
              <Route path="/view-patient-prescriptions" element={<ViewPatientPrescriptions />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["pharmacist"]} />}>
              <Route path="/pharmacist/*" element={<Dashboard />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["patient"]} />}>
              <Route path="/patient/*" element={<Dashboard />} />
            </Route>

            {/* Fallback routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
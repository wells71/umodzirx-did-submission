import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/common/LoadingSpinner";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleOIDCCallback } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get("code");
        const role = queryParams.get("role");

        console.log("[AuthCallback] Received code:", code);
        console.log("[AuthCallback] Received role:", role);

        if (!code || !role) {
          console.error("[AuthCallback] Missing authorization code or role");
          setError("Missing authorization parameters");
          navigate("/login");
          return;
        }

        // Exchange the code for a token
        const response = await axios.post("http://localhost:5000/auth/exchange", { 
          code, 
          role 
        });

        console.log("[AuthCallback] Backend response:", response.data);
        const { token, user } = response.data;
        const userRole = response.data.role;

        if (!token || !user) {
          console.error("[AuthCallback] Missing token or user in response");
          setError("Invalid authentication response");
          navigate("/login");
          return;
        }

        // Store user info in localStorage based on role
        localStorage.setItem("userRole", userRole);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("userName", user.name);
        localStorage.setItem("userEmail", user.email);
        
        // Set auth context
        handleOIDCCallback(token, { ...user, role: userRole });

        // Role-specific storage and navigation
        if (userRole === "admin") {
          localStorage.setItem("adminName", user.name);
          localStorage.setItem("adminId", user.id);
          navigate("/admin", { state: { enableSearch: true } });
        } else if (userRole === "doctor") { 
          localStorage.setItem("doctorName", user.name);
          localStorage.setItem("doctorId", user.id);
          navigate("/doctor");
        } else if (userRole === "pharmacist") {
          localStorage.setItem("pharmaName", user.name);
          localStorage.setItem("pharmaId", user.id);
          localStorage.setItem("pharmaEmail", user.email);
          navigate("/pharmacist");
        } else {
          // Default to patient
          localStorage.setItem("patientName", user.name);
          localStorage.setItem("patientId", user.id);
          navigate("/patient");
        }
      } catch (error) {
        console.error("[AuthCallback] Error processing callback:", error);
        setError(error.message || "Authentication failed");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [location, navigate, handleOIDCCallback]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <LoadingSpinner />
        <p className="mt-4 text-lg text-gray-700">Authenticating...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => navigate("/login")}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;

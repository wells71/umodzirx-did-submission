import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CryptoJS from "crypto-js"; // Correct import for crypto-js


const SECRET_KEY = "qwertasdfgzxc"; // Symmetric encryption key

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { handleOIDCCallback } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const processAuth = async () => {
      try {
        setStatus("parsing-parameters");
        const encryptedData = searchParams.get("data");

        if (!encryptedData) {
          throw new Error("Missing authentication data");
        }

        setStatus("decrypting-data");
        const decryptedBytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedData), SECRET_KEY);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

        // Check if decryption was successful and valid JSON
        if (!decryptedText) {
          throw new Error("Decryption failed or invalid data");
        }

        const { user, token } = JSON.parse(decryptedText);

        if (!user || !token) {
          throw new Error("Invalid decrypted data");
        }

        // Store user data in auth state and local storage
        handleOIDCCallback(token, user);

        setStatus("redirecting");

        // Redirect based on role
        const role = user.role ? user.role.toLowerCase() : "";
        const roleRoutes = {
          admin: "/admin/dashboard",
          doctor: "/doctor/dashboard",
          pharmacist: "/pharmacist/dashboard",
          patient: "/patient/dashboard",
        };

        // Default to home if role is not found
        const redirectTo = roleRoutes[role] || "/";

        // Perform navigation
        navigate(redirectTo, { replace: true });
      } catch (error) {
        console.error("Authentication error:", error);
        setStatus("failed");
        navigate("/login", { replace: true });
      }
    };

    processAuth();
  }, [searchParams, navigate, handleOIDCCallback]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">
        {status === "processing" && "Processing authentication..."}
        {status === "parsing-parameters" && "Reading parameters..."}
        {status === "decrypting-data" && "Decrypting authentication data..."}
        {status === "redirecting" && "Redirecting..."}
        {status === "failed" && "Authentication failed"}
      </h1>
    </div>
  );
};

export default AuthCallback;
    
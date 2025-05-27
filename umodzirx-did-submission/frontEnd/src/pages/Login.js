import { useNavigate } from 'react-router-dom';
import React, { useState, useCallback, useEffect } from "react";
import prescriptionImage from "./Prescription_medication.jpeg";

function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return randomString;
}

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showTraditionalLogin, setShowTraditionalLogin] = useState(false);

  useEffect(() => {
    const nonce = generateRandomString(16);
    const state = generateRandomString(16);

    const renderButton = () => {
      window.SignInWithEsignetButton?.init({
        oidcConfig: {
          acr_values: 'mosip:idp:acr:generated-code mosip:idp:acr:biometricr:static-code mosip:idp:acr:password',
          claims_locales: 'en',
          client_id: process.env.REACT_APP_ESIGNET_CLIENT_ID,
          redirect_uri: process.env.REACT_APP_ESIGNET_REDIRECT_URI_LOGIN,
          display: 'page',
          nonce: nonce,
          prompt: 'consent',
          scope: 'openid profile',
          state: state,
          ui_locales: 'en',
          authorizeUri: process.env.REACT_APP_ESIGNET_AUTHORIZE_URI,
        },
        buttonConfig: {
          labelText: 'Sign in with eSignet',
          shape: 'rounded',
          theme: 'filled_blue',
          type: 'standard'
        },
        signInElement: document.getElementById('esignet-button'),
      });
    };
    renderButton();
  }, [navigate]);

  const handleLoginSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid credentials");
      }
  
      const data = await response.json();
      const { token, role } = data;
  
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", role);
  
      // Handle different role redirections
      switch(role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'doctor':
          navigate('/doctor'); 
          break;
        case 'pharmacist':
          navigate('/pharmacist/dashboard');
          break;
        default:
          navigate('/login');
      }
      
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [username, password, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white overflow-hidden shadow-lg rounded-xl">
        <div className="flex flex-col md:flex-row">
          {/* Left Side - Brand Banner */}
          <div className="w-full md:w-1/2 bg-gradient-to-br from-teal-600 to-blue-600 p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center text-white rounded-t-xl md:rounded-t-none md:rounded-l-xl">
            <div className="text-center space-y-4 sm:space-y-6">
              <img 
                src={prescriptionImage} 
                alt="Prescription and Medication" 
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover rounded-full border-4 border-white shadow-md mx-auto"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">UmodziRx</h1>
                <p className="text-base sm:text-lg md:text-xl font-light opacity-90">
                  Secure Prescription Management
                </p>
              </div>
              <div className="pt-4 md:pt-6">
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 border-t md:border-t-0 md:border-l border-gray-300 rounded-b-xl md:rounded-b-none md:rounded-r-xl">
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome Back</h2>
                <p className="text-gray-600 mt-2">
                  Sign in to access your account
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Primary Login - eSignet */}
              <div className="mb-6">
                <div id="esignet-button" className="w-full h-12 flex items-center justify-center text-center rounded-lg border border-gray-300 bg-white"></div>
              </div>

              <div className="flex items-center my-6">
                <hr className="flex-grow border-t border-gray-200" />
                <span className="mx-4 text-sm text-gray-500">or</span>
                <hr className="flex-grow border-t border-gray-200" />
              </div>

              {/* Secondary Login - Username/Password */}
              {showTraditionalLogin ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
                  <div>
                    <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      aria-label="Username"
                      aria-required="true"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      placeholder="Enter your username"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        aria-label="Password"
                        aria-required="true"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm sm:text-base py-2.5 sm:py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : "Sign in"}
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowTraditionalLogin(true)}
                  className="w-full bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200"
                >
                  Sign in with username/password
                </button>
              )}

              <div className="mt-8 text-center text-sm text-gray-500">
                <p>Don't have an account? <a href="#" className="text-blue-600 hover:underline">Contact administrator</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
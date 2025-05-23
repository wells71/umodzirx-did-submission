import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SessionExpired = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogin = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 py-8">
      <div className="w-full max-w-xs sm:max-w-md p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-md text-center">
        <svg className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Session Expired</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Your session has expired. Please log in again to continue.</p>
        <button
          onClick={handleLogin}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
};

export default SessionExpired;
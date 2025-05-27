import React, { useState } from 'react';
import { FiCode, FiX, FiInfo } from 'react-icons/fi';

/**
 * Debug component to display current role information
 * Useful for development and troubleshooting
 */
const DebugRoleInfo = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get all relevant information from localStorage
  const userRole = localStorage.getItem('userRole') || 'Not set';
  const userId = localStorage.getItem('userId') || 'Not set';
  const userName = localStorage.getItem('userName') || 'Not set';
  const currentPath = window.location.pathname;
  
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
        aria-label="Show debug info"
      >
        <FiCode size={20} />
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-80 z-50 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
          <FiInfo className="mr-2" /> Role Debug Info
        </h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Close debug panel"
        >
          <FiX size={18} />
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <p className="text-gray-500 dark:text-gray-400">Current Path:</p>
          <p className="font-mono text-gray-800 dark:text-gray-200">{currentPath}</p>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <p className="text-gray-500 dark:text-gray-400">User Role:</p>
          <p className="font-mono text-gray-800 dark:text-gray-200">{userRole}</p>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <p className="text-gray-500 dark:text-gray-400">User ID:</p>
          <p className="font-mono text-gray-800 dark:text-gray-200">{userId}</p>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
          <p className="text-gray-500 dark:text-gray-400">User Name:</p>
          <p className="font-mono text-gray-800 dark:text-gray-200">{userName}</p>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm transition-colors"
        >
          Clear localStorage & Reload
        </button>
      </div>
    </div>
  );
};

export default DebugRoleInfo;
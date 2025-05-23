import React from 'react';
import PropTypes from 'prop-types';

const StatusIndicator = ({ status, isPrescription = false }) => {
  // Define status colors and styles
  const statusStyles = {
    Completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    Dispensed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
    Confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    Unconfirmed: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    Revoked: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
    Issued: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    Active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  };
  
  // Get appropriate styling based on status
  let normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  
  // For prescriptions, display "Dispensed" instead of "Completed"
  if (isPrescription && normalizedStatus === 'Completed') {
    normalizedStatus = 'Dispensed';
  }
  
  const statusClass = statusStyles[normalizedStatus] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  
  // Define dot color based on status
  const getDotColor = (status) => {
    switch(normalizedStatus) {
      case 'Completed': 
      case 'Dispensed': 
        return 'bg-green-500';
      case 'Confirmed':
      case 'Active': 
        return 'bg-blue-500';
      case 'Unconfirmed': return 'bg-amber-500';
      case 'Cancelled': return 'bg-red-500';
      case 'Pending': return 'bg-yellow-500';
      case 'Revoked': return 'bg-red-500';
      case 'Issued': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusClass} border`}>
      <span className={`w-2 h-2 rounded-full mr-1.5 ${getDotColor(status)}`}></span>
      {normalizedStatus}
    </div>
  );
};

StatusIndicator.propTypes = {
  status: PropTypes.string.isRequired,
  isPrescription: PropTypes.bool
};

export default StatusIndicator;

import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiClock, FiXCircle } from 'react-icons/fi';

/**
 * StatusIndicator - A reusable component for displaying status
 * 
 * @param {Object} props
 * @param {string} props.status - Status value (verified, pending, failed, dispensed, etc.)
 * @param {string} props.size - Size of the indicator (sm, md, lg)
 * @param {boolean} props.showText - Whether to show the status text
 */
const StatusIndicator = ({ status, size = 'md', showText = true }) => {
  const statusConfig = {
    verified: {
      icon: FiCheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      text: 'Verified'
    },
    pending: {
      icon: FiClock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      text: 'Pending'
    },
    failed: {
      icon: FiXCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      text: 'Failed'
    },
    dispensed: {
      icon: FiCheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      text: 'Dispensed'
    },
    expired: {
      icon: FiAlertCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      text: 'Expired'
    }
  };

  // Default to pending if status is not recognized
  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center">
      <div className={`${config.bgColor} rounded-full p-1 mr-2`}>
        <Icon className={`${config.color} ${sizeClasses[size]}`} />
      </div>
      {showText && (
        <span className={`${config.color} font-medium ${textSizeClasses[size]}`}>
          {config.text}
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;
import React from 'react';

const LoadingSpinner = ({ size = 'medium' }) => {
  const sizes = {
    small: 'h-6 w-6',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-4 border-solid border-current border-r-transparent ${sizes[size]}`}>
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
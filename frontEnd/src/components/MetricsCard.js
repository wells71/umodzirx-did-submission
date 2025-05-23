import React from 'react';
import PropTypes from 'prop-types';

const MetricsCard = ({ icon, title, value, increase, trend = 'up', iconColor, bgColor, subtitle }) => {
  const trendIcon = trend === 'up' ? (
    <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
    </svg>
  ) : (
    <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
    </svg>
  );

  const trendClass = trend === 'up' 
    ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' 
    : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';

  return (
    <div className="rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor || 'bg-blue-50 dark:bg-blue-900/20'}`}>
          {icon && <span className={`text-xl ${iconColor || 'text-blue-600 dark:text-blue-400'}`}>{icon}</span>}
        </div>
        <div className="flex items-center">
          <span className={`inline-flex items-center space-x-1 text-xs font-medium ${trendClass} py-1 px-2 rounded-full`}>
            {trendIcon}
            <span>+{increase}%</span>
          </span>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

MetricsCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  increase: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.oneOf(['up', 'down']),
  iconColor: PropTypes.string,
  bgColor: PropTypes.string,
  subtitle: PropTypes.string
};

export default MetricsCard;

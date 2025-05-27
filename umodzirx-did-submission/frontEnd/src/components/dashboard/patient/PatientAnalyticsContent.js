import React, { useState } from 'react';
import { FiBarChart2, FiTrendingUp, FiCalendar, FiDownload } from 'react-icons/fi';
import MetricsCard from '../../common/MetricsCard';
import WeeklyStatsChart from '../../WeeklyStatsChart';
import PrescriptionTrendsChart from '../../PrescriptionTrendsChart';

const PatientAnalyticsContent = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30');
  // Get the dark mode state from local storage or default to false
  const darkMode = (() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  })();
  
  // Sample metrics data for patient analytics
  const analyticsMetrics = [
    {
      id: 'prescriptions-received',
      icon: <FiBarChart2 />,
      title: 'Prescriptions Received',
      value: '36',
      increase: '4',
      subtitle: 'Last month: 32',
      trend: 'up',
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'prescription-renewal',
      icon: <FiTrendingUp />,
      title: 'Renewal Rate',
      value: '82%',
      increase: '8',
      subtitle: 'Of eligible prescriptions',
      trend: 'up',
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  // Sample medication data
  const topMedicationsByPrescription = [
    { name: 'Paracetamol', count: 12, change: '+2' },
    { name: 'Amoxicillin', count: 8, change: '0' },
    { name: 'Lisinopril', count: 6, change: '+1' },
    { name: 'Metformin', count: 5, change: '+1' },
    { name: 'Ibuprofen', count: 5, change: '1' }
  ];

  // Sample prescription trend data
  const prescriptionTrends = [
    { month: 'Jan', count: 2 },
    { month: 'Feb', count: 3 },
    { month: 'Mar', count: 4 },
    { month: 'Apr', count: 2 },
    { month: 'May', count: 5 },
    { month: 'Jun', count: 3 },
    { month: 'Jul', count: 4 },
    { month: 'Aug', count: 2 },
    { month: 'Sep', count: 3 },
    { month: 'Oct', count: 4 },
    { month: 'Nov', count: 2 },
    { month: 'Dec', count: 4 }
  ];

  // List of tab options
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'prescriptions', label: 'Prescription Trends' },
    { id: 'medications', label: 'Medication Analysis' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
      {/* Header Section */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Medication Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Insights and trends for your medication history</p>
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white dark:bg-blue-500' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>
          <button className="inline-flex items-center px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
            <FiDownload className="h-4 w-4 mr-1.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsMetrics.map((metric) => (
          <MetricsCard 
            key={metric.id}
            icon={metric.icon}
            title={metric.title}
            value={metric.value}
            increase={metric.increase}
            subtitle={metric.subtitle}
            trend={metric.trend}
            iconColor={metric.iconColor}
            bgColor={metric.bgColor}
          />
        ))}
      </div>

      {/* Main Analytics Content */}      
      {/* Weekly Stats Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Weekly Medication Usage</h3>
          <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
            <span>View Details</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        </div>
        <WeeklyStatsChart darkMode={darkMode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescription Trends Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Prescription Trends</h3>
          <PrescriptionTrendsChart darkMode={darkMode} data={prescriptionTrends} />
        </div>

        {/* Top Medications */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Your Top Medications</h3>
          <ul className="space-y-3">
            {topMedicationsByPrescription.map((med) => (
              <li key={med.name} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{med.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{med.count} prescriptions</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  med.change === '0' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' :
                  med.change.startsWith('+') 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                }`}>
                  {med.change}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>      
      
    </div>
  );
};

export default PatientAnalyticsContent;

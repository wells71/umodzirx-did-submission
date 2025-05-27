import React, { useState } from 'react';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiCalendar, FiDownload, FiFilter } from 'react-icons/fi';
import MetricsCard from '../../common/MetricsCard';
import WeeklyStatsChart from '../../WeeklyStatsChart';
import PrescriptionTrendsChart from '../../PrescriptionTrendsChart';
import AppointmentsTable from '../../common/AppointmentsTable';

const PharmacistAnalyticsContent = ({ activeView, handleNavigation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30');
  // Get the dark mode state from local storage or default to false
  const [darkMode, setDarkMode] = useState(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    return savedDarkMode ? JSON.parse(savedDarkMode) : false;
  });
  
  // Sample metrics data for pharmacy analytics
  const analyticsMetrics = [
    {
      id: 'prescriptions-dispensed',
      icon: <FiBarChart2 />,
      title: 'Prescriptions Dispensed',
      value: '482',
      increase: '8',
      subtitle: 'Last month: 446',
      trend: 'up',
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'dispensing-rate',
      icon: <FiPieChart />,
      title: 'Dispensing Rate',
      value: '93%',
      increase: '5',
      subtitle: 'Last month: 88%',
      trend: 'up',
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'inventory-turnover',
      icon: <FiTrendingUp />,
      title: 'Inventory Turnover',
      value: '4.2x',
      increase: '3',
      subtitle: 'Last quarter: 4.1x',
      trend: 'up',
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    }
  ];

  // Sample top medications data
  const topMedicationsByVolume = [
    { name: 'Paracetamol 500mg', count: 142, change: '+12' },
    { name: 'Amoxicillin 250mg', count: 87, change: '+5' },
    { name: 'Metformin 500mg', count: 65, change: '+8' },
    { name: 'Lisinopril 10mg', count: 58, change: '-3' },
    { name: 'Ibuprofen 400mg', count: 45, change: '+2' }
  ];

  // Sample prescription trend data for pharmacy
  const prescriptionTrends = [
    { month: 'Jan', count: 32 },
    { month: 'Feb', count: 36 },
    { month: 'Mar', count: 41 },
    { month: 'Apr', count: 38 },
    { month: 'May', count: 42 },
    { month: 'Jun', count: 35 },
    { month: 'Jul', count: 39 },
    { month: 'Aug', count: 32 },
    { month: 'Sep', count: 37 },
    { month: 'Oct', count: 44 },
    { month: 'Nov', count: 38 },
    { month: 'Dec', count: 45 }
  ];

  // Sample inventory trend data
  const inventoryTrends = [
    { month: 'Jan', value: 48500 },
    { month: 'Feb', value: 46200 },
    { month: 'Mar', value: 51000 },
    { month: 'Apr', value: 49300 },
    { month: 'May', value: 52400 },
    { month: 'Jun', value: 50100 },
    { month: 'Jul', value: 48900 },
    { month: 'Aug', value: 47500 },
    { month: 'Sep', value: 49800 },
    { month: 'Oct', value: 51200 },
    { month: 'Nov', value: 52400 },
    { month: 'Dec', value: 53700 }
  ];

  // Sample dispensing times for efficiency metrics
  const dispensingTimes = [
    { day: 'Mon', avgTime: 8.5 },
    { day: 'Tue', avgTime: 7.8 },
    { day: 'Wed', avgTime: 9.2 },
    { day: 'Thu', avgTime: 8.1 },
    { day: 'Fri', avgTime: 10.5 },
    { day: 'Sat', avgTime: 6.5 },
    { day: 'Sun', avgTime: 5.2 }
  ];

  // List of tab options
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'dispensing', label: 'Dispensing Metrics' },
    { id: 'inventory', label: 'Inventory Analysis' },
    { id: 'efficiency', label: 'Pharmacy Efficiency' }
  ];

  // Generate random data for weekly stats to simulate real data patterns
  const generateWeeklyStatsData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => {
      return {
        day,
        prescriptions: Math.floor(Math.random() * 15) + 5,
        refills: Math.floor(Math.random() * 10) + 2,
      };
    });
  };

  // Weekly dispensed prescriptions data
  const weeklyStats = generateWeeklyStatsData();

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
      {/* Header Section */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Pharmacy Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400">Insights and trends for your pharmacy operations</p>
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
              <FiCalendar className="h-4 w-4" />
            </div>
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none">
            <FiDownload className="mr-2 h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

      {/* Analytics Content based on active tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weekly Stats Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Weekly Dispensing Activity</h3>
                <div className="relative">
                  <select
                    className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-1 px-3 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>This Week</option>
                    <option>Last Week</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                    <FiFilter className="h-3 w-3" />
                  </div>
                </div>
              </div>
              <div className="h-80">
                <WeeklyStatsChart data={weeklyStats} darkMode={darkMode} />
              </div>
            </div>

            {/* Top Medications By Volume */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Top Medications by Volume</h3>
              <div className="space-y-4">
                {topMedicationsByVolume.map((medication, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-5">
                        {index + 1}.
                      </span>
                      <span className="ml-2 text-sm text-gray-900 dark:text-white">{medication.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{medication.count}</span>
                      <span className={`ml-2 text-xs ${medication.change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {medication.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  View all medications →
                </button>
              </div>
            </div>
          </div>

          {/* Prescription Trends */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Prescription Dispensing Trends</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Show:</span>
                <div className="relative">
                  <select
                    className="appearance-none bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 py-1 px-3 pr-8 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Monthly</option>
                    <option>Weekly</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                    <FiFilter className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
            <div className="h-80">
              <PrescriptionTrendsChart data={prescriptionTrends} darkMode={darkMode} />
            </div>
          </div>
        </>
      )}

      {activeTab === 'dispensing' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Dispensing Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Dispensing Status Distribution</h4>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Dispensed</span>
                    <div className="flex items-center">
                      <div className="w-48 h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 dark:bg-green-400" style={{ width: '82%' }}></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">82%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Verified</span>
                    <div className="flex items-center">
                      <div className="w-48 h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 dark:bg-blue-400" style={{ width: '11%' }}></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">11%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Pending</span>
                    <div className="flex items-center">
                      <div className="w-48 h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 dark:bg-amber-400" style={{ width: '5%' }}></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">5%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Rejected</span>
                    <div className="flex items-center">
                      <div className="w-48 h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500 dark:bg-red-400" style={{ width: '2%' }}></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">2%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Prescription Source</h4>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Direct from Doctor</span>
                    <div className="flex items-center">
                      <div className="w-48 h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 dark:bg-purple-400" style={{ width: '68%' }}></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">68%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Walk-in</span>
                    <div className="flex items-center">
                      <div className="w-48 h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 dark:bg-indigo-400" style={{ width: '22%' }}></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">22%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Refills</span>
                    <div className="flex items-center">
                      <div className="w-48 h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 dark:bg-blue-400" style={{ width: '10%' }}></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Dispensing by Time of Day</h4>
            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
              <div className="h-64">
                {/* Replace with actual Time of Day chart component */}
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-6">
                    <div className="flex items-end h-32 space-x-4 mb-4 justify-center">
                      <div className="w-8 bg-blue-500 dark:bg-blue-400 rounded-t" style={{ height: '30%' }}></div>
                      <div className="w-8 bg-blue-500 dark:bg-blue-400 rounded-t" style={{ height: '45%' }}></div>
                      <div className="w-8 bg-blue-500 dark:bg-blue-400 rounded-t" style={{ height: '80%' }}></div>
                      <div className="w-8 bg-blue-500 dark:bg-blue-400 rounded-t" style={{ height: '100%' }}></div>
                      <div className="w-8 bg-blue-500 dark:bg-blue-400 rounded-t" style={{ height: '65%' }}></div>
                      <div className="w-8 bg-blue-500 dark:bg-blue-400 rounded-t" style={{ height: '40%' }}></div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="w-8 text-xs text-gray-600 dark:text-gray-300">6-8</div>
                      <div className="w-8 text-xs text-gray-600 dark:text-gray-300">8-10</div>
                      <div className="w-8 text-xs text-gray-600 dark:text-gray-300">10-12</div>
                      <div className="w-8 text-xs text-gray-600 dark:text-gray-300">12-2</div>
                      <div className="w-8 text-xs text-gray-600 dark:text-gray-300">2-4</div>
                      <div className="w-8 text-xs text-gray-600 dark:text-gray-300">4-6</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Inventory Analysis</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
              <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">Inventory Value Trend</h4>
              <div className="h-48">
                <div className="h-full w-full flex items-end space-x-1">
                  {inventoryTrends.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 dark:bg-blue-400 rounded-t"
                        style={{ 
                          height: `${(item.value / 55000) * 100}%`,
                        }}
                      ></div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{item.month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
              <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">Inventory Status</h4>
              <div className="flex items-center justify-center h-48">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#E5E7EB"
                      strokeWidth="3"
                      className="dark:stroke-gray-600"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      strokeDasharray="85, 100"
                      className="dark:stroke-blue-400"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white">85%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">In stock</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
              <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">Category Distribution</h4>
              <div className="h-48 flex items-center justify-center">
                <div className="space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Antibiotics</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Analgesics</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">24%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Antihypertensives</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Antidiabetics</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">14%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Others</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-white">16%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700/30 p-6 rounded-lg">
            <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-3">Inventory Alerts</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-100 dark:border-red-900/30">
                <span className="text-sm text-red-800 dark:text-red-300">6 medications are below stock threshold</span>
                <button className="text-xs text-red-600 dark:text-red-300 underline">View all</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-md border border-amber-100 dark:border-amber-900/30">
                <span className="text-sm text-amber-800 dark:text-amber-300">8 medications are expiring within 90 days</span>
                <button className="text-xs text-amber-600 dark:text-amber-300 underline">View all</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-md border border-blue-100 dark:border-blue-900/30">
                <span className="text-sm text-blue-800 dark:text-blue-300">3 orders are pending supplier confirmation</span>
                <button className="text-xs text-blue-600 dark:text-blue-300 underline">View all</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'efficiency' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Pharmacy Efficiency</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Average Dispensing Time</h4>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                <div className="h-64">
                  <div className="h-full w-full flex items-end space-x-2">
                    {dispensingTimes.map((item, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-green-500 dark:bg-green-400 rounded-t"
                          style={{ 
                            height: `${(item.avgTime / 12) * 100}%`,
                          }}
                        ></div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{item.day}</div>
                        <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{item.avgTime} min</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Pharmacy Efficiency Metrics</h4>
              <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6">
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Prescription Processing Speed</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">8.2 min avg</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div className="h-2.5 bg-green-500 dark:bg-green-400 rounded-full" style={{ width: '78%' }}></div>
                    </div>                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Target: 10min</span>
                      <span>Excellent: &lt;7min</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer Wait Time</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">12.5 min avg</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div className="h-2.5 bg-amber-500 dark:bg-amber-400 rounded-full" style={{ width: '65%' }}></div>
                    </div>                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Target: 15min</span>
                      <span>Excellent: &lt;10min</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">First-Time Resolution Rate</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">93.8%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div className="h-2.5 bg-green-500 dark:bg-green-400 rounded-full" style={{ width: '93.8%' }}></div>
                    </div>                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Target: 90%</span>
                      <span>Excellent: &gt;95%</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Error Rate</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">0.12%</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                      <div className="h-2.5 bg-green-500 dark:bg-green-400 rounded-full" style={{ width: '3%' }}></div>
                    </div>                    <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>Target: &lt;0.2%</span>
                      <span>Excellent: &lt;0.1%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
            <div className="mt-8">
            <h4 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-4">Staff Performance</h4>
            <AppointmentsTable 
              appointments={[
                {
                  id: 'pharm-001',
                  patientName: 'John Phiri',
                  patientId: '145 prescriptions',
                  date: new Date().toISOString(),
                  purpose: '7.2 min avg',
                  status: 'Excellent',
                  medications: '0.07% error rate'
                },
                {
                  id: 'pharm-002',
                  patientName: 'Mary Banda',
                  patientId: '132 prescriptions',
                  date: new Date().toISOString(),
                  purpose: '8.1 min avg',
                  status: 'Good',
                  medications: '0.15% error rate'
                },
                {
                  id: 'pharm-003',
                  patientName: 'David Mwanza',
                  patientId: '102 prescriptions',
                  date: new Date().toISOString(),
                  purpose: '9.3 min avg',
                  status: 'Needs Improvement',
                  medications: '0.22% error rate'
                }
              ]}
              isForPrescriptions={false}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistAnalyticsContent;

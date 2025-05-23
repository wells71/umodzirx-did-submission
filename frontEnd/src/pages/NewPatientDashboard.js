import React, { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { FiHome, FiFileText, FiBarChart2, FiAlertCircle } from 'react-icons/fi';
import BaseDashboard from '../components/BaseDashboard';
import '../styles/medtrackr.css';

// Lazy load components for better performance
const PatientDashboardContent = lazy(() => import('../components/PatientDashboardContent'));
const PatientPrescriptionsContent = lazy(() => import('../components/PatientPrescriptionsContent'));
const PatientAnalyticsContent = lazy(() => import('../components/PatientAnalyticsContent'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="w-full h-64 flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
    <p className="text-gray-600 dark:text-gray-400">Loading content...</p>
  </div>
);

// Error boundary fallback
const ErrorFallback = () => (
  <div className="w-full p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 text-center">
    <FiAlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Something went wrong</h3>
    <p className="text-red-600 dark:text-red-400 mb-4">We couldn't load this content. Please try refreshing the page.</p>
    <button 
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Refresh Page
    </button>
  </div>
);

const NewPatientDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // Get patient info from localStorage with fallback values
  const patientInfo = useMemo(() => ({
    name: localStorage.getItem('patientName') || 'Patient',
    id: localStorage.getItem('patientId') || 'Unknown ID',
  }), []);

  // Navigation items with memoization to prevent unnecessary re-renders
  const navItems = useMemo(() => [
    { 
      icon: FiHome, 
      label: 'Dashboard', 
      id: 'dashboard',
      onClick: () => setActiveView('dashboard')
    },
    { 
      icon: FiFileText, 
      label: 'Prescriptions', 
      id: 'prescriptions',
      onClick: () => setActiveView('prescriptions')
    },
    {
      icon: FiBarChart2,
      label: 'Analytics',
      id: 'analytics',
      onClick: () => setActiveView('analytics')
    }
  ], []);

  // Simulate loading state for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [activeView]);

  // Render the correct content based on active view with error handling
  const renderContent = () => {
    if (isLoading) {
      return <LoadingFallback />;
    }

    return (
      <Suspense fallback={<LoadingFallback />}>
        {(() => {
          try {
            switch (activeView) {
              case 'dashboard':
                return <PatientDashboardContent patientInfo={patientInfo} />;
              case 'prescriptions':
                return <PatientPrescriptionsContent patientInfo={patientInfo} />;
              case 'analytics':
                return <PatientAnalyticsContent patientInfo={patientInfo} />;
              default:
                return <PatientDashboardContent patientInfo={patientInfo} />;
            }
          } catch (error) {
            console.error("Error rendering content:", error);
            return <ErrorFallback />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <BaseDashboard
      navItems={navItems}
      title="Patient"
      userInfo={patientInfo}
      hideMenu={false}
      initialActiveView={activeView}
    >
      {renderContent()}
    </BaseDashboard>
  );
};

export default React.memo(NewPatientDashboard);

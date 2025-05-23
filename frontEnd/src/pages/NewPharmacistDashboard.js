import React, { useState } from 'react';
import { FiHome, FiCheckSquare, FiPackage, FiBarChart2 } from 'react-icons/fi';
import BaseDashboard from '../components/BaseDashboard';
import PharmacistDashboardContent from '../components/PharmacistDashboardContent';
import PharmacistVerifyContent from '../components/PharmacistVerifyContent';
import PharmacistAnalyticsContent from '../components/PharmacistAnalyticsContent';
import '../styles/medtrackr.css';

const NewPharmacistDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  
  const navItems = [
    { 
      icon: FiHome, 
      label: 'Dashboard', 
      id: 'dashboard',
      onClick: () => setActiveView('dashboard')
    },
    { 
      icon: FiCheckSquare, 
      label: 'Verify Patient', 
      id: 'verify',
      onClick: () => setActiveView('verify')
    },
    {
      icon: FiBarChart2,
      label: 'Analytics',
      id: 'analytics',
      onClick: () => setActiveView('analytics')
    }
  ];

  const pharmacistInfo = {
    name: localStorage.getItem('pharmaName') || 'Pharmacist',
    id: localStorage.getItem('pharmaId'),
  };

  const handleNavigation = (viewId) => {
    setActiveView(viewId);
  };

  // Render the correct content based on active view
  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <PharmacistDashboardContent activeView={activeView} handleNavigation={handleNavigation} />;
      case 'verify':
        return <PharmacistVerifyContent activeView={activeView} handleNavigation={handleNavigation} />;
      case 'analytics':
        return <PharmacistAnalyticsContent activeView={activeView} handleNavigation={handleNavigation} />;
      default:
        return <PharmacistDashboardContent activeView={activeView} handleNavigation={handleNavigation} />;
    }
  };

  return (
    <BaseDashboard
      navItems={navItems}
      title="Pharmacist"
      userInfo={pharmacistInfo}
      hideMenu={false}
      initialActiveView={activeView}
    >
      {renderContent()}
    </BaseDashboard>
  );
};

export default NewPharmacistDashboard;

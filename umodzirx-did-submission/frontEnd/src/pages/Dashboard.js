import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiFileText, 
  FiBarChart2, 
  FiCheckSquare, 
  FiPackage,
  FiSettings,
  FiUserPlus
} from 'react-icons/fi';

import DashboardLayout from '../components/layout/DashboardLayout';
import useAuth from '../hooks/useAuth';
import PrescriptionButton from '../components/dashboard/doctor/PrescriptionButton';

// Dashboard content components
import DoctorContent from '../components/dashboard/doctor/DoctorContent';
import DashboardContent from '../components/dashboard/doctor/DashboardContent';
import AnalyticsContent from '../components/dashboard/doctor/AnalyticsContent';
import PharmacistDashboardContent from '../components/dashboard/pharmacist/PharmacistDashboardContent';
import PharmacistVerifyContent from '../components/dashboard/pharmacist/PharmacistVerifyContent';
import PharmacistInventoryContent from '../components/dashboard/pharmacist/PharmacistInventoryContent';
import PharmacistAnalyticsContent from '../components/dashboard/pharmacist/PharmacistAnalyticsContent';
import PatientDashboardContent from '../components/dashboard/patient/PatientDashboardContent';
import PatientPrescriptionsContent from '../components/dashboard/patient/PatientPrescriptionsContent';
import PatientAnalyticsContent from '../components/dashboard/patient/PatientAnalyticsContent';
import UserManagement from '../components/UserManagement';

/**
 * Unified Dashboard component that adapts based on user role
 */
const Dashboard = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const { getUserInfo } = useAuth();
  const navigate = useNavigate();
  const userInfo = getUserInfo();
  const userRole = userInfo.role;
  const userManagementRef = useRef(null);
  
  // Function to handle adding a new user (for admin)
  const handleAddUser = () => {
    if (userManagementRef.current) {
      userManagementRef.current.showAddUserModal();
    }
  };

  // Handle role changes and redirects
  useEffect(() => {
    // Redirect if no role is found
    if (!userRole) {
      navigate('/login');
      return;
    }
    
    // Get the current path
    const path = window.location.pathname;
    
    // Check for patient data in URL (from eSignet verification)
    const urlParams = new URLSearchParams(window.location.search);
    const encodedPatient = urlParams.get('patient');
    
    if (encodedPatient && userRole === 'doctor') {
      console.log('Found encoded patient data in URL, keeping for PrescriptionButton');
      // We'll let PrescriptionButton handle this data
    }
    
    // Check if the current path matches the user role
    const isCorrectPath = path.startsWith(`/${userRole}`);
    
    // If not on the correct path for the role, redirect to the appropriate dashboard
    if (!isCorrectPath && userRole) {
      console.log(`Redirecting from ${path} to /${userRole} to match role`);
      navigate(`/${userRole}`);
    }
  }, [userRole, navigate]);

  // Define navigation items based on user role
  const getNavItems = () => {
    switch (userRole) {
      case 'doctor':
        return [
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
        ];
      case 'pharmacist':
        return [
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
      case 'patient':
        return [
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
        ];
      case 'admin':
        return [
          { 
            icon: FiHome, 
            label: 'Dashboard', 
            id: 'dashboard',
            onClick: () => setActiveView('dashboard')
          },
          { 
            icon: FiUsers, 
            label: 'Users', 
            id: 'users',
            onClick: () => setActiveView('users')
          },
          { 
            icon: FiUserPlus, 
            label: 'Add User', 
            id: 'add-user',
            onClick: handleAddUser 
          },
          {
            icon: FiBarChart2,
            label: 'Analytics',
            id: 'analytics',
            onClick: () => setActiveView('analytics')
          },
          {
            icon: FiSettings,
            label: 'Settings',
            id: 'settings',
            onClick: () => setActiveView('settings')
          }
        ];
      default:
        return [];
    }
  };

  // Render content based on user role and active view
  const renderContent = () => {
    switch (userRole) {
      case 'doctor':
        switch (activeView) {
          case 'dashboard':
            return <DashboardContent />;
          case 'prescriptions':
            return <DoctorContent activeView="prescriptions" />;
          case 'analytics':
            return <AnalyticsContent />;
          default:
            return <DashboardContent />;
        }
      case 'pharmacist':
        switch (activeView) {
          case 'dashboard':
            return <PharmacistDashboardContent />;
          case 'verify':
            return <PharmacistVerifyContent />;
          case 'inventory':
            return <PharmacistInventoryContent />;
          case 'analytics':
            return <PharmacistAnalyticsContent />;
          default:
            return <PharmacistDashboardContent />;
        }
      case 'patient':
        switch (activeView) {
          case 'dashboard':
            return <PatientDashboardContent />;
          case 'prescriptions':
            return <PatientPrescriptionsContent />;
          case 'analytics':
            return <PatientAnalyticsContent />;
          default:
            return <PatientDashboardContent />;
        }
      case 'admin':
        switch (activeView) {
          case 'dashboard':
            return <UserManagement ref={userManagementRef} />;
          case 'users':
            return <UserManagement ref={userManagementRef} />;
          case 'analytics':
            return <AnalyticsContent />;
          case 'settings':
            return <div>Admin Settings</div>;
          default:
            return <UserManagement ref={userManagementRef} />;
        }
      default:
        return <div>Unknown role</div>;
    }
  };

  // Get the title based on user role
  const getDashboardTitle = () => {
    switch (userRole) {
      case 'doctor':
        return 'Doctor Dashboard';
      case 'pharmacist':
        return 'Pharmacist Dashboard';
      case 'patient':
        return 'Patient Dashboard';
      case 'admin':
        return 'Admin Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <>
      <DashboardLayout
        navItems={getNavItems()}
        title={getDashboardTitle()}
        userInfo={userInfo}
        initialActiveView={activeView}
      >
        {renderContent()}
      </DashboardLayout>
      
      {/* Add the PrescriptionButton component directly for doctor users */}
      {userRole === 'doctor' && <PrescriptionButton activeView={activeView} />}
    </>
  );
};

export default Dashboard;
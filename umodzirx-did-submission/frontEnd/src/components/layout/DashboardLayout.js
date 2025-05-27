import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSettings,
  FiMoreVertical,
  FiMoon,
  FiSun,
  FiMenu,
  FiLogOut,
  FiX
} from 'react-icons/fi';
import useDarkMode from '../../hooks/useDarkMode';
import useAuth from '../../hooks/useAuth';
import DebugRoleInfo from '../DebugRoleInfo';

const DashboardLayout = ({ 
  children, 
  navItems, 
  title, 
  userInfo, 
  hideMenu, 
  initialActiveView = 'dashboard' 
}) => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState(initialActiveView);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, toggleDarkMode] = useDarkMode();
  const { logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowMobileSidebar(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Keep internal activeView in sync with initialActiveView prop
  useEffect(() => {
    if (initialActiveView) {
      setActiveView(initialActiveView);
    }
  }, [initialActiveView]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileMenu && !event.target.closest('.profile-menu-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const handleLogout = () => {
    logout();
  };

  const renderSettingsModal = () => {
    if (!showSettingsModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xs sm:max-w-sm md:max-w-md">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Settings</h3>
            <button
              onClick={() => setShowSettingsModal(false)}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FiX className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
          <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-4 sm:space-y-6">
            {/* Dark/Light Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Change Theme</span>
              <button
                onClick={toggleDarkMode}
                className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {darkMode ? <FiSun className="h-4 w-4 sm:h-5 sm:w-5" /> : <FiMoon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>

            {/* Help Section */}
            <div>
              <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">Help</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                For assistance, please contact the system administrator at <a href="mailto:admin@umodzi.com" className="text-blue-600 dark:text-blue-400 hover:underline">admin@umodzi.com</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-14 sm:h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-2 sm:px-4 md:px-6 z-20">
        <div className="flex items-center">
          {/* Mobile sidebar toggle - always visible on mobile */}
          <button 
            onClick={() => {
              setShowMobileSidebar(!showMobileSidebar);
            }}
            className="md:hidden mr-2 p-1.5 sm:p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Toggle Sidebar"
          >
            {showMobileSidebar ? (
              <FiX className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <FiMenu className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
          
          <div className="text-base sm:text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400">UmodziRx</div>
        </div>
        <div className="flex items-center">
          <div className="relative profile-menu-container">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
                  {userInfo.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <span className="hidden sm:inline text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">
                {userInfo.name}
              </span>
              <FiMoreVertical className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500" />
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-1 sm:mt-2 w-36 sm:w-44 md:w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-30 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {/* Profile Settings Logic */}}
                  className="flex items-center w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiSettings className="mr-2 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4" />
                  Profile Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FiLogOut className="mr-2 sm:mr-3 h-3 w-3 sm:h-4 sm:w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="flex pt-14 sm:pt-16 h-full">
        {/* Mobile sidebar overlay */}
        {showMobileSidebar && (
          <div 
            className="fixed inset-0 bg-black/30 z-20" 
            onClick={() => {
              setShowMobileSidebar(false);
            }}
          ></div>
        )}

        {/* Left Sidebar - responsive version */}
        <div 
          className={`
            fixed left-0 z-30
            ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'} 
            md:translate-x-0 md:static
            w-64 md:w-auto ${isSidebarCollapsed ? 'md:w-14' : 'md:w-64'} 
            top-14 sm:top-16 bottom-0
            bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
            ${isSidebarCollapsed ? 'md:px-1 md:py-4' : 'p-2 sm:p-3 md:p-4'}
            flex flex-col h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] 
            transition-all duration-300 ease-in-out overflow-y-auto
            pb-16 sm:pb-20
          `}
        >
          <div className={`mb-3 sm:mb-4 md:mb-6 flex ${isSidebarCollapsed ? 'md:justify-center' : 'justify-between'} items-center`}>
            {!isSidebarCollapsed && (
              <h1 className="font-bold text-blue-600 dark:text-blue-400 text-sm sm:text-base md:text-lg p-0.5 sm:p-1">
                {title}
              </h1>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1 sm:p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? (
                <FiMenu className="h-4 w-4 sm:h-5 sm:w-5" /> 
              ) : (
                <FiMenu className="h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
              )}
            </button>
          </div>

          <nav className="space-y-1 flex-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  else setActiveView(item.id);
                  if (showMobileSidebar) setShowMobileSidebar(false);
                }}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'justify-start'} 
                ${isSidebarCollapsed ? 'md:px-0 md:py-3' : 'px-2 sm:px-3 py-2'} rounded-lg transition-colors 
                text-gray-700 dark:text-gray-300 
                ${activeView === item.id ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                title={isSidebarCollapsed ? item.label : ''}
              >
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className={`ml-2 sm:ml-3 text-xs sm:text-sm truncate ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setShowSettingsModal(true);
                if (showMobileSidebar) setShowMobileSidebar(false);
              }}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'md:justify-center' : 'justify-start'} 
              ${isSidebarCollapsed ? 'md:px-0 md:py-3' : 'px-2 sm:px-3 py-2'} text-gray-700 dark:text-gray-300 rounded-lg 
              hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
              title={isSidebarCollapsed ? 'Settings' : ''}
            >
              <FiSettings className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className={`ml-2 sm:ml-3 text-xs sm:text-sm ${isSidebarCollapsed ? 'md:hidden' : 'block'}`}>
                Settings
              </span>
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center md:hidden">
              {navItems.find(item => item.id === activeView)?.label || title}
            </h2>
            {children}
          </div>
        </div>
      </div>

      {renderSettingsModal()}
      
      {/* Debug component - only visible in development */}
      {process.env.NODE_ENV !== 'production' && <DebugRoleInfo />}
    </div>
  );
};

export default DashboardLayout;
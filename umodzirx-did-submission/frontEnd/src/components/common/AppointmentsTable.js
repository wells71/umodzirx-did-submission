import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import StatusIndicator from './StatusIndicator';
import { FiChevronLeft, FiChevronRight, FiSearch, FiFilter } from 'react-icons/fi';

const AppointmentsTable = ({ appointments, isForPrescriptions = false, onRowClick, isPatientView = false }) => {
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const appointmentsPerPage = 5;
  
  // Convert appointments data for prescriptions if needed
  const tableData = useMemo(() => {
    if (isForPrescriptions) {
      return appointments.map(item => {
        // Log each item to debug
        console.log('Processing appointment item:', item);
        
        return {
          ...item,
          // Add medications field if not present
          medications: item.medications || item.purpose || 'General prescription',
          // Ensure diagnosis is always present
          diagnosis: item.diagnosis || 'No diagnosis recorded'
        };
      });
    }
    return appointments;
  }, [appointments, isForPrescriptions]);
  
  // Filter logic
  const filteredAppointments = useMemo(() => {
    if (currentFilter === 'all') return tableData;
    return tableData.filter(item => 
      item.status && item.status.toLowerCase() === currentFilter
    );
  }, [tableData, currentFilter]);

  // Rest of the component remains the same...
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * appointmentsPerPage;
    return filteredAppointments.slice(startIndex, startIndex + appointmentsPerPage);
  }, [filteredAppointments, currentPage]);

  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isForPrescriptions ? 'Prescriptions History' : 'Recent Prescriptions'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isForPrescriptions ? 'Complete record of all your medications' : 'View your most recent medication information here'}
            </p>
          </div>
          
          {/* Search and filter controls */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder={isForPrescriptions ? "Search prescriptions..." : "Search appointments..."}
              />
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <FiFilter className="h-4 w-4 mr-1.5" />
              <span>Filter</span>
            </button>
          </div>
        </div>
        
        {/* Filter tabs */}
        <div className="mt-5 flex border-b border-gray-200 dark:border-gray-700">
          {isForPrescriptions ? (
            // Prescription filters - All, Active, Dispensed, Revoked
            ['all', 'active', 'dispensed', 'revoked'].map(filterId => {
              const label = filterId.charAt(0).toUpperCase() + filterId.slice(1);
              const count = filterId === 'all' 
                ? appointments.length 
                : appointments.filter(a => a.status && a.status.toLowerCase() === filterId).length;
              
              return (
                <button
                  key={filterId}
                  onClick={() => {
                    setCurrentFilter(filterId);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2.5 text-sm font-medium relative whitespace-nowrap
                    ${currentFilter === filterId
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}
                  `}
                >
                  <div className="flex items-center">
                    <span>{label}</span>
                    <span className="ml-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full text-xs">
                      {count}
                    </span>
                  </div>
                </button>
              );
            })
          ) : (
            // Appointment filters
            [
              { id: 'all', label: 'All', count: appointments.length },
              { id: 'confirmed', label: 'Confirmed', count: appointments.filter(a => a.status && a.status.toLowerCase() === 'confirmed').length },
              { id: 'unconfirmed', label: 'Unconfirmed', count: appointments.filter(a => a.status && a.status.toLowerCase() === 'unconfirmed').length },
              { id: 'cancelled', label: 'Cancelled', count: appointments.filter(a => a.status && a.status.toLowerCase() === 'cancelled').length }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => {
                  setCurrentFilter(filter.id);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2.5 text-sm font-medium relative whitespace-nowrap
                  ${currentFilter === filter.id 
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}
                `}
              >
                <div className="flex items-center">
                  <span>{filter.label}</span>
                  <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-0.5 rounded-full">{filter.count}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-left">
              {/* Only show Patient column if not in patient view */}
              {(!isPatientView || !isForPrescriptions) && (
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient</th>
              )}
              {isForPrescriptions ? (
                <>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Medications</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purpose</th>
                </>
              )}
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Diagnosis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedAppointments.length > 0 ? (
              paginatedAppointments.map((appointment) => (
                <tr 
                  key={appointment.id} 
                  className="hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                  onClick={() => onRowClick && onRowClick(appointment)}
                >
                  {/* Only show Patient column if not in patient view */}
                  {(!isPatientView || !isForPrescriptions) && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium">
                          {appointment.patientName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{appointment.patientName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{appointment.patientId}</div>
                        </div>
                      </div>
                    </td>
                  )}
                  
                  {isForPrescriptions ? (
                    <>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          {appointment.medications || appointment.purpose || "No medications specified"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{formatDate(appointment.date).split(',')[0]}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(appointment.date).split(',')[1]}</div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 dark:text-gray-300">{formatDate(appointment.date)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{appointment.purpose}</div>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusIndicator status={appointment.status} isPrescription={isForPrescriptions} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {/* Debug the diagnosis field */}
                    {console.log('Appointment diagnosis in table:', appointment.diagnosis)}
                    <div className="bg-gray-50 dark:bg-gray-700/30 p-1.5 rounded-lg">
                      <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                        {appointment.diagnosis || "No diagnosis recorded"}
                      </p>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {isForPrescriptions ? "No prescriptions found" : "No appointments found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            Showing {(currentPage - 1) * appointmentsPerPage + 1} to {Math.min(currentPage * appointmentsPerPage, filteredAppointments.length)} of {filteredAppointments.length} {isForPrescriptions ? 'prescriptions' : 'appointments'}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              aria-label="Previous page"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Page number indicators */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 3) }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              {totalPages > 3 && (
                <>
                  <span className="text-gray-500 dark:text-gray-400">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      currentPage === totalPages
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              aria-label="Next page"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

AppointmentsTable.propTypes = {
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      patientName: PropTypes.string.isRequired,
      patientId: PropTypes.string.isRequired,      
      date: PropTypes.string.isRequired,
      purpose: PropTypes.string,
      status: PropTypes.string.isRequired,
      medications: PropTypes.string,
      diagnosis: PropTypes.string
    })
  ).isRequired,
  isForPrescriptions: PropTypes.bool,
  isPatientView: PropTypes.bool,
  onRowClick: PropTypes.func
};

export default AppointmentsTable;
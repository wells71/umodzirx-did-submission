import React, { useState, useEffect, useMemo } from 'react';
import { FiPackage, FiCheckSquare, FiTrendingUp, FiX, FiPlus } from 'react-icons/fi';
import MetricsCard from '../../common/MetricsCard';
import AppointmentsTable from '../../common/AppointmentsTable';
import axios from 'axios';

const DashboardContent = ({ onCreatePrescription }) => {
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchDoctorPrescriptions();
  }, []);
  
  const fetchDoctorPrescriptions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get doctor ID from localStorage
      const doctorId = localStorage.getItem('doctorId');
      
      if (!doctorId) {
        console.warn('No doctor ID found in localStorage');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/doctor/prescriptions/doctor/${doctorId}`);
      
      console.log('Fetched doctor prescriptions:', response.data);
        if (response.data && response.data.data && response.data.data.prescriptions) {
        // Transform the data to match the expected format for AppointmentsTable
        const formattedPrescriptions = response.data.data.prescriptions.map(prescription => ({
          id: prescription.prescriptionId,
          patientName: prescription.patientName,
          patientId: prescription.patientId,
          date: prescription.issuedDate || prescription.date || new Date().toISOString(),
          medications: prescription.medicationName,
          status: prescription.status || 'Pending',
          dosage: prescription.dosage || 'Not specified',
          instructions: prescription.advice || prescription.instructions || 'No instructions',
          diagnosis: prescription.diagnosis || 'No diagnosis recorded',
          txID: prescription.txID || 'N/A',
          expiryDate: prescription.expiryDate || 'N/A',
          dispensingPharmacist: prescription.dispensingPharmacist || 'N/A',
          dispensingTimestamp: prescription.dispensingTimestamp || 'N/A'
        }));
        
        setPrescriptions(formattedPrescriptions);
      } else {
        setPrescriptions([]);
      }
    } catch (err) {
      console.error('Error fetching doctor prescriptions:', err);
      setError(err.response?.data?.error || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePrescriptionClick = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const closePrescriptionModal = () => {
    setShowPrescriptionModal(false);
    setSelectedPrescription(null);
  };

  // Calculate metrics based on actual prescription data
  const calculateMetrics = useMemo(() => {
    // Use the fetched prescriptions if available, otherwise use the sample data
    const data = prescriptions;
    
    // 1. Calculate top medication
    const medicationCount = {};
    data.forEach(prescription => {
      const meds = prescription.medications.split(',').map(med => med.trim());
      meds.forEach(med => {
        // Extract base medication name without dosage
        const baseMed = med.split(' ')[0];
        medicationCount[baseMed] = (medicationCount[baseMed] || 0) + 1;
      });
    });
    
    // Find the most prescribed medication
    let topMed = { name: 'None', count: 0 };
    Object.entries(medicationCount).forEach(([name, count]) => {
      if (count > topMed.count) {
        topMed = { name, count };
      }
    });
    
    // 2. Calculate active prescriptions
    const activePrescriptions = data.filter(p => 
      p.status === 'Active' || p.status === 'Pending' || p.status === 'Issued'
    ).length;
    
    // 3. Calculate daily prescriptions (issued today)
    const today = new Date().toISOString().split('T')[0];
    const dailyPrescriptions = data.filter(p => {
      const prescriptionDate = new Date(p.date).toISOString().split('T')[0];
      return prescriptionDate === today;
    }).length;
    
    // 4. Determine medication categories (simplified version)
    const categories = {
      'Pain Relief': ['Panado', 'Paracetamol', 'Bufen', 'Ibuprofen', 'Diclofenac', 'Aspirin'],
      'Antibiotics': ['Amoxicillin', 'Penicillin', 'Azithromycin'],
      'Cardiovascular': ['Lisinopril', 'Metoprolol', 'Amlodipine'],
      'Diabetes': ['Metformin', 'Insulin', 'Glibenclamide'],
      'Gastrointestinal': ['Omeprazole', 'Ranitidine', 'Buscopan']
    };
    
    const categoryCount = {};
    data.forEach(prescription => {
      const meds = prescription.medications.split(',').map(med => med.trim());
      meds.forEach(med => {
        // Check which category this medication belongs to
        const baseMed = med.split(' ')[0];
        for (const [category, medications] of Object.entries(categories)) {
          if (medications.some(m => baseMed.toLowerCase().includes(m.toLowerCase()))) {
            categoryCount[category] = (categoryCount[category] || 0) + 1;
            break;
          }
        }
      });
    });
    
    // Find the most prescribed category
    let topCategory = { name: 'Other', count: 0 };
    Object.entries(categoryCount).forEach(([name, count]) => {
      if (count > topCategory.count) {
        topCategory = { name, count };
      }
    });
    
    return {
      topMedication: topMed,
      activePrescriptions,
      dailyPrescriptions,
      topCategory
    };
  }, [prescriptions]);

  // Sample metrics data with medication-centered focus, now using calculated values
  const metrics = [
    {
      id: 'top-medications',
      icon: <FiPackage />,
      title: 'Top Medication',
      value: calculateMetrics.topMedication.name,
      increase: calculateMetrics.topMedication.count.toString(),
      subtitle: `Prescribed ${calculateMetrics.topMedication.count} times`,
      iconColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'daily-prescriptions',
      icon: <FiCheckSquare />,
      title: 'Daily Prescriptions',
      value: calculateMetrics.dailyPrescriptions.toString(),
      increase: Math.round(calculateMetrics.dailyPrescriptions * 0.2).toString(), // Example increase (20% of daily)
      subtitle: 'Issued today',
      iconColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      id: 'active-medications',
      icon: <FiPackage />,
      title: 'Active Prescriptions',
      value: calculateMetrics.activePrescriptions.toString(),
      increase: Math.round(calculateMetrics.activePrescriptions * 0.1).toString(), // Example increase (10% of active)
      subtitle: 'In circulation now',
      iconColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'medication-summary',
      icon: <FiTrendingUp />,
      title: 'Medication Summary',
      value: calculateMetrics.topCategory.name,
      increase: calculateMetrics.topCategory.count.toString(),
      subtitle: 'Most prescribed category',
      iconColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    }
  ];  
  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
      {/* Header Section */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Doctor Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's your practice overview</p>
      </div>
      
      {/* Metrics Cards - Now using dynamic data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{metrics.map((metric) => (
          <MetricsCard 
            key={metric.id}
            icon={metric.icon}
            title={metric.title}
            value={metric.value}
            increase={metric.increase}
            subtitle={metric.subtitle}
            iconColor={metric.iconColor}
            bgColor={metric.bgColor}
          />
        ))}      
        </div>
        {/* Recent Prescriptions*/}      
      <div>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading prescriptions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>Error loading prescriptions: {error}</p>
            <button 
              onClick={fetchDoctorPrescriptions}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        ) : (
          <AppointmentsTable 
            appointments={prescriptions} 
            isForPrescriptions={true}
            onRowClick={handlePrescriptionClick}
          />
        )}
      </div>
        {/* Floating Add Button */}
      <button
        onClick={onCreatePrescription}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-10"
      >
        <FiPlus className="h-6 w-6" />
      </button>
      
      {/* Prescription Detail Modal */}
      {showPrescriptionModal && selectedPrescription && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closePrescriptionModal}
          ></div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl z-10 overflow-hidden transform transition-all">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 px-3 py-2 sm:px-4 sm:py-3">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-base sm:text-lg text-white flex items-center">
                  <svg className="w-4 h-4 mr-1 sm:w-5 sm:h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Prescription Details
                </h3>
                <button 
                  onClick={closePrescriptionModal}
                  className="text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1"
                >
                  <FiX className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-4 max-h-[80vh] sm:max-h-[70vh] overflow-y-auto">
              {/* Patient and Status in a more compact layout */}
              <div className="flex flex-wrap justify-between items-start mb-3 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-start space-x-2 mb-2 sm:mb-0">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Patient</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedPrescription.patientName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ID: {selectedPrescription.patientId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</p>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedPrescription.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    selectedPrescription.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    selectedPrescription.status === 'Revoked' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                    selectedPrescription.status === 'Dispensed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  }`}>
                    <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      {selectedPrescription.status === 'Completed' || selectedPrescription.status === 'Dispensed' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      ) : selectedPrescription.status === 'Pending' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      )}
                    </svg>
                    {selectedPrescription.status}
                  </span>
                </div>
              </div>

              {/* Prescription ID and Dates - more responsive grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 bg-gray-50 dark:bg-gray-700/30 p-2 rounded-lg text-xs sm:text-sm">
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</p>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{selectedPrescription.id}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Issue Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedPrescription.date).toLocaleDateString()}
                  </p>
                </div>
                {selectedPrescription.expiryDate && selectedPrescription.expiryDate !== 'N/A' && (
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expiry</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(selectedPrescription.expiryDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Medical Information in a responsive grid layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Diagnosis section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center mb-1">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-full mr-1.5">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Diagnosis</h4>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-1.5 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{selectedPrescription.diagnosis || "No diagnosis provided"}</p>
                  </div>
                </div>
                
                {/* Medications section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center mb-1">
                    <div className="bg-green-100 dark:bg-green-900/30 p-1 rounded-full mr-1.5">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                      </svg>
                    </div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Medications</h4>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-1.5 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{selectedPrescription.medications}</p>
                  </div>
                </div>

                {/* Dosage section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center mb-1">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full mr-1.5">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Dosage</h4>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-1.5 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{selectedPrescription.dosage || "Not specified"}</p>
                  </div>
                </div>
                
                {/* Instructions section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center mb-1">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-1 rounded-full mr-1.5">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Instructions</h4>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-1.5 rounded-lg">
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 line-clamp-2">{selectedPrescription.instructions || "No instructions provided"}</p>
                  </div>
                </div>
              </div>
              
              {/* Dispensing Information - only show if available */}
              {selectedPrescription.dispensingPharmacist && selectedPrescription.dispensingPharmacist !== 'N/A' && (
                <div className="mt-3 bg-white dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center mb-1">
                    <div className="bg-teal-100 dark:bg-teal-900/30 p-1 rounded-full mr-1.5">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">Dispensing Info</h4>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-1.5 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Pharmacist</p>
                        <p className="text-gray-800 dark:text-gray-200">{selectedPrescription.dispensingPharmacist}</p>
                      </div>
                      {selectedPrescription.dispensingTimestamp && selectedPrescription.dispensingTimestamp !== 'N/A' && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Dispensed</p>
                          <p className="text-gray-800 dark:text-gray-200">{new Date(selectedPrescription.dispensingTimestamp).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardContent;

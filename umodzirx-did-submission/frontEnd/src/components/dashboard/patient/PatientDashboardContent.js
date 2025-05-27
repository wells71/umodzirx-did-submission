import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FiPackage, FiCheckSquare, FiTrendingUp, FiX, FiInfo, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import axios from 'axios';
import MetricsCard from '../../common/MetricsCard';
import AppointmentsTable from '../../common/AppointmentsTable';

// Skeleton loader for metrics cards
const MetricsCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 animate-pulse">
    <div className="flex items-center mb-3">
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
      <div className="ml-3 h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
  </div>
);

// Prescription modal component extracted for better organization
const PrescriptionModal = ({ prescription, onClose }) => {
  if (!prescription) return null;
  
  // Debug the prescription object in the modal
  console.log('Prescription in modal:', prescription);
  console.log('Diagnosis in modal:', prescription.diagnosis);
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full z-10 overflow-hidden transform transition-all"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 id="modal-headline" className="font-semibold text-lg text-gray-900 dark:text-white">Prescription Details</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Close"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Medication</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{prescription.medications}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  prescription.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                  prescription.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  prescription.status === 'Revoked' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : 
                  prescription.status === 'Active' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {prescription.status === 'Completed' ? 'Dispensed' : prescription.status}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-between mt-4">
              <div className="mb-2 mr-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Prescribed By</p>
                <p className="text-sm text-gray-900 dark:text-white">{prescription.doctorName}</p>
              </div>
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Prescribed On</p>
                <p className="text-sm text-gray-900 dark:text-white">
                  {new Date(prescription.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Diagnosis</p>
              <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-md">
                <p className="text-base text-gray-800 dark:text-gray-200">{prescription.diagnosis || "No diagnosis recorded"}</p>
              </div>
            </div>
            {prescription.dosage && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dosage</p>
                <p className="text-sm text-gray-900 dark:text-white">{prescription.dosage}</p>
              </div>
            )}
            {prescription.instructions && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructions</p>
                <p className="text-sm text-gray-900 dark:text-white">{prescription.instructions}</p>
              </div>
            )}    
            {prescription.expiryDate && (
              <div className="mt-4 flex items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Expires On</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(prescription.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}        
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientDashboardContent = ({ patientInfo }) => {
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for storing prescriptions fetched from the blockchain
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true);
  const [prescriptionsError, setPrescriptionsError] = useState(null);
  
  // Use patientInfo prop if available, otherwise fallback to localStorage
  const patientId = patientInfo?.id || localStorage.getItem('patientId') || 'PID-001';
  const patientName = patientInfo?.name || localStorage.getItem('patientName') || 'John Banda';
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handlePrescriptionClick = useCallback((prescription) => {
    // Debug the prescription object before setting it
    console.log('Clicked prescription:', prescription);
    console.log('Diagnosis in clicked prescription:', prescription.diagnosis);
    
    // Ensure diagnosis is present
    const prescriptionWithDiagnosis = {
      ...prescription,
      diagnosis: prescription.diagnosis || 'No diagnosis recorded'
    };
    
    setSelectedPrescription(prescriptionWithDiagnosis);
    setShowPrescriptionModal(true);
  }, []);

  const closePrescriptionModal = useCallback(() => {
    setShowPrescriptionModal(false);
    setSelectedPrescription(null);
  }, []);

  // Calculate metrics based on real prescription data
  const metrics = useMemo(() => {
    // Default metrics with zero values
    const defaultMetrics = [
      {
        id: 'active-prescriptions',
        icon: <FiPackage />,
        title: 'Active Prescriptions',
        value: '0',
        increase: '0',
        subtitle: 'Currently valid medications',
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
      },
      {
        id: 'completed-prescriptions',
        icon: <FiCheckSquare />,
        title: 'Completed Medications',
        value: '0',
        increase: '0',
        subtitle: 'Total completed',
        iconColor: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      },
      {
        id: 'upcoming-refills',
        icon: <FiPackage />,
        title: 'Upcoming Refills',
        value: '0',
        increase: '0',
        subtitle: 'Due in next 7 days',
        iconColor: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-50 dark:bg-amber-900/20'
      },
      {
        id: 'total-prescriptions',
        icon: <FiTrendingUp />,
        title: 'Total Prescriptions',
        value: '0',
        increase: '0',
        subtitle: 'All time',
        iconColor: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20'
      }
    ];
    
    // If prescriptions are still loading or there's an error, return default metrics
    if (prescriptionsLoading || prescriptionsError || !prescriptions.length) {
      return defaultMetrics;
    }
    
    // Calculate actual metrics from prescription data
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    
    const activePrescriptions = prescriptions.filter(p => p.status === 'Active').length;
    const completedPrescriptions = prescriptions.filter(p => p.status === 'Completed').length;
    
    // Calculate upcoming refills (prescriptions that expire within the next 7 days)
    const upcomingRefills = prescriptions.filter(p => {
      if (!p.expiryDate || p.status !== 'Active') return false;
      const expiryDate = new Date(p.expiryDate);
      return expiryDate > now && expiryDate <= oneWeekFromNow;
    }).length;
    
    // Update metrics with real values
    return [
      {
        ...defaultMetrics[0],
        value: activePrescriptions.toString(),
        increase: '0', // We don't have historical data to calculate increase
      },
      {
        ...defaultMetrics[1],
        value: completedPrescriptions.toString(),
        increase: '0',
      },
      {
        ...defaultMetrics[2],
        value: upcomingRefills.toString(),
        increase: '0',
      },
      {
        ...defaultMetrics[3],
        value: prescriptions.length.toString(),
        increase: '0',
      }
    ];
  }, [prescriptions, prescriptionsLoading, prescriptionsError]);
  // Fetch prescriptions from the blockchain API
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setPrescriptionsLoading(true);
        setPrescriptionsError(null);        // Use axios to fetch prescription history
        console.log('Fetching prescriptions for patient ID:', patientId);
        
        // Debug the URL being used
        const url = `http://localhost:5000/patient/prescriptions?patientId=${patientId}`;
        console.log('Fetching from URL:', url);
        
        const response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        console.log('API response:', response.data);
        
        // Check if the request was successful
        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch prescriptions');
        }
        
        // Store the result data
        const result = response.data;
        
        // Check if we have data in the expected format
        const hasPatientHistoryFormat = result.data && result.data.history && Array.isArray(result.data.history);
        const hasDoctorFormat = result.data && result.data.prescriptions && Array.isArray(result.data.prescriptions);
        
        // Special case: empty prescriptions array is valid
        if (hasDoctorFormat && result.data.prescriptions.length === 0) {
          setPrescriptions([]);
          setPrescriptionsLoading(false);
          return;
        }
        
        if (!hasPatientHistoryFormat && !hasDoctorFormat) {
          setPrescriptions([]);
          return;
        }
          // Transform the data to match the expected format for the table
        let formattedPrescriptions = [];
        
        try {
          // Handle patient history endpoint format
          if (result.data && result.data.history && Array.isArray(result.data.history)) {
            // Check if the history items have prescriptions directly (without Value property)
            const hasDirectPrescriptions = result.data.history.some(item => 
              item.prescriptions && Array.isArray(item.prescriptions)
            );
            
            if (hasDirectPrescriptions) {
              formattedPrescriptions = result.data.history
                .filter(item => item.prescriptions && Array.isArray(item.prescriptions))
                .flatMap(item => {
                  return item.prescriptions.map(prescription => {
                    return {
                      id: prescription.prescriptionId,
                      patientName: item.patientName || result.data.patientName,
                      patientId: result.data.patientId,
                      date: prescription.timestamp,
                      medications: prescription.medicationName,
                      status: prescription.status,
                      dosage: prescription.dosage,
                      instructions: prescription.instructions,
                      diagnosis: prescription.diagnosis || 'No diagnosis recorded',
                      txID: item.txId,
                      expiryDate: prescription.expiryDate,
                      dispensingPharmacist: prescription.dispensingPharmacist,
                      dispensingTimestamp: prescription.dispensingTimestamp,
                      doctorName: prescription.createdBy
                    };
                  });
                });
              
              // If we've processed prescriptions in the direct format, set them and return
              if (formattedPrescriptions.length > 0) {
                console.log("Processed prescriptions from direct history format:", formattedPrescriptions.length);
                setPrescriptions(formattedPrescriptions);
                setPrescriptionsLoading(false);
                return;
              }
            }
            
            // If direct format didn't work, try the old format with Value property
            const hasExpectedFormat = result.data.history.some(item => 
              item.Value && (item.Value.prescriptions || item.Value.Prescriptions)
            );
            
            if (hasExpectedFormat) {
              formattedPrescriptions = result.data.history
                .filter(item => item.Value && (item.Value.prescriptions || item.Value.Prescriptions))
                .flatMap(item => {
                  // Handle different case variations in the API response
                  const prescriptions = item.Value.prescriptions || item.Value.Prescriptions || [];
                  const patientName = item.Value.patientName || item.Value.PatientName || 'Unknown';
                  
                  return prescriptions.map(prescription => {
                    // Handle different case variations in prescription fields
                    const prescriptionId = prescription.prescriptionId || prescription.PrescriptionId;
                    const timestamp = prescription.timestamp || prescription.Timestamp;
                    const medicationName = prescription.medicationName || prescription.MedicationName;
                    const status = prescription.status || prescription.Status;
                    const dosage = prescription.dosage || prescription.Dosage;
                    const instructions = prescription.instructions || prescription.Instructions;
                    const diagnosis = prescription.diagnosis || prescription.Diagnosis || 'No diagnosis recorded';
                    const txId = prescription.txId || prescription.TxId;
                    const expiryDate = prescription.expiryDate || prescription.ExpiryDate;
                    const dispensingPharmacist = prescription.dispensingPharmacist || prescription.DispensingPharmacist;
                    const dispensingTimestamp = prescription.dispensingTimestamp || prescription.DispensingTimestamp;
                    const createdBy = prescription.createdBy || prescription.CreatedBy;
                    
                    return {
                      id: prescriptionId,
                      patientName: patientName,
                      patientId: result.data.patientId,
                      date: timestamp,
                      medications: medicationName,
                      status: status,
                      dosage: dosage,
                      instructions: instructions,
                      diagnosis: diagnosis,
                      txID: txId,
                      expiryDate: expiryDate,
                      dispensingPharmacist: dispensingPharmacist,
                      dispensingTimestamp: dispensingTimestamp,
                      doctorName: createdBy
                    };
                  });
                });
            }
          } 
          
          // Handle doctor endpoint format as fallback
          if (formattedPrescriptions.length === 0 && result.data && result.data.prescriptions) {
            formattedPrescriptions = result.data.prescriptions.map(prescription => {
              // Handle different case variations in prescription fields
              const prescriptionId = prescription.prescriptionId || prescription.PrescriptionId;
              const timestamp = prescription.timestamp || prescription.Timestamp;
              const medicationName = prescription.medicationName || prescription.MedicationName;
              const status = prescription.status || prescription.Status;
              const dosage = prescription.dosage || prescription.Dosage;
              const instructions = prescription.instructions || prescription.Instructions;
              const diagnosis = prescription.diagnosis || prescription.Diagnosis || 'No diagnosis recorded';
              const txId = prescription.txId || prescription.TxId;
              const expiryDate = prescription.expiryDate || prescription.ExpiryDate;
              const dispensingPharmacist = prescription.dispensingPharmacist || prescription.DispensingPharmacist;
              const dispensingTimestamp = prescription.dispensingTimestamp || prescription.DispensingTimestamp;
              const createdBy = prescription.createdBy || prescription.CreatedBy;
              
              return {
                id: prescriptionId,
                patientName: result.data.patientName,
                patientId: result.data.patientId,
                date: timestamp,
                medications: medicationName,
                status: status,
                dosage: dosage,
                instructions: instructions,
                diagnosis: diagnosis,
                txID: txId,
                expiryDate: expiryDate,
                dispensingPharmacist: dispensingPharmacist,
                dispensingTimestamp: dispensingTimestamp,
                doctorName: createdBy
              };
            });
          }
        } catch (formatError) {
          // Silently handle formatting errors
          console.error('Error formatting prescription data:', formatError);
        }
        
        setPrescriptions(formattedPrescriptions);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        setPrescriptionsError(
          error.response?.data?.error || error.message || 'Failed to fetch prescriptions'
        );
        // Set empty array to avoid undefined errors
        setPrescriptions([]);
      } finally {
        setPrescriptionsLoading(false);
      }
        // Log metrics calculation based on prescriptions
      console.log('Calculating metrics based on prescriptions:', prescriptions.length);
    };
    
    // Only fetch if we have a patientId
    if (patientId) {
      fetchPrescriptions();
    } else {
      console.warn('No patient ID found, cannot fetch prescriptions');
    }
  }, [patientId]); // Added warning when patientId is missing

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
      {/* Header Section */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Patient Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's an overview of your medical information</p>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Show skeleton loaders while loading
          Array(4).fill(0).map((_, index) => (
            <MetricsCardSkeleton key={index} />
          ))
        ) : (
          // Show actual metrics when loaded
          metrics.map((metric) => (
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
          ))
        )}
      </div>
      
      {/* Recent Prescriptions Table */}
      <div>
        {isLoading || prescriptionsLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
            <div className="space-y-3">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : prescriptionsError ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center text-red-500 mb-4">
              <FiAlertCircle className="h-5 w-5 mr-2" />
              <h3 className="font-medium">Error Loading Prescriptions</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{prescriptionsError}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Retry
            </button>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center text-gray-500 mb-4">
              <FiInfo className="h-5 w-5 mr-2" />
              <h3 className="font-medium">No Prescriptions Found</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">There are no prescriptions available for this patient.</p>
          </div>
        ) : (
          <AppointmentsTable 
            appointments={prescriptions} 
            isForPrescriptions={true}
            isPatientView={true}
            onRowClick={handlePrescriptionClick}
          />
        )}
      </div>
      
      {/* Prescription Detail Modal - Extracted to a separate component */}
      {showPrescriptionModal && selectedPrescription && (
        <PrescriptionModal 
          prescription={selectedPrescription} 
          onClose={closePrescriptionModal} 
        />
      )}
    </div>
  );
};

export default React.memo(PatientDashboardContent);

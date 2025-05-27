import React, { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiFilter, FiX, FiDownload, FiCalendar, FiAlertCircle, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import AppointmentsTable from '../../common/AppointmentsTable';
import PrescriptionQRCode from '../../common/PrescriptionQRCode';

// Prescription modal component 
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

const PatientPrescriptionsContent = ({ patientInfo = {} }) => {
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true);
  const [prescriptionsError, setPrescriptionsError] = useState(null);
  
  // Use patientInfo prop if available, otherwise fallback to localStorage
  const patientId = patientInfo?.id || localStorage.getItem('patientId') || 'PID-001';
  const patientName = patientInfo?.name || localStorage.getItem('patientName') || 'John Banda';
  
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
  
  // Fetch prescriptions from the blockchain API
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setPrescriptionsLoading(true);
        setPrescriptionsError(null);
        
        // Debug the URL being used - using the same endpoint as dashboard
        const url = `http://localhost:5000/patient/prescriptions?patientId=${patientId}`;
        console.log('Fetching from URL:', url);
        
        const response = await axios.get(url, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
        
        console.log('API response:', JSON.stringify(response.data, null, 2));
        
        // Check if the response contains diagnosis fields
        if (response.data.data && response.data.data.history) {
          const hasDiagnosisInResponse = response.data.data.history.some(item => {
            if (item.prescriptions && Array.isArray(item.prescriptions)) {
              return item.prescriptions.some(p => p.diagnosis);
            }
            if (item.Value && item.Value.prescriptions) {
              return item.Value.prescriptions.some(p => p.diagnosis || p.Diagnosis);
            }
            return false;
          });
          console.log('Has diagnosis in API response:', hasDiagnosisInResponse);
        }
        
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
                    // Debug the diagnosis field
                    console.log('Prescription diagnosis:', prescription.diagnosis);
                    
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
                    const instructions = prescription.instructions || prescription.Instruction;
                    const diagnosis = prescription.diagnosis || prescription.Diagnosis || 'No diagnosis recorded';
                    const txId = prescription.txId || prescription.TxId;
                    const expiryDate = prescription.expiryDate || prescription.ExpiryDate;
                    const dispensingPharmacist = prescription.dispensingPharmacist || prescription.DispensingPharmacist;
                    const dispensingTimestamp = prescription.dispensingTimestamp || prescription.DispensingTimestamp;
                    const createdBy = prescription.createdBy || prescription.CreatedBy;
                    
                    // Debug the diagnosis field
                    console.log('Prescription diagnosis (Value format):', diagnosis);
                    
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
              
              // Debug the diagnosis field
              console.log('Prescription diagnosis (doctor format):', diagnosis);
              
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
          console.error('Error formatting prescription data:', formatError);
        }
        
        // Debug the formatted prescriptions
        console.log('Formatted prescriptions:', formattedPrescriptions);
        
        // Check if diagnosis is present in the formatted prescriptions
        const hasDiagnosis = formattedPrescriptions.some(p => p.diagnosis);
        console.log('Has diagnosis:', hasDiagnosis);
        
        setPrescriptions(formattedPrescriptions);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        setPrescriptionsError(
          error.response?.data?.error || error.message || 'Failed to fetch prescriptions'
        );
        setPrescriptions([]);
      } finally {
        setPrescriptionsLoading(false);
      }
    };
    
    // Only fetch if we have a patientId
    if (patientId) {
      fetchPrescriptions();
    } else {
      console.warn('No patient ID found, cannot fetch prescriptions');
    }
  }, [patientId]);

  // No filtering logic needed to match dashboard implementation

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
      {/* Header Section */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Prescriptions History</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage all your prescription records</p>
      </div>
      
      {/* Prescriptions Table */}
      <div>
        {prescriptionsLoading ? (
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
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              There are no prescriptions available for this patient.
            </p>
          </div>
        ) : (
          <>
            {/* Debug the prescriptions data */}
            <div style={{ display: 'none' }}>
              {prescriptions.map((p, i) => (
                <div key={i}>
                  <p>Prescription {i}: {p.medications}</p>
                  <p>Diagnosis: {p.diagnosis || 'No diagnosis'}</p>
                </div>
              ))}
            </div>
            
            <AppointmentsTable 
              appointments={prescriptions} 
              isForPrescriptions={true}
              isPatientView={true}
              onRowClick={handlePrescriptionClick}
            />
          </>
        )}
      </div>
      
      {/* Prescription Detail Modal - Using the extracted component */}
      {showPrescriptionModal && selectedPrescription && (
        <PrescriptionModal 
          prescription={selectedPrescription} 
          onClose={closePrescriptionModal} 
        />
      )}
    </div>
  );
};

export default PatientPrescriptionsContent;
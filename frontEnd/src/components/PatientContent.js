import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiInfo, FiAlertCircle } from 'react-icons/fi';
import PrescriptionQRCode from './PrescriptionQRCode';
import AppointmentsTable from './AppointmentsTable';

const PatientContent = ({ activeView }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  const fetchPrescriptions = async () => {const fetchPrescriptions = async () => {
    setLoading(true);
    setError('');
    try {
      const patientId = localStorage.getItem('patientId');
      if (!patientId) {
        setError('No patient ID found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const url = `http://localhost:5000/patient/prescriptions/history/${patientId}`;
      console.log('Fetching from URL:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      console.log('API response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch prescriptions');
      }
      
      const result = response.data;
      let formattedPrescriptions = [];
      
      // Use the transformation logic from PatientDashboardContent
      const hasPatientHistoryFormat = result.data && result.data.history && Array.isArray(result.data.history);
      const hasDoctorFormat = result.data && result.data.prescriptions && Array.isArray(result.data.prescriptions);
      
      if (hasPatientHistoryFormat) {
        formattedPrescriptions = result.data.history
          .filter(item => item.Value && (item.Value.prescriptions || item.Value.Prescriptions))
          .flatMap(item => {
            const prescriptions = item.Value.prescriptions || item.Value.Prescriptions || [];
            const patientName = item.Value.patientName || item.Value.PatientName || 'Unknown';
            
            return prescriptions.map(prescription => ({
              id: prescription.prescriptionId || prescription.PrescriptionId,
              patientName: patientName,
              patientId: result.data.patientId,
              date: prescription.timestamp || prescription.Timestamp,
              medications: prescription.medicationName || prescription.MedicationName,
              status: prescription.status || prescription.Status,
              dosage: prescription.dosage || prescription.Dosage,
              instructions: prescription.instructions || prescription.Instructions,
              txID: prescription.txId || prescription.TxId,
              expiryDate: prescription.expiryDate || prescription.ExpiryDate,
              dispensingPharmacist: prescription.dispensingPharmacist || prescription.DispensingPharmacist,
              dispensingTimestamp: prescription.dispensingTimestamp || prescription.DispensingTimestamp,
              doctorName: prescription.createdBy || prescription.CreatedBy
            }));
          });
      } else if (hasDoctorFormat) {
        formattedPrescriptions = result.data.prescriptions.map(prescription => ({
          id: prescription.prescriptionId || prescription.PrescriptionId,
          patientName: result.data.patientName,
          patientId: result.data.patientId,
          date: prescription.timestamp || prescription.Timestamp,
          medications: prescription.medicationName || prescription.MedicationName,
          status: prescription.status || prescription.Status,
          dosage: prescription.dosage || prescription.Dosage,
          instructions: prescription.instructions || prescription.Instructions,
          txID: prescription.txId || prescription.TxId,
          expiryDate: prescription.expiryDate || prescription.ExpiryDate,
          dispensingPharmacist: prescription.dispensingPharmacist || prescription.DispensingPharmacist,
          dispensingTimestamp: prescription.dispensingTimestamp || prescription.DispensingTimestamp,
          doctorName: prescription.createdBy || prescription.CreatedBy
        }));
      }
      
      setPrescriptions(formattedPrescriptions);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch prescriptions');
      setPrescriptions([]);
    } finally {
      setLoading(false);
    }
  }};

  useEffect(() => {
    if (activeView === 'prescriptions') {
      fetchPrescriptions();
    }
  }, [activeView]);

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const renderPrescriptions = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">Prescription History</h2>
        <button 
          onClick={fetchPrescriptions}
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm sm:text-base"
        >
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="space-y-3">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center text-red-500 mb-4">
            <FiAlertCircle className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Error Loading Prescriptions</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{error}</p>
          <button 
            onClick={fetchPrescriptions}
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
          onRowClick={handleViewPrescription}
        />
      )}
    </div>
  );

  const renderPrescriptionModal = () => {
    if (!selectedPrescription || !showPrescriptionModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-xs sm:max-w-md max-h-[90vh] flex flex-col">
          <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">Prescription Details</h3>
            <button 
              onClick={() => setShowPrescriptionModal(false)}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FiX className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          
          <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 overflow-y-auto flex-grow">
            <dl className="grid grid-cols-1 gap-y-2 sm:gap-y-3 md:gap-y-4">
              <div>
                <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Medication</dt>
                <dd className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-900 dark:text-gray-100">{selectedPrescription.medicationName}</dd>
              </div>
              
              <div>
                <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Dosage</dt>
                <dd className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-900 dark:text-gray-100">{selectedPrescription.dosage}</dd>
              </div>
              
              <div>
                <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Instructions</dt>
                <dd className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-900 dark:text-gray-100 break-words">{selectedPrescription.instructions || 'No specific instructions'}</dd>
              </div>
              
              <div>
                <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Date Prescribed</dt>
                <dd className="mt-0.5 sm:mt-1 text-sm sm:text-base text-gray-900 dark:text-gray-100">
                  {new Date(selectedPrescription.timestamp).toLocaleDateString()}
                </dd>
              </div>
              
              <div>
                <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-0.5 sm:mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                    selectedPrescription.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    selectedPrescription.status === 'Dispensed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                    selectedPrescription.status === 'Revoked' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {selectedPrescription.status}
                  </span>
                </dd>
              </div>
              
              {selectedPrescription.dispensingNotes && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pharmacist Notes</dt>
                  <dd className="mt-1 text-base text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-md break-words">
                    {selectedPrescription.dispensingNotes}
                  </dd>
                </div>
              )}
              
              {selectedPrescription.expiryDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expires On</dt>
                  <dd className="mt-1 text-base text-gray-900 dark:text-gray-100">
                    {new Date(selectedPrescription.expiryDate).toLocaleDateString()}
                  </dd>
                </div>
              )}
            </dl>
            
            {/* QR Code Section */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <h4 className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prescription QR Code</h4>
              <PrescriptionQRCode prescription={selectedPrescription} />
            </div>
          </div>
          
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={() => setShowPrescriptionModal(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderMedicalRecords = () => (
    <div className="text-center py-8 px-4">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Medical Records</h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          We're currently building this feature to provide you with access to your complete medical history.
        </p>
        <p className="mt-3 text-sm text-blue-600 dark:text-blue-400">
          Coming soon...
        </p>
      </div>
    </div>
  );

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}
      
      {activeView === 'prescriptions' && renderPrescriptions()}
      {activeView === 'records' && renderMedicalRecords()}
      {renderPrescriptionModal()}
    </div>
  );
};

export default PatientContent;

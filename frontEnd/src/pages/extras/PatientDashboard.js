import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PrescriptionQRCode from '../components/PrescriptionQRCode';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [patientInfo, setPatientInfo] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  const fetchData = async () => {
    const patientId = localStorage.getItem('patientId') || localStorage.getItem('pharmaId');
    if (!patientId) {
      setError('No patient or pharmacist ID found. Please login again.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/patient/prescriptions`, {
        params: { patientId },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setPrescriptions(response.data.data.prescriptions || []);
      setPatientInfo({
        patientId: response.data.data.patientId || localStorage.getItem('pharmaId') || localStorage.getItem('patientId'),
        patientName: response.data.data.patientName || localStorage.getItem('pharmaName') || localStorage.getItem('patientName')
      });
      setSuccessMessage('Data loaded successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch prescriptions');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Add print-specific styles
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .prescription-modal-content, .prescription-modal-content * {
          visibility: visible;
        }
        .prescription-modal-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white;
          padding: 20px;
        }
        .no-print {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const openPrescriptionModal = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };
  
  // Removed original downloadQRCode function since we're now using the PrescriptionQRCode component

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-12">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-900">No prescriptions found</h3>
      <p className="mt-1 text-gray-500">You don't have any prescriptions yet.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
        {/* Patient Name - Top Right Corner */}
        <div className="absolute top-6 right-6">
          <div className="text-blue-800 font-medium">
            {patientInfo?.patientName || 'Patient'}
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
              <p>{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}

          {/* Patient Info Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6"></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-600">Patient ID</p>
                <p className="text-xl font-semibold text-gray-800 mt-2">{patientInfo?.patientId || 'N/A'}</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-600">Full Name</p>
                <p className="text-xl font-semibold text-gray-800 mt-2">{patientInfo?.patientName || 'N/A'}</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                <p className="text-sm font-medium text-blue-600">Prescription Count</p>
                <p className="text-xl font-semibold text-gray-800 mt-2">{prescriptions.length}</p>
              </div>
            </div>
          </div>

          {/* Prescriptions Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Prescription History</h3>
              <button
                onClick={fetchData}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : prescriptions.length > 0 ? (
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prescribed On</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {prescriptions.map((prescription, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-blue-600">{prescription.medicationName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{prescription.dosage}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(prescription.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Dr. {prescription.doctorId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2 justify-end">
                            <button
                              onClick={() => openPrescriptionModal(prescription)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="View Details"
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>

      {/* Prescription Detail Modal */}
      {showPrescriptionModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 prescription-modal-content">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900">Prescription Details</h3>
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-6">
                  <div className="space-y-4 flex-grow">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Medication</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedPrescription.medicationName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Dosage</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedPrescription.dosage}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Instructions</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedPrescription.instructions}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Prescribed On</p>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedPrescription.timestamp).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Prescribed By</p>
                      <p className="mt-1 text-sm text-gray-900">Dr. {selectedPrescription.doctorId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Additional Notes</p>
                      <p className="mt-1 text-sm text-gray-900">{selectedPrescription.notes || 'No additional notes'}</p>
                    </div>
                  </div>
                  
                  <PrescriptionQRCode prescription={{
                    ...selectedPrescription,
                    patientId: patientInfo?.patientId,
                    patientName: patientInfo?.patientName
                  }} />
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => {window.print()}}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 no-print"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 no-print"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;

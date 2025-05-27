import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiX, 
  FiChevronDown, 
  FiChevronUp, 
  FiTrash2, 
  FiCheckSquare,
  FiHome,
  FiPackage,
  FiList
} from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {useNavigate} from 'react-router-dom';

const PharmacistVerifyContent = ({ activeView, handleNavigation }) => {
  const [verifiedPatient, setVerifiedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [retrievedPatient, setRetrievedPatient] = useState(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState(null);
  const [expandedPrescriptionId, setExpandedPrescriptionId] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showPrescriptionDropdown, setShowPrescriptionDropdown] = useState(false);
  const [showAddPrescriptionModal, setShowAddPrescriptionModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [newPrescriptions, setNewPrescriptions] = useState([{ drugName: '', dosage: '', advice: '' }]);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState([]);
  const [dispenseStatus, setDispenseStatus] = useState({});
  const [dispensingNotes, setDispensingNotes] = useState({});
  const [showDrugClassModal, setShowDrugClassModal] = useState(false);
  const [selectedDrugClass, setSelectedDrugClass] = useState(null);
  const [selectedDrug, setSelectedDrug] = useState(null);
  const [selectedDrugsForDispense, setSelectedDrugsForDispense] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [currentDrugClass, setCurrentDrugClass] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [currentDispensingNote, setCurrentDispensingNote] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  let patientId;

  

  const fetchPatientPrescriptions = async (patientId) => {
    if (!patientId) {
      setError('No verified patient found');
      return;
    }

    setLoading(true);
    setError(null);
    // Clear any existing success message
    setSuccessMessage('');
    setShowSuccessMessage(false);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/pharmacist/prescriptions`, {
        params: { patientId }
      });
      
      // Process the response data
      console.log('Fetched prescriptions:', response.data);
      
      if (response.data.data && response.data.data.prescriptions) {
        setPrescriptions(response.data.data.prescriptions || []);
        setPatientPrescriptions(response.data.data);
        
        // Show success message
        setSuccessMessage('Prescriptions fetched successfully!');
        setShowSuccessMessage(true);
        
        // Clear success message after 3 seconds
        const timer = setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage('');
        }, 3000);
        
        // Clean up timer if component unmounts
        return () => clearTimeout(timer);
      } else {
        setSuccessMessage('No prescriptions found for this patient');
        setShowSuccessMessage(true);
        
        // Clear success message after 3 seconds
        const timer = setTimeout(() => {
          setShowSuccessMessage(false);
          setSuccessMessage('');
        }, 3000);
        
        // Clean up timer if component unmounts
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setError(err.response?.data?.error || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const encodedPatient = urlParams.get('patient');

    if (encodedPatient) {
      try {
        const decodedString = atob(encodedPatient.replace(/-/g, '+').replace(/_/g, '/'));
        const patient = JSON.parse(decodedString);
        setVerifiedPatient(patient);
        setRetrievedPatient(patient);
        fetchPatientPrescriptions(patient.id);
      } catch (e) {
        console.error('Error parsing patient data:', e);
        setError('Invalid patient data received');
      }
    }

    if (showVerificationModal) {
      const nonce = generateRandomString(16);
      const state = generateRandomString(16);

      const renderButton = () => {
        window.SignInWithEsignetButton?.init({
          oidcConfig: {
            acr_values: 'mosip:idp:acr:generated-code mosip:idp:acr:biometricr:static-code',
            claims_locales: 'en',
            client_id: process.env.REACT_APP_ESIGNET_CLIENT_ID,
            redirect_uri: process.env.REACT_APP_ESIGNET_REDIRECT_URI_PHARMACIST,
            display: 'popup',
            nonce: nonce,
            prompt: 'consent',
            scope: 'openid profile',
            state: state,
            ui_locales: 'en',
            authorizeUri: process.env.REACT_APP_ESIGNET_AUTHORIZE_URI,
          },
          buttonConfig: {
            labelText: 'Verify Patient with eSignet',
            shape: 'rounded',
            theme: 'filled_blue',
            type: 'standard'
          },
          signInElement: document.getElementById('esignet-modal-button'),
          onSuccess: (response) => {
            console.log('Patient verification successful:', response);
            const verifiedPatientData = {
              id: response.sub || response.patientId,
              name: response.name || 'Verified Patient',
              birthday: response.birthdate || 'N/A'
            };
            setVerifiedPatient(verifiedPatientData);
            setRetrievedPatient(verifiedPatientData);
            fetchPatientPrescriptions(verifiedPatientData.id);
            setShowVerificationModal(false);
          },
          onFailure: (error) => {
            console.error('Patient verification failed:', error);
            setError('Patient verification failed. Please try again.');
          }
        });
      };

      if (!window.SignInWithEsignetButton) {
        const script = document.createElement('script');
        script.src = process.env.REACT_APP_ESIGNET_SDK_URL;
        script.onload = renderButton;
        document.body.appendChild(script);
      } else {
        renderButton();
      }
    }
  }, [activeView, location.search, showVerificationModal]);

  useEffect(() => {
    if (activeView === 'dispense') {
      setShowDrugClassModal(true);
    }
  }, [activeView]);

  React.useEffect(() => {
    if (!showDrugClassModal && activeView === 'dispense' && typeof handleNavigation === 'function') {
      handleNavigation('dashboard');
    }
  }, [showDrugClassModal, activeView, handleNavigation]);

  const generateRandomString = (length) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      randomString += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return randomString;
  };

  const calculateAge = (birthday) => {
    if (!birthday) return 'N/A';
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handlePrescriptionClick = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
  };

  const handleVerifyClick = () => {
    console.log('Verify button clicked');
    setShowVerificationModal(true);
    setRetrievedPatient(null);
    setPatientPrescriptions(null);
    setError(null);
    
    // Make sure we're in the verify view
    if (activeView !== 'verify' && typeof handleNavigation === 'function') {
      handleNavigation('verify');
    }
  };

  const handleAddPrescriptionRow = () => {
    setNewPrescriptions([...newPrescriptions, { drugName: '', dosage: '', advice: '' }]);
  };

  const handleRemovePrescriptionRow = (index) => {
    const updated = newPrescriptions.filter((_, i) => i !== index);
    setNewPrescriptions(updated);
  };

  const handleNewPrescriptionChange = (index, field, value) => {
    const updated = [...newPrescriptions];
    updated[index][field] = value;
    setNewPrescriptions(updated);
  };

  const handleSubmitNewPrescriptions = async () => {
    try {
      setLoading(true);
      await axios.post(`http://localhost:5000/pharmacist/prescriptions`, {
        patientId: retrievedPatient.id,
        prescriptions: newPrescriptions
      });
      fetchPatientPrescriptions(retrievedPatient.id);
      setShowAddPrescriptionModal(false);
      setNewPrescriptions([{ drugName: '', dosage: '', advice: '' }]);
    } catch (err) {
      setError("Failed to add prescriptions: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const togglePrescriptionSelection = (prescription) => {
    setSelectedPrescriptions(prev => {
      const isSelected = prev.some(p => p.prescriptionId === prescription.prescriptionId);
      return isSelected
        ? prev.filter(p => p.prescriptionId !== prescription.prescriptionId)
        : [...prev, prescription];
    });
  };

  const handleDispensePrescription = async (prescriptionId) => {
    if (!currentDispensingNote || !currentDispensingNote.trim()) {
      setError('Please enter a comment before dispensing');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Set the status for this prescription to "processing"
    setDispenseStatus(prev => ({
      ...prev,
      [prescriptionId]: 'processing'
    }));
    
    try {
      // Get the prescription details
      const prescription = patientPrescriptions.prescriptions.find(p => p.prescriptionId === prescriptionId);
      if (!prescription) {
        throw new Error('Prescription not found');
      }
      
      // Get pharmacist ID from localStorage
      const pharmacistId = localStorage.getItem('pharmaId');
      const patientId = retrievedPatient.id;
      
      // Try the new endpoint first
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/doctor/prescriptions/dispense`,
          {
            patientId: patientId,
            prescriptionId: prescriptionId,
            pharmacistId: pharmacistId,
            note: currentDispensingNote
          }
        );
        
        console.log('Prescription dispensed successfully:', response.data);
      } catch (primaryError) {
        console.warn('Primary dispense endpoint failed, trying fallback:', primaryError);
        
        // Fallback to the existing endpoint if the new one fails
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/pharmacist/dispense`,
          {
            patientId: patientId,
            prescriptionId: prescriptionId,
            pharmacistId: pharmacistId,
            comment: currentDispensingNote
          }
        );
      }
      
      // Show success message
      setSuccessMessage('Medication dispensed successfully!');
      setShowSuccessMessage(true);
      
      // Clear the note after successful dispensing
      setCurrentDispensingNote('');
      setSelectedPrescription(null);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      // Refresh the prescriptions list
      fetchPatientPrescriptions(patientId);
      
      // Update the dispense status
      setDispenseStatus(prev => ({
        ...prev,
        [prescriptionId]: 'success'
      }));
    } catch (err) {
      console.error('Error dispensing prescription:', err);
      setError(err.response?.data?.error || 'Failed to dispense medication');
      
      // Update the dispense status
      setDispenseStatus(prev => ({
        ...prev,
        [prescriptionId]: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDispensePrescriptions = async () => {
    if (!currentDispensingNote || !currentDispensingNote.trim()) {
      setError('Please enter a comment before dispensing');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Get pharmacist ID from localStorage
      const pharmacistId = localStorage.getItem('pharmaId');
      patientId = retrievedPatient.id;
      
      // Track successful and failed dispensations
      const successfulDispenses = [];
      const failedDispenses = [];
      
      // Process each selected prescription
      for (const prescription of selectedPrescriptions) {
        try {
          // Try the new endpoint first
          try {
            const response = await axios.post(
              `${process.env.REACT_APP_API_BASE_URL}/prescriptions/dispense`,
              {
                patientId: patientId,
                prescriptionId: prescription.prescriptionId,
                pharmacistId: pharmacistId,
                note: currentDispensingNote
              }
            );
            
            console.log('Prescription dispensed successfully:', response.data);
            successfulDispenses.push(prescription.prescriptionId);
          } catch (primaryError) {
            console.warn('Primary dispense endpoint failed, trying fallback:', primaryError);
            
            // Fallback to the existing endpoint if the new one fails
            await axios.post(
              `${process.env.REACT_APP_API_BASE_URL}/pharmacist/dispense`,
              {
                patientId: patientId,
                prescriptionId: prescription.prescriptionId,
                pharmacistId: pharmacistId,
                comment: currentDispensingNote
              }
            );
            
            successfulDispenses.push(prescription.prescriptionId);
          }
        } catch (err) {
          console.error(`Failed to dispense prescription ${prescription.prescriptionId}:`, err);
          failedDispenses.push(prescription.prescriptionId);
        }
      }
      
      // Show appropriate success message
      if (successfulDispenses.length > 0) {
        if (failedDispenses.length > 0) {
          setSuccessMessage(`Successfully dispensed ${successfulDispenses.length} prescription(s), but ${failedDispenses.length} failed.`);
        } else {
          setSuccessMessage(`Successfully dispensed ${successfulDispenses.length} prescription(s)!`);
        }
      } else {
        setError('Failed to dispense any prescriptions. Please try again.');
      }
      
      setShowSuccessMessage(successfulDispenses.length > 0);
      
      // Clear the note and selected prescriptions
      setCurrentDispensingNote('');
      setSelectedPrescriptions([]);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      // Close the modal
      setShowDispenseModal(false);
      
      // Refresh the prescriptions list
      fetchPatientPrescriptions(patientId);
    } catch (err) {
      console.error('Error dispensing prescriptions:', err);
      setError(err.response?.data?.error || 'Failed to dispense medications');
    } finally {
      setLoading(false);
    }
  };

  const handleDispenseDrug = async (drug) => {
    setSelectedDrugsForDispense(prev => {
      if (prev.includes(drug)) {
        return prev.filter(d => d !== drug);
      }
      return [...prev, drug];
    });
  };

  const handleDrugClassSelect = (drugClass) => {
    setSelectedDrugClass(drugClass);
    setCurrentDrugClass(drugClass);
    if (selectedDrugsForDispense.length > 0) {
      setShowConfirmationModal(true);
    }
  };

  const handleFinishSelection = () => {
    if (selectedDrugsForDispense.length > 0) {
      setShowConfirmationModal(true);
      setShowDrugClassModal(false); // Close the drug class modal
    }
  };

  const handleBackToDrugClasses = () => {
    setSelectedDrugClass(null);
    if (selectedDrugsForDispense.length === 0) {
      setShowConfirmationModal(false);
    }
  };

  const handleConfirmDispense = async () => {
    try {
      setLoading(true);
      const response = await axios.post(`http://localhost:5000/pharmacist/dispense`, {
        patientId: retrievedPatient?.id,
        prescriptionId: null,
        pharmacistId: 'pharmacist123',
        comment: currentDispensingNote || `Dispensed medications: ${selectedDrugsForDispense.join(', ')}`,
        selectedDrugs: selectedDrugsForDispense,
        dispensingNote: currentDispensingNote
      });

      // Update the prescriptions in state with the new data
      if (response.data.data.updatedPrescriptions) {
        setPatientPrescriptions(response.data.data.updatedPrescriptions);
      }

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        setShowDrugClassModal(false);
        setSelectedDrugClass(null);
        setSelectedDrug(null);
        setSelectedDrugsForDispense([]);
        setShowConfirmationModal(false);
        setCurrentDrugClass(null);
        setIsConfirmed(false);
        setCurrentDispensingNote('');
        
        // Refresh prescriptions after dispensing
        if (retrievedPatient?.id) {
          fetchPatientPrescriptions(retrievedPatient.id);
        }
      }, 2000);
    } catch (err) {
      setError('Failed to dispense drugs: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSelection = () => {
    setIsConfirmed(true);
  };

  const handleBackToSelection = () => {
    setIsConfirmed(false);
  };

  const renderFetchPrescriptionsButton = () => (
    <div className="mb-4">
      <button
        onClick={() => fetchPatientPrescriptions(retrievedPatient?.id)}
        disabled={loading || !retrievedPatient}
        className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
      >
        {loading ? 'Loading...' : 'Fetch Prescriptions'}
      </button>
      
      {/* <div className="flex mt-4 space-x-2">
        <button
          onClick={() => setShowAddPrescriptionModal(true)}
          disabled={!retrievedPatient}
          className="flex items-center px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none disabled:bg-green-300"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Add Prescriptions
        </button>
        <button
          onClick={() => setShowDrugClassModal(true)}
          disabled={!retrievedPatient}
          className="flex items-center px-4 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none disabled:bg-purple-300"
        >
          <FiCheckSquare className="mr-2 h-4 w-4" />
          Dispense Medicine
        </button>
      </div> */}
    </div>
  );

  const renderDrugClassModal = () => {
    if (!showDrugClassModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {selectedDrugClass ? `Select Medications from ${selectedDrugClass}` : 'Drug Classes'}
            </h3>
            <div className="flex items-center space-x-4">
              {selectedDrugsForDispense.length > 0 && (
                <button
                  onClick={handleFinishSelection}
                  className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 flex items-center space-x-2"
                >
                  <span>Finish Selection ({selectedDrugsForDispense.length})</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              )}
              <button 
                onClick={() => {
                  setShowDrugClassModal(false);
                  setSelectedDrugClass(null);
                  setSelectedDrug(null);
                  setSelectedDrugsForDispense([]);
                  setCurrentDrugClass(null);
                  setShowConfirmationModal(false);
                }} 
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        {(showSuccessMessage && successMessage) && (
          <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50">
            {successMessage}
          </div>
        )}
      </div>
    );
  };

  const renderAddPrescriptionModal = () => {
    if (!showAddPrescriptionModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Add New Prescriptions</h3>
            <button 
              onClick={() => {
                setShowAddPrescriptionModal(false);
                setNewPrescriptions([{ drugName: '', dosage: '', advice: '' }]);
              }} 
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
          <div className="px-6 py-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Drug Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dosage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Advice</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {newPrescriptions.map((prescription, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={prescription.drugName}
                          onChange={(e) => handleNewPrescriptionChange(index, 'drugName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="e.g., Paracetamol"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={prescription.dosage}
                          onChange={(e) => handleNewPrescriptionChange(index, 'dosage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="e.g., 500mg twice daily"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={prescription.advice}
                          onChange={(e) => handleNewPrescriptionChange(index, 'advice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="e.g., Take after meals"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {index > 0 && (
                          <button
                            onClick={() => handleRemovePrescriptionRow(index)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={handleAddPrescriptionRow}
                className="flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/75"
              >
                <FiPlus className="mr-1 h-4 w-4" />
                Add Another
              </button>
              <div className="space-x-3">
                <button
                  onClick={() => {
                    setShowAddPrescriptionModal(false);
                    setNewPrescriptions([{ drugName: '', dosage: '', advice: '' }]);
                  }}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitNewPrescriptions}
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  disabled={newPrescriptions.some(p => !p.drugName || !p.dosage)}
                >
                  Save Prescriptions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDispenseModal = () => {
    if (!showDispenseModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Dispense Prescriptions</h3>
            <button 
              onClick={() => {
                setShowDispenseModal(false);
                setSelectedPrescriptions([]);
              }} 
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
          <div className="px-6 py-4">
            {patientPrescriptions?.prescriptions?.length ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Select</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Medication</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dosage</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {patientPrescriptions.prescriptions.map((prescription) => (
                        <tr key={prescription.prescriptionId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedPrescriptions.some(p => p.prescriptionId === prescription.prescriptionId)}
                              onChange={() => togglePrescriptionSelection(prescription)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              disabled={prescription.status !== 'Active'}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {prescription.medicationName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                            {prescription.dosage}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              prescription.status === 'Active' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {prescription.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowDispenseModal(false);
                      setSelectedPrescriptions([]);
                    }}
                    className="mr-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDispensePrescriptions}
                    className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
                    disabled={!selectedPrescriptions.length}
                  >
                    Dispense Selected ({selectedPrescriptions.length})
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No prescriptions available to dispense</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPrescriptionModal = () => {
    if (!selectedPrescription || !showPrescriptionModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full m-4">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Prescription Details</h3>
            <button onClick={() => setShowPrescriptionModal(false)} 
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400">
              <FiX className="h-6 w-6" />
            </button>
          </div>
          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Prescription ID</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{selectedPrescription.prescriptionId}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-sm rounded-full ${
                selectedPrescription.status === 'Active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {selectedPrescription.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Prescriber Information</h4>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Prescribed By</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedPrescription.createdBy || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Prescribed On</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {selectedPrescription.timestamp ? new Date(selectedPrescription.timestamp).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Expiry Date</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {selectedPrescription.expiryDate ? 
                        new Date(selectedPrescription.expiryDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Medication Details</h4>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Medication</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedPrescription.medicationName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dosage</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedPrescription.dosage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Instructions</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedPrescription.instructions}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Diagnosis</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">{selectedPrescription.diagnosis || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {selectedPrescription.status === 'Dispensed' && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Dispensing Information</h4>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dispensed By</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {selectedPrescription.dispensingPharmacist && selectedPrescription.dispensingPharmacist !== 'N/A' 
                        ? selectedPrescription.dispensingPharmacist 
                        : 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dispensed On</p>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {selectedPrescription.dispensingTimestamp && selectedPrescription.dispensingTimestamp !== 'N/A'
                        ? new Date(selectedPrescription.dispensingTimestamp).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>
                  {selectedPrescription.dispensingNote && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Dispensing Notes</p>
                      <p className="text-sm text-gray-900 dark:text-gray-100">{selectedPrescription.dispensingNote}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {selectedPrescription.status === 'Active' ? (
              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="dispensingNote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dispensing Notes
                  </label>
                  <textarea
                    id="dispensingNote"
                    value={dispensingNotes[selectedPrescription.prescriptionId] || ''}
                    onChange={(e) => setDispensingNotes(prev => ({
                      ...prev,
                      [selectedPrescription.prescriptionId]: e.target.value
                    }))}
                    placeholder="Add any notes about this dispensation (optional)"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPrescriptionModal(false)}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Set a default note if none is provided
                      if (!dispensingNotes[selectedPrescription.prescriptionId]) {
                        setDispensingNotes(prev => ({
                          ...prev,
                          [selectedPrescription.prescriptionId]: 'Dispensed via quick action'
                        }));
                      }
                      
                      // Use the new endpoint directly
                      const pharmacistId = localStorage.getItem('pharmaId');
                      const patientId = retrievedPatient.id;
                      
                      setDispenseStatus(prev => ({
                        ...prev,
                        [selectedPrescription.prescriptionId]: 'processing'
                      }));
                      
                      axios.post(
                        `${process.env.REACT_APP_API_BASE_URL}/prescriptions/dispense`,
                        {
                          patientId: patientId,
                          prescriptionId: selectedPrescription.prescriptionId,
                          pharmacistId: pharmacistId,
                          note: dispensingNotes[selectedPrescription.prescriptionId] || 'Dispensed via quick action'
                        }
                      )
                      .then(response => {
                        console.log('Prescription dispensed successfully:', response.data);
                        setSuccessMessage('Medication dispensed successfully!');
                        setShowSuccessMessage(true);
                        setTimeout(() => setShowSuccessMessage(false), 3000);
                        fetchPatientPrescriptions(patientId);
                        setShowPrescriptionModal(false);
                        
                        setDispenseStatus(prev => ({
                          ...prev,
                          [selectedPrescription.prescriptionId]: 'success'
                        }));
                      })
                      .catch(error => {
                        console.error('Error dispensing prescription:', error);
                        setError(error.response?.data?.error || 'Failed to dispense medication');
                        
                        setDispenseStatus(prev => ({
                          ...prev,
                          [selectedPrescription.prescriptionId]: 'error'
                        }));
                      });
                    }}
                    disabled={dispenseStatus[selectedPrescription.prescriptionId] === 'processing'}
                    className={`px-4 py-2 text-sm text-white rounded-md flex items-center space-x-2 ${
                      dispenseStatus[selectedPrescription.prescriptionId] === 'processing'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {dispenseStatus[selectedPrescription.prescriptionId] === 'processing' ? (
                      <>
                        <span>Dispensing...</span>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      </>
                    ) : (
                      <>
                        <span>Dispense</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                  
                </div>
              </div>
            ) : (
              <div className="mt-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmationModal = () => {
    if (!showConfirmationModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full m-4">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {isConfirmed ? 'Ready to Dispense' : 'Selected Medications'}
            </h3>
            <button 
              onClick={() => {
                setShowConfirmationModal(false);
                setIsConfirmed(false);
              }}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isConfirmed ? 'Medications to dispense:' : 'Review selected medications:'}
              </h4>
              {!isConfirmed && (
                <button
                  onClick={() => {
                    setShowConfirmationModal(false);
                    setShowDrugClassModal(true);
                  }}
                  className="px-3 py-1 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/50 dark:hover:bg-blue-900/75 rounded-md flex items-center space-x-1"
                >
                  <FiPlus className="h-4 w-4" />
                  <span>Add More</span>
                </button>
              )}
            </div>
            {selectedDrugsForDispense.length > 0 ? (
              <>
                <ul className="space-y-2 mb-6 max-h-[30vh] overflow-y-auto">
                  {selectedDrugsForDispense.map((drug, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                      <span className="text-gray-900 dark:text-gray-100">{drug}</span>
                      {!isConfirmed && (
                        <button
                          onClick={() => setSelectedDrugsForDispense(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <FiX className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
                
                {isConfirmed && (
                  <div className="mb-6">
                    <label htmlFor="dispensingNote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Dispensing Notes
                    </label>
                    <textarea
                      id="dispensingNote"
                      value={currentDispensingNote}
                      onChange={(e) => setCurrentDispensingNote(e.target.value)}
                      placeholder="Add any notes about this dispensation (optional)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No medications selected. Click "Add More" to select medications.
              </div>
            )}
            <div className="flex justify-end space-x-3">
              {!isConfirmed ? (
                <>
                  <button
                    onClick={() => {
                      setShowConfirmationModal(false);
                      setIsConfirmed(false);
                    }}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSelection}
                    disabled={selectedDrugsForDispense.length === 0}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center space-x-2"
                  >
                    <span>Confirm Selection</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleBackToSelection}
                    className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmDispense}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <span>Dispensing...</span>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      </>
                    ) : (
                      <>
                        <span>Dispense Medications</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVerificationModal = () => {
    if (!showVerificationModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full m-4">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Verify Patient Identity</h3>
            <button
              onClick={() => setShowVerificationModal(false)}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
          <div className="px-6 py-8">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Secure Patient Verification</h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Please verify the patient's identity using eSignet to access their prescriptions and medical information
                </p>
              </div>
              <div id="esignet-modal-button" className="flex justify-center"></div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                This verification process ensures patient data privacy and security
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Pharmacist Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Dispense Medication</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {retrievedPatient ? 'Dispense medications for the verified patient' : 'Verify a patient first to dispense medications'}
          </p>
          <button 
            onClick={() => retrievedPatient ? setShowDrugClassModal(true) : handleVerifyClick()}
            disabled={!retrievedPatient}
            className={`w-full px-4 py-2 rounded-md flex items-center justify-center space-x-2 ${
              retrievedPatient 
                ? 'text-white bg-green-600 hover:bg-green-700' 
                : 'text-gray-500 bg-gray-200 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Dispense Medicine</span>
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Manage Prescriptions</h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {retrievedPatient ? 'Add or view prescriptions for the verified patient' : 'Verify a patient first to manage prescriptions'}
          </p>
          <button 
            onClick={() => {
              if (retrievedPatient) {
                setShowAddPrescriptionModal(true);
              } else {
                handleVerifyClick();
              }
            }}
            disabled={!retrievedPatient}
            className={`w-full px-4 py-2 rounded-md flex items-center justify-center space-x-2 ${
              retrievedPatient 
                ? 'text-white bg-purple-600 hover:bg-purple-700' 
                : 'text-gray-500 bg-gray-200 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Prescription</span>
          </button>
        </div>
      </div>
      
      {retrievedPatient && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Current Patient</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 rounded-full text-sm">
              Verified
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Patient ID</p>
              <p className="mt-1 text-gray-900 dark:text-gray-100">{retrievedPatient.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
              <p className="mt-1 text-gray-900 dark:text-gray-100">{retrievedPatient.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</p>
              <p className="mt-1 text-gray-900 dark:text-gray-100">{calculateAge(retrievedPatient.birthday)} years</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => typeof handleNavigation === 'function' && handleNavigation('verify')}
              className="px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-md"
            >
              View Patient Details
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Inventory Management</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {/* Inventory management content */}
      </div>
    </div>
  );

  const renderPrescriptions = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">All Prescriptions</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        {/* All prescriptions content */}
      </div>
    </div>
  );

  const renderDrugClasses = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Drug Classes</h2>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <ul className="list-disc pl-6">
          <li className="text-gray-900 dark:text-gray-100">Antibiotics</li>
          <li className="text-gray-900 dark:text-gray-100">Analgesics</li>
          <li className="text-gray-900 dark:text-gray-100">Antidepressants</li>
          <li className="text-gray-900 dark:text-gray-100">Antihistamines</li>
          <li className="text-gray-900 dark:text-gray-100">Antipyretics</li>
          <li className="text-gray-900 dark:text-gray-100">Antifungals</li>
          <li className="text-gray-900 dark:text-gray-100">Antivirals</li>
        </ul>
      </div>
    </div>
  );

  // Add a separate effect to track when verify section is active
  useEffect(() => {
    if (activeView === 'verify' && !showVerificationModal) {
      console.log('Verify section is active');
    }
  }, [activeView, showVerificationModal]);

  const renderVerifySection = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {retrievedPatient ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">Verified Patient Information</h3>
                <button
            onClick={handleVerifyClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>{retrievedPatient ? 'Verify Another Patient' : 'Verify Patient'}</span>
          </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Patient ID</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{retrievedPatient.id}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {patientPrescriptions?.patientName || retrievedPatient.name}
                  </p>
                </div>
                {/* <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {patientPrescriptions?.dateOfBirth || retrievedPatient.birthday || 'N/A'}
                  </p>
                </div> */}
              </div>
              
              {patientPrescriptions?.doctorId && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Prescribing Doctor ID</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{patientPrescriptions.doctorId}</p>
                  </div>
                  {/* <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {calculateAge(patientPrescriptions?.dateOfBirth || retrievedPatient.birthday)} years
                    </p>
                  </div> */}
                </div>
              )}

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400">Prescription Management</h3>
                {renderFetchPrescriptionsButton()}
              </div>

              {patientPrescriptions && (
                <div className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Medication</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dosage</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Instructions</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Diagnosis</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expiry</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {patientPrescriptions.prescriptions.map((prescription) => (
                          <tr 
                            key={prescription.prescriptionId}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => handlePrescriptionClick(prescription)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 cursor-pointer">{prescription.medicationName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 cursor-pointer">{prescription.dosage}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 cursor-pointer">{prescription.instructions}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 cursor-pointer">{prescription.diagnosis || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                prescription.status === 'Active' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' 
                                  : prescription.status === 'Dispensed'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {prescription.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 cursor-pointer">
                              {prescription.expiryDate ? new Date(prescription.expiryDate).toLocaleDateString() : 'N/A'}
                            </td>
                            

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 space-y-6">
              <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">No Patient Verified</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Please verify a patient using eSignet to view their prescriptions and dispense medications
              </p>
              <button
                onClick={handleVerifyClick}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Verify Patient with eSignet</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Debug the activeView prop
  useEffect(() => {
    console.log('PharmacistVerifyContent activeView:', activeView);
  }, [activeView]);

  // Always render the verify section regardless of activeView
  // This ensures the component is never blank
  return (
    <div className="space-y-6">
      {/* Always show a verification button at the top */}

      {error && (
        <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded">
          {error}
        </div>
      )}
      
      {(successMessage && showSuccessMessage) && (
        <div className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-700 dark:text-green-400 p-4 rounded">
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
        </div>
      ) : (
        <>
          {renderVerifySection()}
        </>
      )}

      {renderPrescriptionModal()}
      {renderVerificationModal()}
      {renderAddPrescriptionModal()}
      {renderDispenseModal()}
      {renderDrugClassModal()}
      {renderConfirmationModal()}
    </div>
  );
};

export default PharmacistVerifyContent;
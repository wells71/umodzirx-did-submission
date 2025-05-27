import React, { useState, useRef, useEffect } from 'react';
import { FiPlus, FiX, FiCheckCircle, FiSearch, FiChevronDown, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import useAuth from '../../../hooks/useAuth';
import { useLocation } from 'react-router-dom';

const FREQUENCY_OPTIONS = [
  'Once a day',
  'Twice a day',
  'Three times a day',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'Before meals',
  'After meals',
  'At bedtime'
];

// Predefined medication categories and medications
const MEDICATION_CATEGORIES = {
  'Antibiotics': [
    'Amoxicillin', 'Azithromycin', 'Ciprofloxacin', 'Doxycycline', 'Metronidazole',
    'Penicillin', 'Ceftriaxone', 'Clindamycin', 'Trimethoprim-Sulfamethoxazole'
  ],
  'Analgesics': [
    'Paracetamol', 'Ibuprofen', 'Diclofenac', 'Naproxen', 'Aspirin',
    'Tramadol', 'Codeine', 'Morphine'
  ],
  'Antihypertensives': [
    'Amlodipine', 'Lisinopril', 'Losartan', 'Hydrochlorothiazide', 'Atenolol',
    'Metoprolol', 'Enalapril', 'Valsartan', 'Nifedipine'
  ],
  'Antidiabetics': [
    'Metformin', 'Glibenclamide', 'Insulin', 'Gliclazide', 'Sitagliptin',
    'Empagliflozin', 'Pioglitazone'
  ],
  'Antihistamines': [
    'Cetirizine', 'Loratadine', 'Chlorpheniramine', 'Diphenhydramine', 'Fexofenadine'
  ],
  'Antacids & Antiulcer': [
    'Omeprazole', 'Ranitidine', 'Famotidine', 'Pantoprazole', 'Aluminum Hydroxide',
    'Magnesium Hydroxide', 'Esomeprazole'
  ],
  'Antimalarials': [
    'Artemether-Lumefantrine', 'Chloroquine', 'Quinine', 'Mefloquine', 'Atovaquone-Proguanil',
    'Primaquine', 'Sulfadoxine-Pyrimethamine'
  ],
  'Antiasthmatics': [
    'Salbutamol', 'Fluticasone', 'Budesonide', 'Montelukast', 'Ipratropium',
    'Theophylline', 'Beclomethasone'
  ],
  'Vitamins & Supplements': [
    'Vitamin A', 'Vitamin B Complex', 'Vitamin C', 'Vitamin D', 'Vitamin E',
    'Folic Acid', 'Iron Supplements', 'Calcium Supplements', 'Zinc Supplements'
  ],
  'Antiparasitics': [
    'Albendazole', 'Mebendazole', 'Praziquantel', 'Ivermectin', 'Pyrantel Pamoate'
  ]
};

const PrescriptionButton = ({ activeView }) => {
  const [showModal, setShowModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [verifiedPatient, setVerifiedPatient] = useState(null);  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '' }]
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [currentMedicationIndex, setCurrentMedicationIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [filteredMedications, setFilteredMedications] = useState([]);
  const modalRef = useRef();
  const medicationModalRef = useRef();
  const searchInputRef = useRef();
  const { getUserInfo } = useAuth();
  const location = useLocation();

  const handleMedicationChange = (index, field, value) => {
    const newMeds = [...prescriptionForm.medications];
    newMeds[index] = { ...newMeds[index], [field]: value };
    setPrescriptionForm({ ...prescriptionForm, medications: newMeds });
  };
  
  const addMedication = () => {
    setPrescriptionForm({
      ...prescriptionForm,
      medications: [...prescriptionForm.medications, { name: '', dosage: '', frequency: '' }]
    });
  };

  const removeMedication = (index) => {
    const newMeds = [...prescriptionForm.medications];
    newMeds.splice(index, 1);
    setPrescriptionForm({ ...prescriptionForm, medications: newMeds });
  };
  
  const handleClearForm = () => {
    setPrescriptionForm({
      diagnosis: '',
      medications: [{ name: '', dosage: '', frequency: '' }]
    });
  };
  // Helper function to check if a medication is already selected
  const isMedicationSelected = (medicationName) => {
    return prescriptionForm.medications.some(med => med.name === medicationName);
  };

  // Helper function to check if a medication is selected in a different field (not the current one)
  const isMedicationSelectedElsewhere = (medicationName, currentIndex) => {
    return prescriptionForm.medications.some((med, index) => 
      med.name === medicationName && index !== currentIndex
    );
  };
  
  // Open medication selection modal for a specific medication index
  const openMedicationSelector = (index) => {
    setCurrentMedicationIndex(index);
    setSearchTerm('');
    setFilteredMedications([]);
    setShowMedicationModal(true);
    // Focus the search input when modal opens
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };
  
  // Handle medication search
  const handleMedicationSearch = (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setFilteredMedications([]);
      return;
    }
    
    // Search through all medications in all categories
    const results = [];
    Object.entries(MEDICATION_CATEGORIES).forEach(([category, medications]) => {
      medications.forEach(medication => {
        if (medication.toLowerCase().includes(term.toLowerCase())) {
          results.push({ category, medication });
        }
      });
    });
    
    setFilteredMedications(results);
  };
    // Select a medication from the list
  const selectMedication = (medicationName) => {
    // Allow selection if it's for the current medication index or if it's not selected elsewhere
    if (!isMedicationSelectedElsewhere(medicationName, currentMedicationIndex)) {
      handleMedicationChange(currentMedicationIndex, 'name', medicationName);
      setShowMedicationModal(false);
    }
  };
  
  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Function to calculate age from birthday
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
  
  // Function to clear patient verification
  const clearPatientVerification = () => {
    setVerifiedPatient(null);
  };
  const handleSubmitPrescription = async (e) => {
    e?.preventDefault();    // Validate form data
    if (!prescriptionForm.diagnosis || prescriptionForm.medications.some(med => !med.name || !med.dosage || !med.frequency)) {
      setError('All fields are required, including diagnosis and all medication details (name, dosage, and frequency).');
      return;
    }
    
    // Check for valid doctor ID
    const userInfo = getUserInfo();
    console.log('User info from auth:', userInfo);
    
    const { id: doctorId, name: doctorName, role } = userInfo;
    console.log('Doctor info extracted:', { doctorId, doctorName, role });
    
    if (!doctorId) {
      setError('Authentication error: No doctor ID found. Please log in again.');
      return;
    }

    try {
      setError(null); // Clear any previous errors
      
      // Ensure patient is verified
      if (!verifiedPatient) {
        setError('Patient verification is required before creating a prescription.');
        setShowVerificationModal(true);
        return;
      }
      
      console.log('Submitting prescription:', {
        patient: verifiedPatient,
        ...prescriptionForm,
      });
        // Format medications for the backend
      const formattedMedications = prescriptionForm.medications.map(med => ({
        medicationName: med.name,
        medication: med.name, // Add this as a fallback since controller checks for both
        dosage: med.dosage,
        instructions: med.frequency,
        diagnosis: prescriptionForm.diagnosis
      }));      // Log the request payload for debugging
      const { id: doctorId } = getUserInfo();
      const requestPayload = {
        patientId: verifiedPatient.id,
        doctorId: doctorId, // Use auth hook to get user ID
        patientName: verifiedPatient.name,
        prescriptions: formattedMedications
      };
      
      console.log('Request payload:', JSON.stringify(requestPayload));

      // Make API call to the backend endpoint
      const response = await axios.post('http://localhost:5000/doctor/prescriptions', requestPayload);

      console.log('Response from server:', response.data);

      // Check if the response indicates success
      if (response.data && response.data.success) {
        console.log('Prescription created successfully:', response.data);
        
        // Set success message
        setSuccessMessage('Prescription created successfully!');
        setShowSuccessMessage(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
          
          // Close the modal and clear the form
          setShowModal(false);
          handleClearForm();
        }, 3000);
        
        // Don't clear patient verification - keep it for next prescription
      } else {
        console.error('Response did not indicate success:', response.data);
        throw new Error(
          response.data && response.data.error 
            ? response.data.error 
            : 'Failed to create prescription. Server did not return success status.'
        );
      }
    } catch (err) {
      console.error('Error submitting prescription:', err);
      
      // Handle Axios errors with response data
      if (err.response && err.response.data) {
        console.error('Server error response:', err.response.data);
        const errorMessage = err.response.data.error || 'Unknown server error';
        const errorDetails = err.response.data.details 
          ? (typeof err.response.data.details === 'string' 
              ? err.response.data.details 
              : JSON.stringify(err.response.data.details))
          : '';
        
        setError(`Failed to create prescription: ${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`);
      } else {
        // Handle other errors
        console.error('Error details:', err.message);
        setError(`Failed to create prescription: ${err.message}`);
      }
    }
  };

  // Helper function to generate random string for nonce and state
  const generateRandomString = (length) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }
    return result;
  };

  // Check for encoded patient data in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const encodedPatient = urlParams.get('patient');

    if (encodedPatient) {
      try {
        // Decode the base64-encoded patient data
        const decodedString = atob(encodedPatient.replace(/-/g, '+').replace(/_/g, '/'));
        const patient = JSON.parse(decodedString);
        console.log('Found encoded patient data in URL:', patient);
        
        // Set the patient information
        setVerifiedPatient(patient);
        
        // Show prescription modal with the verified data
        setShowModal(true);
        
        // Clear URL parameters to prevent reloading the same data on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Error parsing patient data:', e);
        setError('Invalid patient data received');
      }
    }
  }, [location.search]);

  // Handle clicks outside the modal and Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && !showMedicationModal) {
        setShowModal(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && !showMedicationModal) {
        setShowModal(false);
      }
    };

    // Add event listeners
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    // Clean up event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showModal, showMedicationModal]);
  
  // Handle clicks outside the medication modal and Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (medicationModalRef.current && !medicationModalRef.current.contains(event.target)) {
        setShowMedicationModal(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowMedicationModal(false);
      }
    };

    // Add event listeners
    if (showMedicationModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    // Clean up event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showMedicationModal]);

  // Initialize eSignet for patient verification
  useEffect(() => {
    if (showVerificationModal) {
      const nonce = generateRandomString(16);
      const state = generateRandomString(16);

      const renderButton = () => {
        window.SignInWithEsignetButton?.init({
          oidcConfig: {
            acr_values: 'mosip:idp:acr:generated-code mosip:idp:acr:biometricr:static-code',
            claims_locales: 'en',
            client_id: process.env.REACT_APP_ESIGNET_CLIENT_ID,
            redirect_uri: 'http://localhost:5000/doctor/verifypatient', // Must match the backend controller
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
            setShowVerificationModal(false);
            setShowModal(true);
          },
          onFailure: (error) => {
            console.error('Patient verification failed:', error);
            setError('Patient verification failed. Please try again.');
          }
        });
      };

      // Check if the eSignet script is loaded, if not load it
      if (!window.SignInWithEsignetButton) {
        const script = document.createElement('script');
        script.src = process.env.REACT_APP_ESIGNET_SDK_URL;
        script.onload = renderButton;
        document.body.appendChild(script);
      } else {
        renderButton();
      }
    }
  }, [showVerificationModal]);
  


  // Render verification modal
  const renderVerificationModal = () => {
    if (!showVerificationModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[55]">
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
                  Please verify the patient's identity using eSignet to create a prescription
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
  
  // Render medication selection modal
  const renderMedicationModal = () => {
    if (!showMedicationModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
        <div 
          ref={medicationModalRef} 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[600px] max-h-[80vh] m-4 flex flex-col"
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Select Medication</h3>
            <button
              onClick={() => setShowMedicationModal(false)}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => handleMedicationSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-300 transition-shadow"
                placeholder="Search for medications..."
              />
            </div>
          </div>
          
          {/* Medication List */}
          <div className="flex-1 overflow-y-auto p-2">
            {/* Search Results */}
            {searchTerm && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4 py-2">
                  Search Results
                </h4>
                <div className="space-y-1">                  {filteredMedications.length > 0 ? (
                    filteredMedications.map(({ medication, category }, index) => (
                      <button
                        key={`${medication}-${index}`}
                        onClick={() => !isMedicationSelectedElsewhere(medication, currentMedicationIndex) && selectMedication(medication)}
                        disabled={isMedicationSelectedElsewhere(medication, currentMedicationIndex)}
                        className={`w-full text-left px-4 py-2 rounded-md transition-colors flex items-center justify-between group ${
                          isMedicationSelectedElsewhere(medication, currentMedicationIndex) 
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span>{medication}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">{category}</span>
                          {isMedicationSelectedElsewhere(medication, currentMedicationIndex) && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">(already selected)</span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 dark:text-gray-400 text-sm">
                      No medications found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Categories */}
            {(!searchTerm || filteredMedications.length === 0) && (
              <div className="space-y-2">
                {Object.entries(MEDICATION_CATEGORIES).map(([category, medications]) => (
                  <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full text-left px-4 py-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-800 dark:text-gray-200">{category}</span>
                      {expandedCategories[category] ? (
                        <FiChevronDown className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <FiChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                    
                    {expandedCategories[category] && (                      <div className="max-h-60 overflow-y-auto">
                        {medications.map((medication, index) => (
                          <button
                            key={`${medication}-${index}`}
                            onClick={() => !isMedicationSelectedElsewhere(medication, currentMedicationIndex) && selectMedication(medication)}
                            disabled={isMedicationSelectedElsewhere(medication, currentMedicationIndex)}
                            className={`w-full text-left px-4 py-2 transition-colors flex items-center justify-between ${
                              isMedicationSelectedElsewhere(medication, currentMedicationIndex)
                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}
                          >
                            <span>{medication}</span>
                            {isMedicationSelectedElsewhere(medication, currentMedicationIndex) && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">(already selected)</span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setShowMedicationModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                Cancel
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select a medication from the list or search by name
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating Button - show on all views */}
      <div className="fixed bottom-6 right-6 z-10 group">
        <button
          onClick={() => {
            console.log('Opening prescription modal');
            
            if (verifiedPatient) {
              console.log('Patient already verified, showing prescription modal');
              setShowModal(true);
            } else {
              console.log('Patient not verified, showing verification modal');
              setShowVerificationModal(true);
            }
          }}
          className="group flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 ease-in-out overflow-hidden group-hover:rounded-lg"
        >
          <div className="flex items-center justify-center w-14 h-14 group-hover:w-auto group-hover:px-5">
            <FiPlus className="h-6 w-6 flex-shrink-0" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-in-out whitespace-nowrap font-medium">
              Create Prescription
            </span>
          </div>
        </button>
      </div>

      {renderVerificationModal()}
      {renderMedicationModal()}
      
      {/* Prescription Modal */}
      {showModal && verifiedPatient && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[50]"
          onClick={(e) => {
            // Close modal when clicking on the backdrop, but only if medication modal is not open
            if (e.target === e.currentTarget && !showMedicationModal) {
              setShowModal(false);
            }
          }}
        >
          <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700 px-8 py-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create New Prescription</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              {/* Success Message */}
              {showSuccessMessage && (
                <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-400 p-4 rounded-md flex items-center animate-fadeIn">
                  <FiCheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p>{successMessage}</p>
                </div>
              )}
              
              {/* Patient Info with Verification Badge */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Patient Information</h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    <FiCheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Name</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {verifiedPatient.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">ID</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {verifiedPatient.id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400">Age</label>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {verifiedPatient.birthday && verifiedPatient.birthday !== 'N/A' 
                        ? calculateAge(verifiedPatient.birthday) + ' years'
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      clearPatientVerification();
                      setShowModal(false);
                      setShowVerificationModal(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                  >
                    <span>Verify Different Patient</span>
                  </button>
                </div>
              </div>
              
              {/* Diagnosis Field */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Diagnosis
                </label>
                <input
                  type="text"
                  value={prescriptionForm.diagnosis}
                  onChange={(e) => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 transition-shadow"
                  placeholder="Enter patient diagnosis"
                  required
                />
              </div>
              
              {/* Prescription Form */}
              <form onSubmit={handleSubmitPrescription} className="space-y-6">

                {/* Medications */}
                <div className="space-y-4">
                  {prescriptionForm.medications.map((med, index) => (
                    <div 
                      key={index} 
                      className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:border-gray-300 dark:hover:border-gray-500 transition-colors relative"
                    >                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Medication
                          </label>                          <div className="relative">
                            <input
                              type="text"
                              value={med.name}
                              onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                              onClick={() => openMedicationSelector(index)}
                              className={`block w-full px-3 py-2 border ${
                                isMedicationSelectedElsewhere(med.name, index)
                                  ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-500'
                                  : 'border-gray-300 dark:border-gray-600'
                              } rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 transition-shadow cursor-pointer`}
                              placeholder="Select medication"
                              readOnly
                              required
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <FiChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </div>
                            {/* Warning indicator for duplicate medications */}
                            {isMedicationSelectedElsewhere(med.name, index) && (
                              <div className="absolute -top-2 -right-2">
                                <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">!</span>
                                </div>
                              </div>
                            )}
                          </div>
                          {/* Duplicate medication warning */}
                          {isMedicationSelectedElsewhere(med.name, index) && (
                            <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400 flex items-center">
                              <span className="mr-1">⚠️</span>
                              This medication is already selected in another field
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 transition-shadow"
                            placeholder="Enter dosage"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Frequency
                          </label>
                          <select
                            value={med.frequency}
                            onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 transition-shadow"
                            required
                          >
                            <option value="">Select frequency</option>
                            {FREQUENCY_OPTIONS.map((freq) => (
                              <option key={freq} value={freq}>
                                {freq}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {prescriptionForm.medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center border border-red-200 transition-colors"
                          title="Remove medication"
                        >
                          <span className="text-sm font-medium">−</span>
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addMedication}
                    className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    <FiPlus className="w-4 h-4 mr-1" /> Add Another Medication
                  </button>
                </div>
              </form>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 px-8 py-6 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPrescription}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  Create Prescription
                </button>
              </div>
              {error && (
                <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 p-3 text-sm rounded">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrescriptionButton;
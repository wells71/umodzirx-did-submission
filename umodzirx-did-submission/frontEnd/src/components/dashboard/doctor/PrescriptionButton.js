import React, { useState, useRef, useEffect } from 'react';
import { FiPlus, FiX, FiCheckCircle, FiSearch, FiChevronDown, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
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
  const [verifiedPatient, setVerifiedPatient] = useState(null);

  const [patientProfile, setPatientProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
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
    setPatientProfile(null);
  };
  
  // Function to fetch patient profile
  const fetchPatientProfile = async (patientId) => {
    if (!patientId) return;
    
    try {
      setLoadingProfile(true);
      const response = await axios.get(`http://localhost:5000/patient/profile?patientId=${patientId}`);
      
      if (response.data && response.data.success) {
        console.log('Patient profile loaded:', response.data.data);
        setPatientProfile(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching patient profile:', err);
      // If 404, it means profile doesn't exist yet, which is okay
      if (err.response && err.response.status !== 404) {
        setError('Failed to load patient profile data');
      }
    } finally {
      setLoadingProfile(false);
    }
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
        
        // Fetch patient profile data
        if (patient.id) {
          fetchPatientProfile(patient.id);
        }
        
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
  
  // Fetch patient profile when a patient is verified
  useEffect(() => {
    if (verifiedPatient?.id) {
      fetchPatientProfile(verifiedPatient.id);
    }
  }, [verifiedPatient]);

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
          <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[95%] max-w-[1300px] max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700 px-8 py-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Issue New Prescription</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="px-10 py-8 space-y-8">
              {/* Success Message */}
              {showSuccessMessage && (
                <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-400 p-4 rounded-md flex items-center animate-fadeIn">
                  <FiCheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p>{successMessage}</p>
                </div>
              )}
              
              {/* Error Message */}
              {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded-md flex items-center">
                  <FiAlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              
              {/* Two-column layout for patient info and prescription form */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Patient Information Section - 2/5 width */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Patient Information</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <FiCheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    </div>
                    
                    <div className="p-6 space-y-5">
                      {/* Basic Patient Info */}
                      <div>
                        <div className="flex items-center mb-4">
                          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300 mr-4">
                            <span className="text-lg font-semibold">{verifiedPatient.name?.charAt(0) || "P"}</span>
                          </div>
                          <div>
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white">{verifiedPatient.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {verifiedPatient.id}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400">Age</label>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {verifiedPatient.birthday && verifiedPatient.birthday !== 'N/A' 
                                ? calculateAge(verifiedPatient.birthday) + ' years'
                                : 'N/A'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400">Sex</label>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {patientProfile?.sex || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Medical Information */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Medical Information</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400">Blood Group</label>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {patientProfile?.bloodGroup || 'Not specified'}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Allergies</label>
                            {patientProfile?.allergies && patientProfile.allergies.length > 0 ? (
                              <div className="mt-1 flex flex-wrap gap-2">
                                {patientProfile.allergies.map((allergy, idx) => (
                                  <span 
                                    key={idx} 
                                    className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                  >
                                    {allergy.name} ({allergy.severity})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No known allergies</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Medical Conditions</label>
                            {patientProfile?.medicalConditions && patientProfile.medicalConditions.length > 0 ? (
                              <div className="mt-1 flex flex-wrap gap-2">
                                {patientProfile.medicalConditions.map((condition, idx) => (
                                  <span 
                                    key={idx} 
                                    className="inline-flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                  >
                                    {condition.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No known conditions</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Current Medications</label>
                            {patientProfile?.currentMedications && patientProfile.currentMedications.length > 0 ? (
                              <div className="mt-2 space-y-2">
                                {patientProfile.currentMedications.map((med, idx) => (
                                  <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-md border border-blue-100 dark:border-blue-800/30">
                                    <div className="font-medium text-sm text-blue-800 dark:text-blue-300">{med.name}</div>
                                    <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                                      {med.dosage} • {med.frequency}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">No current medications</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Lifestyle</label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                              <div className={`flex items-center px-3 py-2 rounded-md ${
                                patientProfile?.alcoholUse === 'Yes' 
                                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30' 
                                  : 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30'
                              }`}>
                                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                  patientProfile?.alcoholUse === 'Yes' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}></span>
                                <span className={`text-sm font-medium ${
                                  patientProfile?.alcoholUse === 'Yes' 
                                    ? 'text-yellow-800 dark:text-yellow-300' 
                                    : 'text-green-800 dark:text-green-300'
                                }`}>
                                  Alcohol: {patientProfile?.alcoholUse || 'No'}
                                </span>
                              </div>
                              <div className={`flex items-center px-3 py-2 rounded-md ${
                                patientProfile?.tobaccoUse === 'Yes' 
                                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800/30' 
                                  : 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30'
                              }`}>
                                <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                                  patientProfile?.tobaccoUse === 'Yes' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}></span>
                                <span className={`text-sm font-medium ${
                                  patientProfile?.tobaccoUse === 'Yes' 
                                    ? 'text-yellow-800 dark:text-yellow-300' 
                                    : 'text-green-800 dark:text-green-300'
                                }`}>
                                  Tobacco: {patientProfile?.tobaccoUse || 'No'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Prescription Form Section - 3/5 width */}
                <div className="lg:col-span-3">
                  <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Prescription Details</h3>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* Diagnosis */}
                      <div>
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
                      
                      {/* Medications */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Medications
                          </label>
                          <button
                            type="button"
                            onClick={addMedication}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                          >
                            <FiPlus className="h-4 w-4 mr-1.5" />
                            Add Medication
                          </button>
                        </div>
                        
                        {prescriptionForm.medications.map((med, index) => (
                          <div 
                            key={index} 
                            className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:border-gray-300 dark:hover:border-gray-500 transition-colors relative"
                          >                      
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Medication
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={med.name}
                                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                                    onClick={() => openMedicationSelector(index)}
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 transition-shadow cursor-pointer"
                                    placeholder="Select medication"
                                    readOnly
                                    required
                                  />
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <FiChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  </div>
                                </div>
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
                      </div>
                      
                      {/* Additional Notes - Optional */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Additional Notes <span className="text-xs text-gray-500">(optional)</span>
                        </label>
                        <textarea
                          rows="3"
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-300 transition-shadow"
                          placeholder="Enter any additional instructions or notes for the patient"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 px-10 py-6 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  Clear form
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPrescription}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all flex items-center"
                >
                  <FiCheckCircle className="mr-2 h-4 w-4" />
                  Issue Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrescriptionButton;
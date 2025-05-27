import React, { useState, useRef, useEffect } from 'react';
import { FiPlusCircle, FiUsers, FiX, FiPlus, FiCalendar, FiCheckCircle, FiFileText } from 'react-icons/fi';
import AppointmentsTable from '../../common/AppointmentsTable';
import axios from 'axios';

const MEDICATION_LIST = [
  'Panado',
  'Bufen',
  'Aspirin',
  'Magnesium',
  'Ibuprofen',
  'Paracetamol',
  'Amoxicillin',
  'Diclofenac',
  'Metformin',
  'Omeprazole'
].sort();

const MEDICATION_CATEGORIES = {
  'Pain Relief': ['Panado', 'Aspirin', 'Ibuprofen', 'Diclofenac'],
  'Antibiotics': ['Amoxicillin', 'Penicillin', 'Azithromycin'],
  'Cardiovascular': ['Metoprolol', 'Amlodipine', 'Lisinopril'],
  'Diabetes': ['Metformin', 'Insulin', 'Glibenclamide'],
  'Gastrointestinal': ['Omeprazole', 'Ranitidine', 'Buscopan'],
  'Supplements': ['Magnesium', 'Vitamin B', 'Calcium'],
};

const FREQUENCY_OPTIONS = [
  'Once a day',
  'Twice a day',
  'Three times a day',
  'Four times a day',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'Before meals',
  'After meals',
  'At bedtime'
];

const DoctorContent = ({ activeView, handleNavigation, externalPrescriptionModal = false, onCloseExternalPrescriptionModal }) => {  
  const MOCK_STATISTICS = {
    activePrescriptions: 48,
    highRiskPatients: 12
  };

  const MOCK_PATIENTS = [
    { 
      id: 'PID-001',
      name: 'John Banda',
      age: 45,
      lastVisit: '2025-03-15',
      status: 'Completed',
      prescriptionId: 'RX-2025-001'
    },
    { 
      id: 'PID-002',
      name: 'Kennedy Katayamoyo',
      lastVisit: '2025-03-14',
      status: 'Pending',
      prescriptionId: 'RX-2025-002'
    },
    { 
      id: 'PID-003',
      name: 'Stacey Daza',
      lastVisit: '2025-03-13',
      status: 'Issued',
      prescriptionId: 'RX-2025-003'
    },
    {
      id: 'PID-004',
      name: 'Alice Banda',
      lastVisit: '2025-03-12',  
      status: 'Revoked',
      prescriptionId: 'RX-2025-004'
    }
  ];

  const MOCK_RECENT_PRESCRIPTIONS = [
    {
      id: 'RX-2025-001',
      patientName: 'John Banda',
      patientId: 'PID-001',
      medications: 'Paracetamol, Amoxicillin',
      issuedDate: '2025-03-15',
      status: 'Completed',
      diagnosis: 'Bacterial infection',
      dosage: 'Paracetamol 500mg, Amoxicillin 250mg',
      instructions: 'Take Paracetamol every 6 hours as needed for pain. Take Amoxicillin three times daily with meals.',
      expiryDate: '2025-04-15',
      dispensingPharmacist: 'Dr. Phiri',
      dispensingTimestamp: '2025-03-16T10:30:00Z'
    },
    {
      id: 'RX-2025-002',
      patientName: 'Mary Phiri',
      patientId: 'PID-005',
      medications: 'Ibuprofen',
      issuedDate: '2025-03-15',
      status: 'Pending',
      diagnosis: 'Joint inflammation',
      dosage: 'Ibuprofen 400mg',
      instructions: 'Take one tablet three times daily after meals.',
      expiryDate: '2025-04-15',
      dispensingPharmacist: 'N/A',
      dispensingTimestamp: 'N/A'
    },
    {
      id: 'RX-2025-003',
      patientName: 'James Mbewe',
      patientId: 'PID-008',
      medications: 'Aspirin, Magnesium',
      issuedDate: '2025-03-14',
      status: 'Completed',
      diagnosis: 'Hypertension',
      dosage: 'Aspirin 75mg, Magnesium 300mg',
      instructions: 'Take Aspirin once daily with breakfast. Take Magnesium once daily before bedtime.',
      expiryDate: '2025-04-14',
      dispensingPharmacist: 'Dr. Banda',
      dispensingTimestamp: '2025-03-15T14:45:00Z'
    },
    {
      id: 'RX-2025-004',
      patientName: 'Grace Chirwa',
      patientId: 'PID-012',
      medications: 'Metformin',
      issuedDate: '2025-03-14',
      status: 'Pending',
      diagnosis: 'Type 2 Diabetes',
      dosage: 'Metformin 500mg',
      instructions: 'Take one tablet twice daily with meals.',
      expiryDate: '2025-04-14',
      dispensingPharmacist: 'N/A',
      dispensingTimestamp: 'N/A'
    }
  ];

  const [patients] = useState(MOCK_PATIENTS);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);  
  
  const [verifiedPatient, setVerifiedPatient] = useState({
    name: localStorage.getItem('patientName') || 'Patient Name',
    id: localStorage.getItem('patientId') || 'PAT-ID'
  });
  const [prescriptionForm, setPrescriptionForm] = useState({
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', notes: '' }]
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedMeds, setSelectedMeds] = useState(new Set());
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(MOCK_PATIENTS);
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prescriptionSearchTerm, setPrescriptionSearchTerm] = useState('');
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [medicationIndex, setMedicationIndex] = useState(null);
  const [searchMedication, setSearchMedication] = useState('');  
  const [filteredRecentPrescriptions, setFilteredRecentPrescriptions] = useState([]);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [retrievedPatient, setRetrievedPatient] = useState(null);
  const [error, setError] = useState(null);
  const [isPatientVerified, setIsPatientVerified] = useState(false);  
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showPrescriptionDetailModal, setShowPrescriptionDetailModal] = useState(false);
  const [drugSearchTerm, setDrugSearchTerm] = useState('');
  const [drugSearchResults, setDrugSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [drugInteractions, setDrugInteractions] = useState([]);  
  const [selectedDrugDetails, setSelectedDrugDetails] = useState(null);
  const [loadingDrugDetails, setLoadingDrugDetails] = useState(false);
  const [activePrescriptionsCount, setActivePrescriptionsCount] = useState(0);
  const modalRef = useRef();
  
  // Function to fetch patient prescriptions
  const fetchPatientPrescriptions = async (patientId) => {
    if (!patientId) {
      setError('No patient ID provided');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/doctor/prescriptions`, {
        params: { patientId }
      });
      
      console.log('Fetched patient prescriptions:', response.data);
      
      if (response.data && response.data.data && response.data.data.prescriptions) {
        // Transform the data to match the expected format
        const formattedPrescriptions = response.data.data.prescriptions.map(prescription => ({
          id: prescription.prescriptionId || prescription.id,
          patientName: prescription.patientName || retrievedPatient?.name || 'Unknown Patient',
          patientId: prescription.patientId || patientId,
          date: prescription.issuedDate || prescription.date || new Date().toISOString(),
          medications: prescription.medicationName,
          status: prescription.status || 'Pending',
          dosage: prescription.dosage || 'Not specified',
          instructions: prescription.advice || prescription.instructions || 'No instructions provided',
          diagnosis: prescription.diagnosis || 'No diagnosis provided',
          expiryDate: prescription.expiryDate || new Date(new Date(prescription.date || prescription.issuedDate).setMonth(new Date(prescription.date || prescription.issuedDate).getMonth() + 1)).toISOString(),
          dispensingPharmacist: prescription.dispensingPharmacist || 'N/A',
          dispensingTimestamp: prescription.dispensingTimestamp || 'N/A'
        }));
        
        setRecentPrescriptions(formattedPrescriptions);
        setFilteredRecentPrescriptions(formattedPrescriptions);
      } else {
        setRecentPrescriptions([]);
        setFilteredRecentPrescriptions([]);
      }
    } catch (err) {
      console.error('Error fetching patient prescriptions:', err);
      setError(err.response?.data?.error || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch all doctor prescriptions
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
        // Transform the data to match the expected format
        const formattedPrescriptions = response.data.data.prescriptions.map(prescription => ({
          id: prescription.prescriptionId || prescription.id,
          patientName: prescription.patientName || 'Unknown Patient',
          patientId: prescription.patientId,
          date: prescription.issuedDate || prescription.date || new Date().toISOString(),
          medications: prescription.medicationName,
          status: prescription.status || 'Pending',
          dosage: prescription.dosage || 'Not specified',
          instructions: prescription.instructions || 'No instructions provided',
          diagnosis: prescription.diagnosis || 'No diagnosis provided',
          expiryDate: prescription.expiryDate || new Date(new Date(prescription.date || prescription.issuedDate).setMonth(new Date(prescription.date || prescription.issuedDate).getMonth() + 1)).toISOString(),
          dispensingPharmacist: prescription.dispensingPharmacist || 'N/A',
          dispensingTimestamp: prescription.dispensingTimestamp || 'N/A'
        }));
        
        setRecentPrescriptions(formattedPrescriptions);
        setFilteredRecentPrescriptions(formattedPrescriptions);
        
        // Count active prescriptions
        const activeCount = formattedPrescriptions.filter(p => 
          p.status === 'Active' || p.status === 'Pending' || p.status === 'Issued'
        ).length;
        setActivePrescriptionsCount(activeCount);
      } else {
        setRecentPrescriptions([]);        setFilteredRecentPrescriptions([]);
      }
    } catch (err) {
      console.error('Error fetching doctor prescriptions:', err);
      setError(err.response?.data?.error || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  // Check for verification when navigating to add-prescription view
  useEffect(() => {
    if (activeView === 'add-prescription' && !isPatientVerified && !showVerificationModal) {
      console.log('Navigated directly to add-prescription without verification');
      setShowVerificationModal(true);
    }
    
    // Check for patient data in URL after component mounts
    const checkUrlForPatientData = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const patientId = urlParams.get('patientId');
      const patientName = urlParams.get('patientName');
      
      if (patientId && patientName && isPatientVerified) {
        console.log('Found patient data in URL params:', { patientId, patientName });
        
        // Set the patient information
        const patientData = {
          id: patientId,
          name: patientName
        };
        
        setVerifiedPatient(patientData);
        setRetrievedPatient(patientData);
        
        // Show prescription modal with the verified data
        setShowPrescriptionModal(true);
        
        // Clear URL parameters to prevent reloading the same data on refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    checkUrlForPatientData();
    
    // Fetch prescriptions when the component mounts
    if (activeView === 'prescriptions') {
      fetchDoctorPrescriptions();
    }
  }, [activeView, isPatientVerified, showVerificationModal]);
    // Handle external prescription modal trigger
  useEffect(() => {
    if (externalPrescriptionModal) {
      // Check patient verification before showing prescription modal
      if (!isPatientVerified) {
        setShowVerificationModal(true);
      } else {
        setShowPrescriptionModal(true);
      }
      if (onCloseExternalPrescriptionModal) {
        onCloseExternalPrescriptionModal();
      }
    }
  }, [externalPrescriptionModal, onCloseExternalPrescriptionModal, isPatientVerified]);
  
  // Fetch prescriptions when the activeView is set to 'prescriptions'
  useEffect(() => {
    if (activeView === 'prescriptions') {
      fetchDoctorPrescriptions();
    }
  }, [activeView]);
  
  // Search for medications using OpenFDA API
  const searchDrugs = async (query) => {
    if (!query || query.length < 2) return;
    
    try {
      setIsSearching(true);
      console.log(`Searching for drug: "${query}"`);
      
      // First try the label endpoint with exact matching (original approach)
      const url = 'https://api.fda.gov/drug/label.json';
      const searchParams = {
        search: `openfda.brand_name:"${query}"~3 OR openfda.generic_name:"${query}"~3 OR openfda.substance_name:"${query}"~3`,
        limit: 10
      };
      
      console.log('Search parameters:', searchParams);
      let response = await axios.get(url, { params: searchParams });
      
      // If no results, try with a more relaxed search
      if (!response.data.results || response.data.results.length === 0) {
        console.log('No results with exact match, trying relaxed search');
        response = await axios.get(url, {
          params: {
            search: `${query}`,
            limit: 10
          }
        });
      }
      
      // If still no results, try using the drug/ndc endpoint
      if (!response.data.results || response.data.results.length === 0) {
        console.log('No results with label endpoint, trying drug/ndc endpoint');
        const ndcUrl = 'https://api.fda.gov/drug/ndc.json';
        response = await axios.get(ndcUrl, {
          params: {
            search: `generic_name:${query} OR brand_name:${query}`,
            limit: 10
          }
        });
        
        // Handle different response format from ndc endpoint
        if (response.data && response.data.results) {
          const drugs = response.data.results.map(result => {
            return {
              id: result.product_id || Math.random().toString(36).substring(2),
              brandName: result.brand_name || 'Unknown Brand',
              genericName: result.generic_name || 'Unknown Generic',
              substances: [result.substance_name].filter(Boolean),
              product_ndc: result.product_ndc || null,
              route: result.route || null,
              strength: result.dosage_form || null,
              fullData: result
            };
          });
          setDrugSearchResults(drugs);
          setIsSearching(false);
          return;
        }
      }
      
      // Process results from label endpoint
      if (response.data && response.data.results) {
        console.log(`Found ${response.data.results.length} results from OpenFDA API`);
        const drugs = response.data.results.map(result => {
          const brandNames = result.openfda?.brand_name || [];
          const genericNames = result.openfda?.generic_name || [];
          const substanceNames = result.openfda?.substance_name || [];
          
          return {
            id: result.id || result.openfda?.application_number?.[0] || Math.random().toString(36).substring(2),
            brandName: brandNames[0] || 'Unknown Brand',
            genericName: genericNames[0] || 'Unknown Generic',
            substances: substanceNames || [],
            product_ndc: result.openfda?.product_ndc?.[0] || null,
            route: result.openfda?.route?.[0] || null,
            strength: result.openfda?.product_type?.[0] || null,
            fullData: result
          };
        });
        setDrugSearchResults(drugs);
      } else {
        console.log('No results found in response');
        setDrugSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching drugs:', error);
      // Add more detailed error logging
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.statusText);
        console.error('Error data:', error.response.data);
      }
      setDrugSearchResults([]); // Clear results on error
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle selection of a drug from search results
  const handleDrugSelect = (drug) => {
    if (medicationIndex !== null) {
      handleMedicationChange(medicationIndex, 'name', drug.brandName);
      handleMedicationChange(medicationIndex, 'details', drug);
      fetchDrugDetails(drug.brandName, drug);
    }
  };
  
  // Fetch detailed information about a selected drug
  const fetchDrugDetails = async (drugName, drugData = null) => {
    try {
      setLoadingDrugDetails(true);
      
      // If we already have the drug data from search results
      if (drugData) {
        const details = {
          ...drugData,
          warnings: drugData.fullData.warnings || drugData.fullData.warnings_and_cautions || [],
          contraindications: drugData.fullData.contraindications || [],
          adverseReactions: drugData.fullData.adverse_reactions || [],
          dosageAndAdmin: drugData.fullData.dosage_and_administration || []
        };
        setSelectedDrugDetails(details);
      } else {
        // Otherwise search for it
        const url = 'https://api.fda.gov/drug/label.json';
        const response = await axios.get(url, {
          params: {
            search: `openfda.brand_name:"${drugName}"~3 OR openfda.generic_name:"${drugName}"~3`,
            limit: 1
          }
        });
        
        if (response.data && response.data.results && response.data.results.length > 0) {
          const result = response.data.results[0];
          const details = {
            brandName: result.openfda?.brand_name?.[0] || drugName,
            genericName: result.openfda?.generic_name?.[0] || 'Unknown Generic',
            warnings: result.warnings || result.warnings_and_cautions || [],
            contraindications: result.contraindications || [],
            adverseReactions: result.adverse_reactions || [],
            dosageAndAdmin: result.dosage_and_administration || [],
            drugClass: result.openfda?.pharm_class_epc || []
          };
          setSelectedDrugDetails(details);
        }
      }
    } catch (error) {
      console.error('Error fetching drug details:', error);
      if (error.response) {
        console.error(error.response.status, error.response.statusText);
      }
    } finally {
      setLoadingDrugDetails(false);
    }
  };
  
  // Handle medication form field changes
  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...prescriptionForm.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setPrescriptionForm({
      ...prescriptionForm,
      medications: updatedMedications
    });
  };

  const generateRandomString = (length) => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }
    return result;
  };
  
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
            redirect_uri: process.env.REACT_APP_ESIGNET_REDIRECT_URI_DOCTOR,
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
            setRetrievedPatient(verifiedPatientData);
            setVerifiedPatient(verifiedPatientData); // Update verifiedPatient state
            localStorage.setItem('patientName', verifiedPatientData.name);
            localStorage.setItem('patientId', verifiedPatientData.id);
            setIsPatientVerified(true); // Set verification flag
            setShowVerificationModal(false);
            
            // Redirect to prescriptions section with patient data in URL
            if (typeof handleNavigation === 'function') {
              handleNavigation('prescriptions');
              
              // Add patient data to URL for retrieval
              const searchParams = new URLSearchParams();
              searchParams.append('patientId', verifiedPatientData.id);
              searchParams.append('patientName', verifiedPatientData.name);
              window.history.pushState({}, '', `?${searchParams.toString()}`);
              
              // Automatically show prescription form after successful verification
              setShowPrescriptionModal(true);
            }
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
  }, [showVerificationModal, handleNavigation]);

  const handleAddPrescriptionClick = () => {
    console.log('Add Prescription button clicked!');
    
    // Check if patient is verified before showing prescription modal
    if (!retrievedPatient || !isPatientVerified) {
      console.log('Patient verification required');
      setShowVerificationModal(true);
      setError(null);
    } else {
      // Patient is already verified, show prescription modal
      console.log('Patient already verified, showing prescription modal');
      console.log('Setting showPrescriptionModal to true');
      setShowPrescriptionModal(true);
      console.log('Current showPrescriptionModal value:', showPrescriptionModal);
    }
    
    // Navigate to add-prescription view if not already there and handleNavigation is available
    if (activeView !== 'add-prescription' && typeof handleNavigation === 'function') {
      handleNavigation('add-prescription');
    }
  };
  const renderVerificationModal = () => {
    if (!showVerificationModal) return null;

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={(e) => {
          // Close modal when clicking on the backdrop
          if (e.target === e.currentTarget) {
            setShowVerificationModal(false);
          }
        }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full m-4">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Verify Patient</h3>
            <button
              onClick={() => setShowVerificationModal(false)}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <FiX className="h-6 w-6" />
            </button>
          </div>
          <div className="px-6 py-8">
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Please verify the patient's identity using eSignet to proceed
              </p>
              <div id="esignet-modal-button" className="flex justify-center"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render dashboard view
  const renderDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Prescription Statistics</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Prescriptions</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{MOCK_STATISTICS.activePrescriptions}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">High Risk Patients</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{MOCK_STATISTICS.highRiskPatients}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Patients</h3>
              <button 
                onClick={() => typeof handleNavigation === 'function' && handleNavigation('patients')}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {MOCK_PATIENTS.slice(0, 3).map(patient => (
                <div key={patient.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{patient.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last visit: {patient.lastVisit}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    patient.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
                    patient.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {patient.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Prescriptions</h3>
            <button 
              onClick={() => typeof handleNavigation === 'function' && handleNavigation('prescriptions')}
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm flex items-center"
            >
              View All
            </button>
          </div>
          <AppointmentsTable 
            appointments={MOCK_RECENT_PRESCRIPTIONS.map(prescription => ({
              id: prescription.id,
              patientName: prescription.patientName,
              patientId: prescription.patientId || 'N/A',
              date: prescription.issuedDate,
              status: prescription.status,
              medications: prescription.medications,
              dosage: prescription.dosage,
              instructions: prescription.instructions,
              diagnosis: prescription.diagnosis,
              expiryDate: prescription.expiryDate,
              dispensingPharmacist: prescription.dispensingPharmacist,
              dispensingTimestamp: prescription.dispensingTimestamp
            }))}
            isForPrescriptions={true}
            onRowClick={handlePrescriptionClick}
          />
        </div>
      </div>
    );
  };

  // Render patients view
  const renderPatients = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Patients</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-64"
              />
            </div>
          </div>
        </div>        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Patient List ({filteredPatients.length})
            </h3>
          </div>
          <AppointmentsTable
            appointments={filteredPatients.map(patient => ({
              id: patient.id,
              patientName: patient.name,
              patientId: patient.id,
              date: patient.lastVisit,
              status: patient.status,
              medications: patient.prescriptionId || 'No prescription'
            }))}
            isForPrescriptions={false}
            onRowClick={(patient) => {
              const foundPatient = filteredPatients.find(p => p.id === patient.patientId);
              if (foundPatient) {
                setSelectedPatient(foundPatient);
                setVerifiedPatient({
                  name: foundPatient.name,
                  id: foundPatient.id
                });
                setIsPatientVerified(true);
                setShowPrescriptionModal(true);
              }
            }}
          />
        </div>
      </div>
    );
  };  // Render prescriptions view using AppointmentsTable
  const renderPrescriptionsView = () => {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Prescriptions</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and issue prescriptions for your patients</p>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          {loading ? (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg text-sm">
              Loading prescriptions...
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-lg text-sm">
              {filteredRecentPrescriptions.length > 0 ? `${filteredRecentPrescriptions.length} prescriptions found` : 'No prescriptions found'}
            </div>
          )}
          
          <button 
            onClick={fetchDoctorPrescriptions}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Refresh
          </button>
        </div>
        
        <div className="mt-6">
          <AppointmentsTable 
            appointments={formatPrescriptionsForTable()} 
            isForPrescriptions={true}
            onRowClick={handlePrescriptionClick}
          />
        </div>
      </div>
    );
  };// Format prescriptions data for the AppointmentsTable component
  const formatPrescriptionsForTable = () => {
    // If we have fetched prescriptions from API, use those instead of mock data
    if (filteredRecentPrescriptions && filteredRecentPrescriptions.length > 0) {
      return filteredRecentPrescriptions.map(prescription => ({
        id: prescription.id,
        patientName: prescription.patientName,
        patientId: prescription.patientId,
        date: prescription.date,
        medications: prescription.medications,
        status: prescription.status,
        diagnosis: prescription.diagnosis || 'No diagnosis provided',
        dosage: prescription.dosage || 'Not specified',
        instructions: prescription.instructions || 'No instructions provided',
        expiryDate: prescription.expiryDate,
        dispensingPharmacist: prescription.dispensingPharmacist,
        dispensingTimestamp: prescription.dispensingTimestamp
      }));
    } else {
      // Fall back to mock data if API data isn't available
      return MOCK_RECENT_PRESCRIPTIONS.map(prescription => ({
        id: prescription.id,
        patientName: prescription.patientName,
        patientId: prescription.patientId,
        date: prescription.issuedDate,
        medications: prescription.medications,
        status: prescription.status,
        diagnosis: prescription.diagnosis || 'No diagnosis provided',
        dosage: '50mg', // Adding sample dosage for mock data
        instructions: 'Take one capsule every 8 hours', // Adding sample instructions for mock data
        expiryDate: new Date(new Date(prescription.issuedDate).setMonth(new Date(prescription.issuedDate).getMonth() + 1)).toISOString(),
        dispensingPharmacist: prescription.status === 'Completed' ? 'Dr. Phiri' : 'N/A',
        dispensingTimestamp: prescription.status === 'Completed' ? new Date().toISOString() : 'N/A'
      }));
    }
  };

  // Handle prescription selection
  const handlePrescriptionClick = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionDetailModal(true);
  };
  
  // Close prescription detail modal
  const closePrescriptionDetailModal = () => {
    setShowPrescriptionDetailModal(false);
    setSelectedPrescription(null);
  };

  // Main render function
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {activeView === 'prescriptions' ? (
        renderPrescriptionsView()
      ) : (
        // Render other content for different views
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Doctor Dashboard</h2>
        </div>
      )}
      
      {/* Prescription Detail Modal */}
      {showPrescriptionDetailModal && selectedPrescription && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closePrescriptionDetailModal}
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
                  onClick={closePrescriptionDetailModal}
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
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                      {selectedPrescription.dosage && selectedPrescription.dosage !== 'Not specified' 
                        ? selectedPrescription.dosage 
                        : "Not specified"}
                    </p>
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
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                      {selectedPrescription.instructions && selectedPrescription.instructions !== 'No instructions' 
                        ? selectedPrescription.instructions 
                        : "No instructions provided"}
                    </p>
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
      
      {/* Prescription Creation Modal */}
      {showPrescriptionModal && isPatientVerified && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            // Close modal when clicking on the backdrop
            if (e.target === e.currentTarget) {
              setShowPrescriptionModal(false);
            }
          }}
        >
          <div ref={modalRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[800px] max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700 px-8 py-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create New Prescription</h3>
                <button 
                  onClick={() => setShowPrescriptionModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Prescription modal content would go here */}
            <div className="p-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Creating prescription for patient: <span className="font-medium text-gray-900 dark:text-white">{verifiedPatient.name}</span>
              </p>
              
              {/* Prescription form would go here */}
            </div>
          </div>
        </div>
      )}
      
      {/* Medication Selection Modal */}
      {showMedicationModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            // Close modal when clicking on the backdrop
            if (e.target === e.currentTarget) {
              setShowMedicationModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[600px] max-h-[80vh] overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Select Medication</h3>
              <button onClick={() => setShowMedicationModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Medication selection content */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search medications..."
                  value={searchMedication}
                  onChange={(e) => setSearchMedication(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Categories</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(MEDICATION_CATEGORIES).map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        selectedCategory === category
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 max-h-60 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medications</h4>
                <div className="space-y-1">
                  {/* This would show filtered medications based on search and category */}
                  {(selectedCategory ? MEDICATION_CATEGORIES[selectedCategory] : MEDICATION_LIST)
                    .filter(med => !searchMedication || med.toLowerCase().includes(searchMedication.toLowerCase()))
                    .map(medication => (
                      <button
                        key={medication}
                        onClick={() => {
                          if (medicationIndex !== null) {
                            handleMedicationChange(medicationIndex, 'name', medication);
                            setShowMedicationModal(false);
                          }
                        }}
                        className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {medication}
                      </button>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Patient Modal */}
      {showPatientModal && selectedPatient && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            // Close modal when clicking on the backdrop
            if (e.target === e.currentTarget) {
              setShowPatientModal(false);
            }
          }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-[500px] max-h-[80vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Patient Details</h3>
              <button onClick={() => setShowPatientModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Patient ID</h4>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedPatient.id}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</h4>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedPatient.name}</p>
                </div>
                
                {selectedPatient.age && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</h4>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">{selectedPatient.age}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Visit</h4>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {selectedPatient.lastVisit ? new Date(selectedPatient.lastVisit).toLocaleDateString('en-GB') : 'N/A'}
                  </p>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setShowPatientModal(false);
                      // Additional handling for creating a prescription for this patient
                      setVerifiedPatient(selectedPatient);
                      setRetrievedPatient(selectedPatient);
                      setIsPatientVerified(true);
                      setShowPrescriptionModal(true);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                  >
                    Create Prescription
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorContent;

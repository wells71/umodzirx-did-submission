import React, { useState, useEffect } from 'react';
import { FiSearch, FiAlertCircle, FiCheck, FiUserCheck, FiX, FiCheckCircle, FiGrid, FiCreditCard } from 'react-icons/fi';
import PrescriptionQRScanner from '../PrescriptionQRScanner';
import StatusIndicator from '../common/StatusIndicator';
import LoadingSpinner from '../common/LoadingSpinner';
import prescriptionService from '../../services/prescriptionService';
import patientService from '../../services/patientService';
import { navigateTo, verificationHandlers } from '../../utils/navigationUtils';

/**
 * PharmacistVerifyContent - Component for pharmacists to verify and dispense prescriptions
 */
const PharmacistVerifyContent = () => {
  // DEBUGGING FLAG - Set to true to enable verbose logging
  const DEBUG_MODE = true;
  
  // Force dump debugging info to verify console is working
  useEffect(() => {
    // This will write to console when component mounts
    if (DEBUG_MODE) {
      console.log('%c PHARMACY DEBUG MODE ENABLED ', 'background: #222; color: #bada55; font-size: 16px;');
      alert('DEBUG MODE: Check console for logs');
      
      // Try different console methods in case one works
      console.log('Standard log test');
      console.warn('Warning log test');
      console.error('Error log test');
      
      // Log directly to document for maximum visibility
      const debugDiv = document.createElement('div');
      debugDiv.style.position = 'fixed';
      debugDiv.style.bottom = '10px';
      debugDiv.style.right = '10px';
      debugDiv.style.backgroundColor = 'rgba(0,0,0,0.8)';
      debugDiv.style.color = '#00ff00';
      debugDiv.style.padding = '10px';
      debugDiv.style.zIndex = '9999';
      debugDiv.style.maxHeight = '200px';
      debugDiv.style.overflow = 'auto';
      debugDiv.style.maxWidth = '400px';
      debugDiv.style.fontSize = '10px';
      debugDiv.style.fontFamily = 'monospace';
      debugDiv.id = 'debug-console';
      debugDiv.innerHTML = '<strong>Debug Console</strong><br>';
      document.body.appendChild(debugDiv);
      
      // Helper function to log to both console and our debug div
      window.debugLog = function(tag, message, data) {
        const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
        const fullMessage = `[${timestamp}][${tag}] ${message}`;
        
        console.log(fullMessage, data !== undefined ? data : '');
        
        const debugDiv = document.getElementById('debug-console');
        if (debugDiv) {
          const msgElement = document.createElement('div');
          msgElement.innerHTML = `<span style="color:#aaa">${timestamp}</span> <span style="color:#ff6">[${tag}]</span> ${message}`;
          
          if (data) {
            try {
              msgElement.innerHTML += `<br><span style="color:#aaa">${JSON.stringify(data).substring(0, 100)}${JSON.stringify(data).length > 100 ? '...' : ''}</span>`;
            } catch (e) {
              msgElement.innerHTML += `<br><span style="color:#aaa">[Complex data]</span>`;
            }
          }
          
          debugDiv.appendChild(msgElement);
          debugDiv.scrollTop = debugDiv.scrollHeight;
          
          // Limit to 50 messages
          while (debugDiv.childNodes.length > 51) {
            debugDiv.removeChild(debugDiv.childNodes[1]);
          }
        }
      };
      
      window.debugLog('INIT', 'Debug console initialized');
    }
  }, []);
  
  // Main states
  const [verificationMethod, setVerificationMethod] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  
  // Prescription verification states
  const [scannedPrescription, setScannedPrescription] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'pending', 'verified', 'failed'
  const [isDispensing, setIsDispensing] = useState(false);
  const [dispensingSuccess, setDispensingSuccess] = useState(false);
  const [dispensingNotes, setDispensingNotes] = useState('Medication dispensed as prescribed'); // Initialize with default value
  
  // Optional states for additional functionality
  const [patientId, setPatientId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Debug dispensing notes state
  useEffect(() => {
    if (DEBUG_MODE) {
      window.debugLog('STATE', 'Dispensing notes updated', dispensingNotes);
    }
  }, [dispensingNotes]);
  
  // Handle verify button click - use the verificationHandlers from navigationUtils
  const handleVerifyClick = () => {
    if (DEBUG_MODE) {
      window.debugLog('VERIFY', 'Verify button clicked');
    }
    // Use the pharmacist verification handler
    verificationHandlers.pharmacist.handleVerifyClick();
  };
  
  // Sample patient data for fallback/testing
  const samplePatients = [
    {
      id: 'PID-001',
      name: 'John Banda',
      dateOfBirth: '1985-06-15',
      gender: 'Male',
      nationalId: 'NAT12345678',
      address: '123 Lusaka Street, Lusaka',
      phoneNumber: '+260 97 1234567',
      email: 'john.banda@example.com',
      allergies: ['Penicillin', 'Peanuts'],
      bloodType: 'O+',
      prescriptions: [
        {
          id: 'rx-001',
          date: '2025-05-13T09:30:00',
          medications: 'Panado, Bufen 400mg',
          status: 'Pending',
          doctor: 'Dr. Emily Morgan'
        },
        {
          id: 'rx-003',
          date: '2025-04-15T14:20:00',
          medications: 'Amoxicillin 250mg',
          status: 'Dispensed',
          doctor: 'Dr. James Wilson'
        }
      ]
    },
    {
      id: 'PID-005',
      name: 'Mary Phiri',
      dateOfBirth: '1990-03-22',
      gender: 'Female',
      nationalId: 'NAT87654321',
      address: '45 Ndola Road, Ndola',
      phoneNumber: '+260 96 7654321',
      email: 'mary.phiri@example.com',
      allergies: ['Sulfa drugs'],
      bloodType: 'A+',
      prescriptions: [
        {
          id: 'rx-002',
          date: '2025-05-12T11:00:00',
          medications: 'Amoxicillin 500mg',
          status: 'Verified',
          doctor: 'Dr. James Wilson'
        }
      ]
    }
  ];

  /**
   * Handle prescription QR scan result
   * 
   * @param {Object} data - Prescription data from QR scan
   */
  const handleQRScan = async (data) => {
    // Reset states and set pending status
    setScannedPrescription(data);
    setVerificationStatus('pending');
    setError('');
    setSearchResult(null);
    
    try {
      // Call prescription service to verify prescription
      const response = await prescriptionService.verifyPrescription(
        data.prescriptionId || data.id,
        data.patientId
      );
      
      if (response.success) {
        setVerificationStatus('verified');
        
        // Fetch patient details based on the scanned prescription
        try {
          const patientResponse = await patientService.getPatientDetails(data.patientId);
          
          if (patientResponse.success) {
            setSearchResult(patientResponse.data);
            setShowPatientDetails(true);
          }
        } catch (patientErr) {
          console.error("Error fetching patient details:", patientErr);
          // Even if patient fetch fails, we can still show the prescription verification
        }
      } else {
        setVerificationStatus('failed');
        setError(response.message || 'Verification failed');
      }
    } catch (err) {
      setVerificationStatus('failed');
      setError(err.response?.data?.message || 'Error verifying prescription with blockchain');
    }
  };

  /**
   * Handle dispensing medication after verification
   */
  const handleDispenseMedication = async () => {
    // DEBUG: Function called - starting medication dispensing process
    if (DEBUG_MODE) {
      window.debugLog('DISPENSE', 'Starting medication dispensing process');
      // Force alert to ensure we're seeing something
      alert('Dispensing medication - Check console and debug panel');
    }
    
    // Verify that we have a prescription and it's verified before proceeding
    if (!scannedPrescription || verificationStatus !== 'verified') {
      const errorInfo = {
        hasScannedPrescription: !!scannedPrescription,
        verificationStatus
      };
      
      if (DEBUG_MODE) {
        window.debugLog('DISPENSE_ERROR', 'Cannot dispense: Missing prescription or not verified', errorInfo);
      }
      
      setError('Cannot dispense: Prescription must be verified first');
      return;
    }
    
    // Make sure dispensingNotes is defined
    const notesToUse = dispensingNotes || '';
    
    // DEBUG: Log prescription data and notes
    if (DEBUG_MODE) {
      window.debugLog('DISPENSE', 'Current prescription data', scannedPrescription);
      window.debugLog('DISPENSE', 'Using notes', notesToUse);
    }
    
    // Skip validation temporarily to check if that's causing the issue
    // We'll still use the notes but won't block the process
    // if (!notesToUse || notesToUse.trim() === '') {
    //   setError('Please enter comment before dispensing');
    //   return;
    // }
    
    setIsDispensing(true);
    setError('');
    
    try {
      // Create dispensing data object with fallbacks for all required fields
      const prescriptionId = scannedPrescription.prescriptionId || 
                             scannedPrescription.id || 
                             'unknown-prescription-id';
      
      const patientId = scannedPrescription.patientId || 
                        (searchResult ? searchResult.id : 'unknown-patient-id');
      
      const pharmacistId = localStorage.getItem('pharmacistId') || 
                           localStorage.getItem('userId') || 
                           'unknown-pharmacist-id';
      
      // DEBUG: Log the resolved IDs
      console.log('[DISPENSE] Resolved IDs for request:', {
        prescriptionId,
        patientId,
        pharmacistId
      });
      
      const dispensingData = {
        prescriptionId: prescriptionId,
        patientId: patientId,
        pharmacistId: pharmacistId,
        notes: notesToUse.trim(), // Try both field names in case API expects one or the other
        note: notesToUse.trim(),
        dispensedAt: new Date().toISOString()
      };
      
      // DEBUG: Log the complete dispensing data being sent
      if (DEBUG_MODE) {
        window.debugLog('DISPENSE', 'Sending dispensing data', dispensingData);
        window.debugLog('DISPENSE', 'Calling prescription service dispensePrescription method...');
      }
      
      // Call prescription service to dispense medication
      const response = await prescriptionService.dispensePrescription(dispensingData);
      
      // DEBUG: Log successful API response
      if (DEBUG_MODE) {
        window.debugLog('DISPENSE', 'Dispense response received', response);
      }
      
      // DEBUG: Parse blockchain response if available
      if (response && response.blockchainResponse) {
        console.log('[DISPENSE] Raw blockchain response:', response.blockchainResponse);
        
        // Try to parse blockchain response if it's a string
        if (typeof response.blockchainResponse === 'string') {
          try {
            // Check if response has a "Response:" prefix and extract just the JSON part
            if (response.blockchainResponse.includes('Response:')) {
              console.log('[PARSE] Detected "Response:" prefix, extracting JSON part');
              const jsonPart = response.blockchainResponse.split('Response:')[1].trim();
              const parsedResponse = JSON.parse(jsonPart);
              console.log('[PARSE] Successfully parsed blockchain response:', parsedResponse);
            } else {
              const parsedResponse = JSON.parse(response.blockchainResponse);
              console.log('[PARSE] Successfully parsed blockchain response:', parsedResponse);
            }
          } catch (parseErr) {
            console.error('[PARSE ERROR] Failed to parse blockchain response:', parseErr);
          }
        }
      }
      
      if (response && response.success) {
        // DEBUG: Success path
        console.log('[DISPENSE] Medication dispensed successfully');
        setDispensingSuccess(true);
        setDispensingNotes('Medication dispensed as prescribed'); // Reset to default value
        
        // Update the status of the prescription
        setScannedPrescription(prev => ({
          ...prev,
          status: 'Dispensed'
        }));
        
        // If we have patient data with prescriptions, update that too
        if (searchResult && searchResult.prescriptions) {
          const updatedPrescriptions = searchResult.prescriptions.map(p => {
            if (p.id === prescriptionId) {
              return { ...p, status: 'Dispensed' };
            }
            return p;
          });
          
          setSearchResult(prev => ({
            ...prev,
            prescriptions: updatedPrescriptions
          }));
        }
      } else {
        // DEBUG: API call succeeded but returned error
        console.error('[DISPENSE ERROR] API returned error:', response?.message || 'Unknown error');
        setError(response?.message || 'Failed to dispense medication. Please try again.');
      }
    } catch (err) {
      // DEBUG: Log detailed error information
      if (DEBUG_MODE) {
        window.debugLog('DISPENSE_EXCEPTION', 'Error occurred', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        
        if (err.response) {
          window.debugLog('DISPENSE_ERROR', 'Error response data', err.response.data);
          window.debugLog('DISPENSE_ERROR', 'Error status', err.response.status);
        }
        
        if (err.request && !err.response) {
          window.debugLog('DISPENSE_NETWORK', 'Network error - no response received', {
            url: err.request.url,
            method: err.request.method
          });
        }
      }
      
      // Improved error handling with detailed logging
      if (err.response) {
        console.error('[DISPENSE ERROR] Error response data:', err.response.data);
        console.error('[DISPENSE ERROR] Error response status:', err.response.status);
        console.error('[DISPENSE ERROR] Error response headers:', err.response.headers);
      }
      
      // DEBUG: Network errors
      if (err.request && !err.response) {
        console.error('[DISPENSE NETWORK ERROR] Request was made but no response received');
        console.error('[DISPENSE NETWORK ERROR] Request details:', err.request);
      }
      
      setError(
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message || 
        'Error dispensing medication. Please try again.'
      );
    } finally {
      if (DEBUG_MODE) {
        window.debugLog('DISPENSE', 'Process completed');
      }
      setIsDispensing(false);
    }
  };

  /**
   * Handle form submission for eSignet verification and demo mode
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setError('');
    setScannedPrescription(null);
    
    // Simulate server response
    setTimeout(() => {
      if (verificationMethod === 'scan') {
        // Simulate scan result
        setSearchResult(samplePatients[0]);
      } else if (verificationMethod === 'esignet') {
        // Simulate eSignet verification
        setSearchResult(samplePatients[1]);
      }
      
      setIsSearching(false);
    }, 1500);
  };

  /**
   * Change verification method and reset states
   */
  const handleVerificationMethodChange = (method) => {
    // Reset all states when switching methods
    setVerificationMethod(method);
    setPatientId('');
    setSearchResult(null);
    setError('');
    setScannedPrescription(null);
    setVerificationStatus(null);
    setDispensingSuccess(false);
    setDispensingNotes('Medication dispensed as prescribed');
  };

  /**
   * Show patient details modal
   */
  const handleShowPatientDetails = () => {
    setShowPatientDetails(true);
  };

  /**
   * Close patient details modal
   */
  const handleClosePatientDetails = () => {
    setShowPatientDetails(false);
  };
  
  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6">
      {/* Debug Info Display (always visible in debug mode) */}
      {DEBUG_MODE && (
        <div className="bg-gray-900 text-green-400 p-2 rounded text-xs font-mono mb-4 overflow-auto max-h-32">
          <div className="font-bold mb-1">Debug Information:</div>
          <div>Verification Method: {verificationMethod || 'None'}</div>
          <div>Verification Status: {verificationStatus || 'None'}</div>
          <div>Has Scanned Prescription: {scannedPrescription ? 'Yes' : 'No'}</div>
          <div>Is Dispensing: {isDispensing ? 'Yes' : 'No'}</div>
          <div>Dispensing Success: {dispensingSuccess ? 'Yes' : 'No'}</div>
          <div>Error: {error || 'None'}</div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Prescription Verification</h1>
        <p className="text-gray-600 dark:text-gray-400">Verify and dispense patient prescriptions</p>
      </div>
      
      {/* Back Button when in a verification method */}
      {verificationMethod && !searchResult && !scannedPrescription && (
        <button 
          onClick={() => setVerificationMethod('')}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to verification methods
        </button>
      )}
      
      {/* Unified Verification Method Selection - only show if no active verification or results */}
      {!verificationMethod && !searchResult && !scannedPrescription && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Select Verification Method
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button 
              onClick={() => handleVerificationMethodChange('scan')}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700"
            >
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
                <FiGrid className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">QR Code Scan</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Scan prescription QR code to verify and dispense medication
              </p>
            </button>
            
            <button 
              onClick={() => handleVerificationMethodChange('esignet')}
              className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl transition-all hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700"
            >
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full mb-4">
                <FiCreditCard className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">eSignet Verification</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Verify patient using their eSignet ID card
              </p>
            </button>
          </div>
        </div>
      )}
        
      {/* QR Scanner Section */}
      {verificationMethod === 'scan' && !searchResult && !scannedPrescription && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Scan Prescription QR Code
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                Pharmacist Mode
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Scan a prescription QR code to verify against blockchain and dispense medication
            </p>
            <div className="mb-4">
              <PrescriptionQRScanner onScan={handleQRScan} isPharmacist={true} />
            </div>
          </div>
        </div>
      )}

      {/* eSignet Verification Section */}
      {verificationMethod === 'esignet' && !searchResult && !scannedPrescription && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            eSignet Verification
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            Verify patient identity using their eSignet ID card for secure access to prescriptions
          </p>
          
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <FiCreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Request patient to scan their eSignet ID</p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">or use the simulation button below for testing</p>
            
            <button
              onClick={handleSubmit}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <FiCheck className="mr-2 -ml-1 h-4 w-4" />
              Simulate eSignet Verification
            </button>
          </div>
          
          {isSearching && (
            <div className="mt-6 flex justify-center">
              <LoadingSpinner size="md" text="Verifying patient..." />
            </div>
          )}
        </div>
      )}

      {/* Verification Status Display */}
      {scannedPrescription && verificationStatus && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Prescription Verification
            </h2>
            <StatusIndicator status={verificationStatus} />
          </div>
          
          {verificationStatus === 'pending' && (
            <div className="flex flex-col items-center justify-center py-6">
              <LoadingSpinner size="lg" text="Verifying prescription..." />
            </div>
          )}
          
          {verificationStatus === 'verified' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <FiCheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Prescription Verified</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This prescription has been verified and is ready to be dispensed
                  </p>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Prescription Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Prescription ID</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {scannedPrescription.prescriptionId || scannedPrescription.id || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {scannedPrescription.patientId || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date Issued</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {scannedPrescription.date ? new Date(scannedPrescription.date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Prescribed By</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {scannedPrescription.doctor || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              {!dispensingSuccess && (
                <div className="mt-6">
                  {/* Add dispensing notes field */}
                  <div className="mb-4">
                    <label htmlFor="dispensingNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dispensing Notes <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="dispensingNotes"
                      name="dispensingNotes"
                      rows="3"
                      value={dispensingNotes || ''}
                      onChange={(e) => setDispensingNotes(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-700 dark:bg-gray-800 rounded-md"
                      placeholder="Enter dispensing notes or comments (required)"
                      required
                    ></textarea>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Please enter a comment before dispensing the medication
                    </p>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      onClick={handleDispenseMedication}
                      disabled={isDispensing}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDispensing ? (
                        <>
                          <LoadingSpinner size="sm" color="white" />
                          <span className="ml-2">Processing...</span>
                        </>
                      ) : (
                        <>
                          <FiCheck className="mr-2 -ml-1 h-4 w-4" />
                          Dispense Medication
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              
              {dispensingSuccess && (
                <div className="flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-6">
                  <FiCheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Medication successfully dispensed
                  </p>
                </div>
              )}
            </div>
          )}
          
          {verificationStatus === 'failed' && (
            <div className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <FiAlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Verification Failed</h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error || 'Unable to verify this prescription. Please try again or contact support.'}
                </p>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setScannedPrescription(null);
                setVerificationStatus(null);
                setError('');
                setDispensingSuccess(false);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FiX className="mr-2 -ml-1 h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Patient Details Section */}
      {showPatientDetails && searchResult && (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Patient Details
            </h2>
            <button
              onClick={handleClosePatientDetails}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-4">
                <FiUserCheck className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">{searchResult.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {searchResult.id} • DOB: {new Date(searchResult.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Personal Information</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                    <p className="text-sm text-gray-900 dark:text-white">{searchResult.gender}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">National ID</p>
                    <p className="text-sm text-gray-900 dark:text-white">{searchResult.nationalId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Contact</p>
                    <p className="text-sm text-gray-900 dark:text-white">{searchResult.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="text-sm text-gray-900 dark:text-white">{searchResult.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Medical Information</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Blood Type</p>
                    <p className="text-sm text-gray-900 dark:text-white">{searchResult.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Allergies</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {searchResult.allergies && searchResult.allergies.length > 0 ? (
                        searchResult.allergies.map((allergy, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          >
                            {allergy}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">No known allergies</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Prescriptions Section */}
            {searchResult.prescriptions && searchResult.prescriptions.length > 0 && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Prescriptions</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Medications
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Doctor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {searchResult.prescriptions.map((prescription) => (
                        <tr key={prescription.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {prescription.id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(prescription.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {prescription.medications}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <StatusIndicator status={prescription.status} size="sm" />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {prescription.doctor}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistVerifyContent;
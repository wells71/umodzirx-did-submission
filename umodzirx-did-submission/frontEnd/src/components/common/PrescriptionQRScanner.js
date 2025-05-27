import React, { useState, useRef, useEffect } from 'react';
import { isValidPrescriptionQR } from '../../utils/qrUtils';
import QrScanner from 'react-qr-scanner';
import axios from 'axios';
import { FiCheckCircle, FiAlertCircle, FiLoader, FiX } from 'react-icons/fi';

/**
 * A component that allows both camera scanning and manual input of prescription QR codes
 * with additional functionality for pharmacists to dispense medications
 */
const PrescriptionQRScanner = ({ onScan, isPharmacist = false }) => {
  const [manualInput, setManualInput] = useState('');
  const [error, setError] = useState('');
  const [scanActive, setScanActive] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [scannedPrescription, setScannedPrescription] = useState(null);
  const [prescriptionDetails, setPrescriptionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const [dispensingSuccess, setDispensingSuccess] = useState(false);
  const [dispensingError, setDispensingError] = useState(null);
  const [dispensingNote, setDispensingNote] = useState('');
  const qrReaderRef = useRef(null);
  
  // Reset states when component unmounts
  useEffect(() => {
    return () => {
      setScannedPrescription(null);
      setPrescriptionDetails(null);
      setDispensingSuccess(false);
      setDispensingError(null);
    };
  }, []);

  // Handle camera scan result
  const handleCameraScan = (result) => {
    if (result) {
      try {
        const data = JSON.parse(result.text);
        
        if (isValidPrescriptionQR(data)) {
          // Stop scanning once we've got a valid result
          setScanActive(false);
          processScannedData(data);
        }
      } catch (err) {
        // We don't set error here as camera will continuously attempt to scan
        console.error("Failed to process QR scan", err);
      }
    }
  };

  // Handle manual QR code input
  const handleManualScan = () => {
    setError('');
    try {
      // Try to parse the input as JSON
      const data = JSON.parse(manualInput);
      
      // Validate the QR data
      if (isValidPrescriptionQR(data)) {
        processScannedData(data);
      } else {
        setError('Invalid prescription QR code data');
      }
    } catch (err) {
      setError('Invalid QR code data format');
    }
  };
  
  // Process the scanned QR code data
  const processScannedData = async (data) => {
    setScannedPrescription(data);
    
    // If pharmacist mode is active, fetch prescription details from blockchain
    if (isPharmacist) {
      setLoading(true);
      setError('');
      
      try {
        // Query the blockchain for prescription details
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/pharmacist/prescriptions`, {
          params: {
            patientId: data.patientId
          }
        });
        
        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to fetch prescription details');
        }
        
        // Find the specific prescription in the patient's prescriptions
        const prescriptions = response.data.data.prescriptions || [];
        const matchingPrescription = prescriptions.find(p => 
          (p.prescriptionId === data.prescriptionId) || (p.id === data.prescriptionId)
        );
        
        if (matchingPrescription) {
          setPrescriptionDetails(matchingPrescription);
        } else {
          setError('Prescription not found in blockchain records');
        }
      } catch (err) {
        console.error('Error fetching prescription details:', err);
        setError(err.response?.data?.error || err.message || 'Failed to fetch prescription details');
      } finally {
        setLoading(false);
      }
    }
    
    // Call the parent component's onScan handler
    onScan(data);
  };
  
  // Handle dispensing the medication
  const handleDispenseMedication = async () => {
    if (!scannedPrescription || !prescriptionDetails) return;
    
    setDispensing(true);
    setDispensingError(null);
    
    try {
      // Get pharmacist ID from localStorage with fallback
      const pharmacistId = localStorage.getItem('userId') || '879861538';
      
      // Prepare dispensing data
      const dispensingData = {
        patientId: scannedPrescription.patientId,
        prescriptionId: scannedPrescription.prescriptionId || scannedPrescription.id,
        pharmacistId: pharmacistId,
        comment: dispensingNote
      };
      
      // Call the dispensing endpoint
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/pharmacist/dispense`,
        dispensingData
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || response.data.message || 'Failed to dispense medication');
      }
      
      // Set success state
      setDispensingSuccess(true);
      
      // Clear form
      setDispensingNote('');
      
      // After 3 seconds, reset the scanner
      setTimeout(() => {
        setScannedPrescription(null);
        setPrescriptionDetails(null);
        setDispensingSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error dispensing medication:', err);
      setDispensingError(err.response?.data?.error || err.message || 'Failed to dispense medication');
    } finally {
      setDispensing(false);
    }
  };
  
  const handleScanError = (err) => {
    console.error("QR Scanner error:", err);
    setScannerError(err);
  };
  
  const toggleCamera = () => {
    setScanActive(prev => !prev);
  };
  
  const resetScanner = () => {
    setScannedPrescription(null);
    setPrescriptionDetails(null);
    setDispensingSuccess(false);
    setDispensingError(null);
    setError('');
  };
  
  // Render the prescription details section
  const renderPrescriptionDetails = () => {
    if (!scannedPrescription) return null;
    
    return (
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
          Scanned Prescription
        </h4>
        
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <FiLoader className="animate-spin h-8 w-8 text-blue-500" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading prescription details...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <FiAlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700 dark:text-red-300 font-medium">Error</span>
            </div>
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
            <button 
              onClick={resetScanner}
              className="mt-3 px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        ) : prescriptionDetails || !isPharmacist ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Patient</p>
                <p className="font-medium">{scannedPrescription.patientName}</p>
                <p className="text-xs text-gray-500">ID: {scannedPrescription.patientId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Medication</p>
                <p className="font-medium">{scannedPrescription.medication}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Dosage</p>
                <p className="font-medium">{scannedPrescription.dosage || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className={`font-medium ${
                  scannedPrescription.status === 'Dispensed' ? 'text-green-600' : 
                  scannedPrescription.status === 'Pending' ? 'text-yellow-600' : 'text-blue-600'
                }`}>
                  {scannedPrescription.status || 'Active'}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Instructions</p>
              <p className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded mt-1">
                {scannedPrescription.instructions || 'No specific instructions provided'}
              </p>
            </div>
            
            {isPharmacist && (
              <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                {dispensingSuccess ? (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                    <FiCheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h5 className="font-medium text-green-700 dark:text-green-300">Medication Dispensed Successfully</h5>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      The prescription has been marked as dispensed in the blockchain.
                    </p>
                  </div>
                ) : dispensingError ? (
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiAlertCircle className="h-5 w-5 text-red-500 mr-2" />
                      <span className="text-red-700 dark:text-red-300 font-medium">Dispensing Failed</span>
                    </div>
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{dispensingError}</p>
                    <button 
                      onClick={() => setDispensingError(null)}
                      className="mt-3 px-3 py-1.5 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <>
                    <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Dispense Medication</h5>
                    
                    <div className="mb-4">
                      <label htmlFor="dispensing-note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dispensing Note (Optional)
                      </label>
                      <textarea
                        id="dispensing-note"
                        value={dispensingNote}
                        onChange={(e) => setDispensingNote(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300"
                        rows={2}
                        placeholder="Add any notes about this dispensation"
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={resetScanner}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 mr-3"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDispenseMedication}
                        disabled={dispensing}
                        className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center ${
                          dispensing ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {dispensing && <FiLoader className="animate-spin h-4 w-4 mr-2" />}
                        {dispensing ? 'Processing...' : 'Dispense Medication'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  };
  
  // Render the component
  if (isPharmacist && scannedPrescription) {
    // If we already have a scanned prescription and we're in pharmacist mode, show only the prescription details
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Prescription Dispensing
          </h3>
          <button 
            onClick={resetScanner}
            className="text-gray-400 hover:text-gray-500"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        
        {renderPrescriptionDetails()}
      </div>
    );
  }
  
  // Otherwise show the scanner UI
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        {isPharmacist ? 'Scan Prescription to Verify & Dispense' : 'Prescription Verification'}
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-center mb-4">
          <button
            onClick={toggleCamera}
            className={`px-4 py-2 rounded-md transition-colors ${
              scanActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {scanActive ? 'Stop Camera' : 'Start Camera Scan'}
          </button>
        </div>
        
        {scanActive && (
          <div className="bg-gray-100 rounded-lg p-2 mb-4">
            <div className="aspect-square max-w-md mx-auto overflow-hidden rounded-lg">
              <QrScanner
                ref={qrReaderRef}
                delay={300}
                onError={handleScanError}
                onScan={handleCameraScan}
                style={{ width: '100%' }}
                facingMode="environment"
              />
              {scannerError && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg p-4 max-w-xs text-center">
                    <FiAlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <h5 className="font-medium text-gray-900 mb-1">Camera Error</h5>
                    <p className="text-sm text-gray-600 mb-3">
                      {scannerError.message || 'Failed to access camera. Please check permissions.'}
                    </p>
                    <button
                      onClick={() => setScannerError(null)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">
            Manual QR Code Input
          </h4>
          
          <div className="mb-3">
            <label htmlFor="manual-qr-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Enter QR Code Data (JSON format)
            </label>
            <textarea
              id="manual-qr-input"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-300"
              rows={4}
              placeholder='{"patientId": "123456", "prescriptionId": "RX789", "medication": "Amoxicillin"}'
            />
          </div>
          
          {error && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded">
              {error}
            </div>
          )}
          
          <button
            onClick={handleManualScan}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Verify QR Code
          </button>
        </div>
        
        <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isPharmacist 
              ? 'Scan a prescription QR code to verify and dispense medication to the patient.'
              : 'Scan a prescription QR code to verify its authenticity.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionQRScanner;
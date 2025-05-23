import React, { useState, useEffect } from 'react';
import { FiCamera, FiX } from 'react-icons/fi';

/**
 * PrescriptionQRScanner - A component for scanning QR codes
 * 
 * @param {Object} props
 * @param {Function} props.onScan - Callback function when QR code is scanned
 * @param {boolean} props.isPharmacist - Whether the scanner is being used by a pharmacist
 */
const PrescriptionQRScanner = ({ onScan, isPharmacist = false }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  
  // Mock QR code data for testing
  const mockQRData = {
    prescriptionId: 'rx-001',
    patientId: 'PID-001',
    date: '2025-05-13T09:30:00',
    medications: 'Panado, Bufen 400mg',
    status: isPharmacist ? 'Verified' : 'Pending',
    doctor: 'Dr. Emily Morgan'
  };
  
  // Function to handle starting the scanner
  const startScanner = () => {
    setScanning(true);
    setError('');
    
    // In a real implementation, we would initialize the camera and QR scanner here
    // For this demo, we'll simulate a scan after a delay
    setTimeout(() => {
      handleScan(mockQRData);
    }, 2000);
  };
  
  // Function to handle stopping the scanner
  const stopScanner = () => {
    setScanning(false);
  };
  
  // Function to handle successful scan
  const handleScan = (data) => {
    if (data) {
      setScanning(false);
      onScan(data);
    }
  };
  
  // Function to handle scanner errors
  const handleError = (err) => {
    console.error('QR Scanner Error:', err);
    setError('Failed to access camera. Please check permissions and try again.');
    setScanning(false);
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up any camera resources if needed
      stopScanner();
    };
  }, []);
  
  return (
    <div className="w-full">
      {!scanning ? (
        <div className="flex flex-col items-center">
          <button
            onClick={startScanner}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiCamera className="mr-2 -ml-1 h-4 w-4" />
            {isPharmacist ? 'Scan Prescription QR Code' : 'Scan QR Code'}
          </button>
          
          {error && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          
          {/* For demo purposes, add a note about simulation */}
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic">
            Note: This is a simulation. In a real app, this would access your camera.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Mock camera view */}
          <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
            <div className="text-white text-center p-4">
              <div className="animate-pulse mb-2">Scanning...</div>
              <div className="w-48 h-48 border-2 border-white/50 mx-auto relative">
                <div className="absolute inset-0 border-t-2 border-blue-500 animate-scan"></div>
              </div>
            </div>
          </div>
          
          {/* Stop scanning button */}
          <button
            onClick={stopScanner}
            className="absolute top-2 right-2 p-1 rounded-full bg-gray-800/70 text-white hover:bg-gray-700/70"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PrescriptionQRScanner;
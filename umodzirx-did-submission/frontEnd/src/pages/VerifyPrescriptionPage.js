import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import PrescriptionQRScanner from '../components/common/PrescriptionQRScanner';
import axios from 'axios';

const VerifyPrescriptionPage = () => {
  const { id } = useParams();
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Function to verify prescription using the backend API
  const verifyPrescription = async (prescriptionData) => {
    setLoading(true);
    setError('');
    
    try {
      // Generate a prescriptionId from either the data or URL parameter
      const prescriptionId = prescriptionData.prescriptionId || prescriptionData.id || id;
      
      if (!prescriptionId) {
        throw new Error('No prescription ID found');
      }
      
      // Call backend verification API
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}/prescriptions/verify/${prescriptionId}`);
      
      if (response.data.success) {
        setVerificationResult({
          ...response.data.data,
          verified: true,
          scannedData: prescriptionData
        });
      } else {
        setError(response.data.error || 'Failed to verify prescription');
        setVerificationResult({
          verified: false,
          scannedData: prescriptionData
        });
      }
    } catch (err) {
      setError(err.message || 'Error verifying prescription');
      setVerificationResult({
        verified: false,
        scannedData: prescriptionData
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle QR scan result
  const handleScan = (data) => {
    if (data) {
      verifyPrescription(data);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto mt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Prescription</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Scan a prescription QR code or enter the QR data manually to verify its authenticity.
          </p>
        </div>

        {/* QR Scanner */}
        <PrescriptionQRScanner onScan={handleScan} />
        
        {/* Loading State */}
        {loading && (
          <div className="my-6 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="my-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        
        {/* Verification Result */}
        {verificationResult && (
          <div className={`my-6 p-6 border rounded-lg ${
            verificationResult.verified 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {verificationResult.verified ? 'Prescription Verified' : 'Verification Failed'}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                verificationResult.verified 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {verificationResult.verified ? 'Valid' : 'Invalid'}
              </span>
            </div>
            
            {verificationResult.verified ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Prescription ID</p>
                    <p className="font-medium text-gray-900 dark:text-white">{verificationResult.prescriptionId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-medium text-gray-900 dark:text-white">{verificationResult.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Patient</p>
                    <p className="font-medium text-gray-900 dark:text-white">{verificationResult.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date Issued</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(verificationResult.date || verificationResult.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Medication</p>
                  <p className="font-medium text-gray-900 dark:text-white">{verificationResult.medication || verificationResult.medicationName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Dosage & Instructions</p>
                  <p className="font-medium text-gray-900 dark:text-white">{verificationResult.dosage}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{verificationResult.instructions}</p>
                </div>
                
                <div className="pt-4 border-t border-green-200 dark:border-green-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Blockchain Verified</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 font-mono break-all">{verificationResult.txID}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-300">
                This prescription could not be verified. It may be invalid, revoked, or tampered with.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPrescriptionPage;

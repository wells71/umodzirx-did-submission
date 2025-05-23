import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return randomString;
}

export default function PharmacistDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [patientID, setPatientID] = useState('');
  const [verifiedPatient, setVerifiedPatient] = useState(null);
  const [pharmacistInfo] = useState({
    id: localStorage.getItem('pharmaId'),
    email: localStorage.getItem('pharmaEmail'),
    name: localStorage.getItem('pharmaName')
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSelfDispensingAlert, setShowSelfDispensingAlert] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [comment, setComment] = useState('');
  const [dispenseSuccess, setDispenseSuccess] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const encodedPatient = urlParams.get('patient');

    if (encodedPatient) {
      try {
        const decodedString = atob(encodedPatient.replace(/-/g, '+').replace(/_/g, '/'));
        const patient = JSON.parse(decodedString);
        
        if (patient.id === pharmacistInfo.id) {
          setShowSelfDispensingAlert(true);
          setVerifiedPatient(null);
        } else {
          setVerifiedPatient(patient);
        }
      } catch (e) {
        console.error('Error parsing patient data:', e);
      }
    }

    const nonce = generateRandomString(16);
    const state = generateRandomString(16);

    const renderButton = () => {
      window.SignInWithEsignetButton?.init({
        oidcConfig: {
          acr_values: 'mosip:idp:acr:generated-code mosip:idp:acr:biometric:static-code',
          claims_locales: 'en',
          client_id: process.env.REACT_APP_ESIGNET_CLIENT_ID,
          redirect_uri: process.env.REACT_APP_ESIGNET_REDIRECT_URI_PHARMACIST,
          display: 'page',
          nonce: nonce,
          prompt: 'consent',
          scope: 'openid profile',
          state: state,
          ui_locales: 'en',
          authorizeUri: process.env.REACT_APP_ESIGNET_AUTHORIZE_URI,
        },
        buttonConfig: {
          labelText: 'Verify Patient with eSignet',
          shape: 'soft_edges',
          theme: 'filled_blue',
          type: 'standard'
        },
        signInElement: document.getElementById('esignet-verify-button'),
        onSuccess: (response) => {
          console.log('Patient verification successful:', response);
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
  }, [location.search, pharmacistInfo.id]);

  const fetchPrescriptions = async () => {
    if (!verifiedPatient?.id) {
      setError('No verified patient found');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/pharmacist/prescriptions`, {
        params: { patientId: verifiedPatient.id }
      });
      setPrescriptions(response.data.data.prescriptions || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async () => {
    if (!comment.trim()) {
      setError('Please enter a comment before dispensing');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/pharmacist/dispense`,
        {
          patientId: verifiedPatient.id,
          prescriptionId: selectedPrescription.txId,
          pharmacistId: pharmacistInfo.id,
          comment: comment
        }
      );
      
      setDispenseSuccess(true);
      setComment('');
      setSelectedPrescription(null);
      setTimeout(() => setDispenseSuccess(false), 3000);
      fetchPrescriptions(); // Refresh the prescriptions list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispense medication');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800"></h1>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-medium text-gray-700">
              {pharmacistInfo.name}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Pharmacist Portal</h2>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-lg mb-2">Pharmacist Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600">ID:</p>
                <p className="font-medium">{pharmacistInfo.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-medium">{pharmacistInfo.name}</p>
              </div>
              <div>
                <p className="text-gray-600">Email:</p>
                <p className="font-medium">{localStorage.getItem('phamarEmail')}</p>
              </div>
            </div>
          </div>

          <div className="mb-6 flex items-start">
            <div id="esignet-verify-button" className="mr-4"></div>
            <p className="text-sm text-gray-500 mt-2">
              Verify patient identity using eSignet before dispensing medications
            </p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
          {dispenseSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              Medication dispensed successfully!
            </div>
          )}

          {verifiedPatient && (
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-lg mb-2">Verified Patient Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-600">Patient ID:</p>
                  <p className="font-medium">{verifiedPatient.id}</p>
                </div>
                <div>
                  <p className="text-gray-600">Patient Name:</p>
                  <p className="font-medium">{verifiedPatient.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">Birthday:</p>
                  <p className="font-medium">{verifiedPatient.birthday || 'N/A'}</p>
                </div>
              </div>
              <button
                onClick={fetchPrescriptions}
                disabled={loading}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Loading...' : 'Fetch Prescriptions'}
              </button>
            </div>
          )}

          {prescriptions.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <h3 className="text-xl font-semibold mb-4">Patient Prescriptions</h3>
              <div className="space-y-4">
                {prescriptions.map((prescription, index) => (
                  <div key={index} className="border p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-gray-600">Medication:</p>
                        <p className="font-medium">{prescription.medicationName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Dosage:</p>
                        <p className="font-medium">{prescription.dosage}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Instructions:</p>
                        <p className="font-medium">{prescription.instructions}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Prescribed On:</p>
                        <p className="font-medium">
                          {new Date(prescription.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {selectedPrescription?.txId === prescription.txId ? (
                      <div className="mt-4">
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Enter dispensing comments..."
                          className="w-full p-2 border rounded mb-2"
                          rows="3"
                          required
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleDispense}
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
                          >
                            {loading ? 'Processing...' : 'Confirm Dispense'}
                          </button>
                          <button
                            onClick={() => setSelectedPrescription(null)}
                            className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedPrescription(prescription)}
                        className="mt-2 bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200"
                      >
                        Dispense This Medication
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showSelfDispensingAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 text-red-600">Invalid Action</h3>
            <p className="mb-4">You cannot dispense medication for yourself. Please verify a different patient.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSelfDispensingAlert(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
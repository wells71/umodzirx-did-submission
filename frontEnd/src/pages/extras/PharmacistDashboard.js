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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [patientID, setPatientID] = useState('');
  const [reviewPatientID, setReviewPatientID] = useState('');
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
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Sample inventory data
  const inventory = [
    { id: 1, name: "Paracetamol 500mg", stock: 142, threshold: 50 },
    { id: 2, name: "Amoxicillin 250mg", stock: 87, threshold: 30 },
    { id: 3, name: "Ibuprofen 200mg", stock: 203, threshold: 75 },
    { id: 4, name: "Omeprazole 20mg", stock: 56, threshold: 25 },
    { id: 5, name: "Atorvastatin 40mg", stock: 34, threshold: 20 }
  ];

  // New functions for inventory and modal handling
  const handleDispenseMedications = () => {
    setShowModal(true);
  };

  const handleReviewPrescriptions = () => {
    setShowReviewModal(true);
  };

  const handleShowInventory = () => {
    setShowInventory(true);
  };

  const handleSubmitPatientID = () => {
    if (patientID.trim()) {
      console.log(`Dispensing medications for patient ID: ${patientID}`);
      setShowModal(false);
      setPatientID('');
    } else {
      alert('Please enter a valid patient ID.');
    }
  };

  const handleSubmitReviewPatientID = () => {
    if (reviewPatientID.trim()) {
      console.log(`Reviewing prescriptions for patient ID: ${reviewPatientID}`);
      setShowReviewModal(false);
      setReviewPatientID('');
    } else {
      alert('Please enter a valid patient ID.');
    }
  };

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
          const verifiedPatientData = {
            id: response.sub || response.patientId,
            name: response.name || 'Verified Patient',
            birthday: response.birthdate || 'N/A'
          };
          setVerifiedPatient(verifiedPatientData);
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
      fetchPrescriptions();
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden p-8 relative">
        {/* Pharmacist Name - Top Right Corner */}
        <div className="absolute top-6 right-6">
          <div className="flex items-center">
            <span className="text-teal-800 font-medium mr-2">{pharmacistInfo.name}</span>
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center overflow-hidden">
              {/* Profile icon placeholder */}
            </div>
          </div>
        </div>

        <p className="text-gray-700 text-lg mb-8">Welcome, Pharmacist! Manage prescriptions here.</p>

        <div className="mt-8">
          <h3 className="text-2xl font-semibold mb-6">Pharmacist Duties</h3>
          
          {/* eSignet Verification Button */}
          <div className="mb-6 flex items-center justify-center">
            <div id="esignet-verify-button"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dispense Medications */}
            <button
              onClick={handleDispenseMedications}
              disabled={!verifiedPatient}
              className={`p-6 rounded-lg transition duration-200 flex flex-col items-center justify-center ${
                verifiedPatient 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="text-4xl mb-2">💊</span>
              <span className="text-lg font-medium">Dispense Medications</span>
            </button>
            
            {/* Review Prescriptions */}
            <button
              onClick={handleReviewPrescriptions}
              disabled={!verifiedPatient}
              className={`p-6 rounded-lg transition duration-200 flex flex-col items-center justify-center ${
                verifiedPatient 
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="text-4xl mb-2">📋</span>
              <span className="text-lg font-medium">Review Prescriptions</span>
            </button>
            
            {/* Manage Inventory */}
            <button
              onClick={handleShowInventory}
              className="bg-purple-100 text-purple-700 p-6 rounded-lg hover:bg-purple-200 transition duration-200 flex flex-col items-center justify-center"
            >
              <span className="text-4xl mb-2">🧪</span>
              <span className="text-lg font-medium">Manage Inventory</span>
            </button>
          </div>
          <p className="text-sm text-gray-500 text-center mt-2">
            {verifiedPatient 
              ? `Verified patient: ${verifiedPatient.name} (${verifiedPatient.id})`
              : 'Please verify patient using eSignet above'}
          </p>
        </div>

        {/* Inventory Display */}
        {showInventory && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Current Inventory</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left border-b">Medication</th>
                    <th className="px-4 py-2 text-left border-b">Current Stock</th>
                    <th className="px-4 py-2 text-left border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b">{item.name}</td>
                      <td className="px-4 py-2 border-b">{item.stock}</td>
                      <td className="px-4 py-2 border-b">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.stock < item.threshold 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.stock < item.threshold ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setShowInventory(false)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
            >
              Close Inventory
            </button>
          </div>
        )}

        {/* Prescription handling UI - only shown after verification */}
        <div className="mt-8">
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
    </div>
  );
}
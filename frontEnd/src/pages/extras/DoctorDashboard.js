import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiLayout, 
  FiDroplet as FiPill, 
  FiClock, 
  FiLogOut,
  FiChevronLeft,
  FiChevronRight, 
  FiUser,
} from 'react-icons/fi';

const TABS = {
  CREATE: 'CREATE',
  VIEW: 'VIEW',
  QUICK_ACTIONS: 'QUICK_ACTIONS'
};

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(TABS.CREATE);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [verifiedPatient, setVerifiedPatient] = useState(null);
  const [formData, setFormData] = useState({
    medications: [{ medicationName: '', dosage: '', instructions: '' }]
  });
  const [selfPrescriptionWarning, setSelfPrescriptionWarning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

  useEffect(() => {
    const renderButton = () => {
      window.SignInWithEsignetButton?.init({
        oidcConfig: {
          client_id: process.env.REACT_APP_ESIGNET_CLIENT_ID,
          redirect_uri: process.env.REACT_APP_ESIGNET_REDIRECT_URI_DOCTOR,
          scope: 'openid profile',
          state: 'state',
          nonce: 'nonce',
          authorizeUri: process.env.REACT_APP_ESIGNET_AUTHORIZE_URI,
        },
        buttonConfig: {
          labelText: 'Verify Patient with eSignet',
          theme: 'filled_blue',
        },
        signInElement: document.getElementById('esignet-verify-button'),
        onSuccess: (response) => {
          setVerifiedPatient({
            patientId: response.sub,
            patientName: response.name,
          });
        },
        onFailure: (error) => setError('Patient verification failed.'),
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
  }, []);

  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { medicationName: '', dosage: '', instructions: '' }]
    });
  };

  const handleRemoveMedication = (index) => {
    const medications = [...formData.medications];
    medications.splice(index, 1);
    setFormData({ ...formData, medications });
  };

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const medications = [...formData.medications];
    medications[index][name] = value;
    setFormData({ ...formData, medications });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-blue-600 text-white transition-all duration-300 ${
          isSidebarExpanded ? 'w-56' : 'w-14'
        } flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          {isSidebarExpanded && <span className="text-xl font-bold">UmodziRx</span>}
          <button onClick={toggleSidebar} className="text-white">
            {isSidebarExpanded ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
          </button>
        </div>
        <div className="flex-1">
          <div
            className={`p-4 flex items-center space-x-4 hover:bg-blue-700 cursor-pointer ${
              activeTab === TABS.CREATE ? 'bg-blue-700' : ''
            }`}
            onClick={() => setActiveTab(TABS.CREATE)}
          >
            <FiPill className="text-lg" />
            {isSidebarExpanded && <span>Create Prescription</span>}
          </div>
          <div
            className={`p-4 flex items-center space-x-4 hover:bg-blue-700 cursor-pointer ${
              activeTab === TABS.VIEW ? 'bg-blue-700' : ''
            }`}
            onClick={() => setActiveTab(TABS.VIEW)}
          >
            <FiClock className="text-lg" />
            {isSidebarExpanded && <span>Patient History</span>}
          </div>
          <div
            className={`p-4 flex items-center space-x-4 hover:bg-blue-700 cursor-pointer ${
              activeTab === TABS.QUICK_ACTIONS ? 'bg-blue-700' : ''
            }`}
            onClick={() => setActiveTab(TABS.QUICK_ACTIONS)}
          >
            <FiLayout className="text-lg" />
            {isSidebarExpanded && <span>Quick Actions</span>}
          </div>
        </div>
        <div className="p-4 flex flex-col space-y-4">
          <div className="flex items-center space-x-4 hover:bg-blue-700 cursor-pointer">
            <FiUser className="text-lg" />
            {isSidebarExpanded && <span>Profile</span>}
          </div>
          <div className="flex items-center space-x-4 hover:bg-blue-700 cursor-pointer">
            <FiLogOut className="text-lg" />
            {isSidebarExpanded && <span>Logout</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 ml-${isSidebarExpanded ? '56' : '14'} transition-all duration-300 p-6`}>
        {activeTab === TABS.CREATE && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Create Prescription</h2>
            {selfPrescriptionWarning && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                You cannot create prescriptions for yourself.
              </div>
            )}
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
            {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{success}</div>}
            {verifiedPatient && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-lg mb-2">Patient Information</h3>
                <p className="text-gray-600">Patient ID: {verifiedPatient.patientId}</p>
                <p className="text-gray-600">Patient Name: {verifiedPatient.patientName}</p>
              </div>
            )}
            <form className="space-y-4">
              <h3 className="text-lg font-medium">Medications</h3>
              {formData.medications.map((med, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <label className="block text-gray-700 mb-1">Medication Name</label>
                      <input
                        type="text"
                        name="medicationName"
                        value={med.medicationName}
                        onChange={(e) => handleChange(e, index)}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Dosage</label>
                      <input
                        type="text"
                        name="dosage"
                        value={med.dosage}
                        onChange={(e) => handleChange(e, index)}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1">Instructions</label>
                      <input
                        type="text"
                        name="instructions"
                        value={med.instructions}
                        onChange={(e) => handleChange(e, index)}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                  </div>
                  {formData.medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(index)}
                      className="text-red-600 text-sm"
                    >
                      Remove Medication
                    </button>
                  )}
                </div>
              ))}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Add Medication
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Submit Prescription
                </button>
              </div>
            </form>
          </>
        )}
        {activeTab === TABS.VIEW && (
          <>
            <div className="w-full h-full">
            </div>
          </>
        )}
        {activeTab === TABS.QUICK_ACTIONS && (
          <>
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <p className="text-gray-600">Access common templates and frequent patients.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
import React, { useState, useEffect } from 'react';
import { FiSave, FiAlertCircle, FiCheckCircle, FiPlus, FiX } from 'react-icons/fi';
import axios from 'axios';
import useAuth from '../../../hooks/useAuth';

const PatientProfileContent = () => {
  const { getUserInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Patient profile state
  const [profile, setProfile] = useState({
    name: '',
    sex: '',
    occupation: '',
    alcoholUse: 'No',
    tobaccoUse: 'No',
    bloodGroup: '',
    allergies: [],
    medicalConditions: [],
    otherHistory: '',
    currentMedications: []
  });
  
  // New item states
  const [newAllergy, setNewAllergy] = useState({ name: '', severity: 'Mild', reaction: '' });
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '' });
  
  // Get patient info from auth
  const patientId = getUserInfo()?.id || localStorage.getItem('patientId');
  
  // Fetch patient profile data
  useEffect(() => {
    const fetchPatientProfile = async () => {
      if (!patientId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/patient/profile?patientId=${patientId}`);
        
        if (response.data && response.data.success) {
          const profileData = response.data.data;
          setProfile({
            name: profileData.name || '',
            sex: profileData.sex || '',
            occupation: profileData.occupation || '',
            alcoholUse: profileData.alcoholUse || 'No',
            tobaccoUse: profileData.tobaccoUse || 'No',
            bloodGroup: profileData.bloodGroup || '',
            allergies: profileData.allergies || [],
            medicalConditions: profileData.medicalConditions || [],
            otherHistory: profileData.otherHistory || '',
            currentMedications: profileData.currentMedications || []
          });
        }
      } catch (err) {
        console.error('Error fetching patient profile:', err);
        // If profile doesn't exist yet, we'll create a new one on save
        if (err.response && err.response.status === 404) {
          // Use data from auth if available
          const userInfo = getUserInfo();
          setProfile({
            ...profile,
            name: userInfo?.name || '',
          });
        } else {
          setError('Failed to load profile data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatientProfile();
  }, [patientId]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };
  
  // Add a new allergy
  const addAllergy = () => {
    if (!newAllergy.name) return;
    
    setProfile({
      ...profile,
      allergies: [...profile.allergies, { ...newAllergy, id: Date.now() }]
    });
    
    setNewAllergy({ name: '', severity: 'Mild', reaction: '' });
  };
  
  // Remove an allergy
  const removeAllergy = (id) => {
    setProfile({
      ...profile,
      allergies: profile.allergies.filter(allergy => allergy.id !== id)
    });
  };
  
  // Add a new medical condition
  const addMedicalCondition = () => {
    if (!newCondition) return;
    
    setProfile({
      ...profile,
      medicalConditions: [...profile.medicalConditions, { name: newCondition, description: '', id: Date.now() }]
    });
    
    setNewCondition('');
  };
  
  // Toggle a predefined medical condition
  const toggleMedicalCondition = (conditionName) => {
    const existingCondition = profile.medicalConditions.find(c => c.name === conditionName);
    
    if (existingCondition) {
      // Remove the condition if it exists
      setProfile({
        ...profile,
        medicalConditions: profile.medicalConditions.filter(c => c.name !== conditionName)
      });
    } else {
      // Add the condition if it doesn't exist
      setProfile({
        ...profile,
        medicalConditions: [...profile.medicalConditions, { name: conditionName, description: '', id: Date.now() }]
      });
    }
  };
  
  // Update medical condition description
  const updateConditionDescription = (id, description) => {
    setProfile({
      ...profile,
      medicalConditions: profile.medicalConditions.map(condition => 
        condition.id === id ? { ...condition, description } : condition
      )
    });
  };
  
  // Remove a medical condition
  const removeMedicalCondition = (id) => {
    setProfile({
      ...profile,
      medicalConditions: profile.medicalConditions.filter(condition => condition.id !== id)
    });
  };
  
  // Add a new medication
  const addMedication = () => {
    if (!newMedication.name) return;
    
    setProfile({
      ...profile,
      currentMedications: [...profile.currentMedications, { ...newMedication, id: Date.now() }]
    });
    
    setNewMedication({ name: '', dosage: '', frequency: '' });
  };
  
  // Remove a medication
  const removeMedication = (id) => {
    setProfile({
      ...profile,
      currentMedications: profile.currentMedications.filter(med => med.id !== id)
    });
  };
  
  // Save profile data
  const saveProfile = async () => {
    if (!patientId) {
      setError('Patient ID not found. Please log in again.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      const response = await axios.post('http://localhost:5000/patient/profile', {
        patientId,
        ...profile
      });
      
      if (response.data && response.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(response.data.error || 'Failed to save profile');
      }
    } catch (err) {
      console.error('Error saving patient profile:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Patient Profile</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your personal information, allergies, and medical history
        </p>
      </div>
      
      {/* Success message */}
      {success && (
        <div className="mb-6 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-700 dark:text-green-400 p-4 rounded-md flex items-center">
          <FiCheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          <p>Profile updated successfully!</p>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-6 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded-md flex items-center">
          <FiAlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Basic Information</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sex
              </label>
              <select
                name="sex"
                value={profile.sex}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Occupation
              </label>
              <input
                type="text"
                name="occupation"
                value={profile.occupation}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter your occupation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Blood Group
              </label>
              <select
                name="bloodGroup"
                value={profile.bloodGroup}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Use of Alcohol
              </label>
              <select
                name="alcoholUse"
                value={profile.alcoholUse}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Use of Tobacco
              </label>
              <select
                name="tobaccoUse"
                value={profile.tobaccoUse}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Allergies Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Allergies</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            List any allergies, especially drug allergies, that healthcare providers should know about
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {profile.allergies.map((allergy) => (
              <div 
                key={allergy.id} 
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-900 dark:text-white">{allergy.name}</span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      allergy.severity === 'Severe' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                      allergy.severity === 'Moderate' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                    }`}>
                      {allergy.severity}
                    </span>
                  </div>
                  {allergy.reaction && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Reaction: {allergy.reaction}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeAllergy(allergy.id)}
                  className="ml-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            ))}
            
            {/* Add new allergy form */}
            <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Allergy</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newAllergy.name}
                  onChange={(e) => setNewAllergy({...newAllergy, name: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Allergy name"
                />
                <select
                  value={newAllergy.severity}
                  onChange={(e) => setNewAllergy({...newAllergy, severity: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
                <input
                  type="text"
                  value={newAllergy.reaction}
                  onChange={(e) => setNewAllergy({...newAllergy, reaction: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Reaction (optional)"
                />
              </div>
              <button
                onClick={addAllergy}
                disabled={!newAllergy.name}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus className="mr-2 h-4 w-4" /> Add Allergy
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Medical Conditions Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Medical Conditions</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select any chronic or significant medical conditions
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Predefined conditions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                'Arthritis', 'Asthma', 'Diabetes', 'Epilepsy', 'Haemophilia', 
                'Cardiovascular Disease', 'Neoplasms', 'Endocrine Disease', 'Hysteria', 
                'Hypertension', 'Jaundice', 'Pelvic Inflammatory Disease', 'Pneumonia', 
                'Rheumatism', 'Sickle Cell Disease', 'STI', 'Tuberculosis'
              ].map((condition) => {
                const isSelected = profile.medicalConditions.some(c => c.name === condition);
                return (
                  <div key={condition} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`condition-${condition}`}
                      checked={isSelected}
                      onChange={() => toggleMedicalCondition(condition)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`condition-${condition}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                      {condition}
                    </label>
                  </div>
                );
              })}
            </div>
            
            {/* Selected conditions with descriptions */}
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Conditions Details</h4>
              {profile.medicalConditions.length > 0 ? (
                profile.medicalConditions.map((condition) => (
                  <div 
                    key={condition.id} 
                    className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{condition.name}</span>
                      <button
                        onClick={() => removeMedicalCondition(condition.id)}
                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                      >
                        <FiX className="h-5 w-5" />
                      </button>
                    </div>
                    <textarea
                      value={condition.description}
                      onChange={(e) => updateConditionDescription(condition.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white text-sm"
                      placeholder={`Add details about your ${condition.name} (optional)`}
                      rows="2"
                    />
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No conditions selected</p>
              )}
            </div>
            
            {/* Add custom condition form */}
            <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add Other Medical Condition</h4>
              <div className="flex">
                <input
                  type="text"
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Enter other medical condition"
                />
                <button
                  onClick={addMedicalCondition}
                  disabled={!newCondition}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiPlus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Other Important History Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Other Important History</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add any other important medical history that healthcare providers should know
          </p>
        </div>
        <div className="p-6">
          <textarea
            name="otherHistory"
            value={profile.otherHistory}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="Enter any other important medical history, family history, or relevant information"
            rows="4"
          />
        </div>
      </div>
      
      {/* Current Medications Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Current Medications</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            List any medications you are currently taking (not prescribed through this system)
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {profile.currentMedications.map((medication) => (
              <div 
                key={medication.id} 
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{medication.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {medication.dosage} - {medication.frequency}
                  </div>
                </div>
                <button
                  onClick={() => removeMedication(medication.id)}
                  className="ml-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            ))}
            
            {/* Add new medication form */}
            <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Add New Medication</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Medication name"
                />
                <input
                  type="text"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({...newMedication, dosage: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Dosage (e.g., 10mg)"
                />
                <input
                  type="text"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication({...newMedication, frequency: e.target.value})}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Frequency (e.g., twice daily)"
                />
              </div>
              <button
                onClick={addMedication}
                disabled={!newMedication.name}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiPlus className="mr-2 h-4 w-4" /> Add Medication
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveProfile}
          disabled={saving}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2 h-5 w-5" />
              Save Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PatientProfileContent;
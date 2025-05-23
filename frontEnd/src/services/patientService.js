import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Service for patient-related API calls
 */
const patientService = {
  /**
   * Get patient details
   * @param {string} patientId - Patient ID
   * @returns {Promise} - Promise with patient data
   */
  getPatientDetails: async (patientId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/patient`, {
        params: { patientId },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient details:', error);
      throw error;
    }
  },

  /**
   * Get all patients (for doctors/admins)
   * @returns {Promise} - Promise with patients data
   */
  getAllPatients: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all patients:', error);
      throw error;
    }
  },

  /**
   * Create a new patient
   * @param {Object} patientData - Patient data
   * @returns {Promise} - Promise with created patient
   */
  createPatient: async (patientData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/patients`, patientData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  /**
   * Update patient details
   * @param {string} patientId - Patient ID
   * @param {Object} patientData - Updated patient data
   * @returns {Promise} - Promise with updated patient
   */
  updatePatient: async (patientId, patientData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/patients/${patientId}`, patientData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }
};

export default patientService;
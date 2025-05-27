import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const patientService = {
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
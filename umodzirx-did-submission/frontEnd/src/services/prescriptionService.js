import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const prescriptionService = {
  getPatientPrescriptions: async (patientId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/prescriptions/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
      throw error;
    }
  },

  createPrescription: async (prescriptionData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/prescriptions`, prescriptionData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  },

  verifyPrescription: async (prescriptionId, patientId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/prescriptions/verify`, {
        params: {
          prescriptionId,
          patientId
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying prescription:', error);
      throw error;
    }
  },

  dispensePrescription: async (dispensingData) => {
    try {
      // Validate that note field is present and not empty
      if (!dispensingData.note || dispensingData.note.trim() === '') {
        console.error('VALIDATION ERROR: Note field is missing or empty in dispensingData', dispensingData);
        throw new Error('Please enter a comment before dispensing');
      }
      
      console.log('Dispensing prescription with data:', JSON.stringify(dispensingData));
      
      const response = await axios.post(`${API_BASE_URL}/pharmacist/dispense`, dispensingData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('Dispense response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error dispensing prescription:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  },

  getPrescriptionFromQR: async (patientId, prescriptionId) => {
    try {
      // First get all prescriptions for the patient
      const response = await axios.get(`${API_BASE_URL}/pharmacist/prescriptions`, {
        params: { patientId },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch prescription details');
      }
      
      // Find the specific prescription
      const prescriptions = response.data.data.prescriptions || [];
      const matchingPrescription = prescriptions.find(p => 
        (p.prescriptionId === prescriptionId) || (p.id === prescriptionId)
      );
      
      if (!matchingPrescription) {
        throw new Error('Prescription not found in blockchain records');
      }
      
      return {
        success: true,
        data: matchingPrescription
      };
    } catch (error) {
      console.error('Error fetching prescription from QR:', error);
      throw error;
    }
  },
  
  dispenseFromQR: async (qrData, pharmacistId, note = '') => {
    try {
      if (!qrData.prescriptionId || !qrData.patientId) {
        throw new Error('Invalid QR code data: missing prescription or patient ID');
      }
      
      // Validate note
      if (!note || note.trim() === '') {
        throw new Error('Please enter a comment before dispensing');
      }
      
      console.log('Dispensing from QR with note:', note);
      
      const dispensingData = {
        patientId: qrData.patientId,
        prescriptionId: qrData.prescriptionId,
        pharmacistId: pharmacistId || localStorage.getItem('userId') || '879861538',
        note: note 
      };
      
      const response = await axios.post(`${API_BASE_URL}/pharmacist/dispense`, dispensingData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error dispensing from QR:', error);
      throw error;
    }
  }
};

export default prescriptionService;
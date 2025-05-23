import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Service for prescription-related API calls
 */
const prescriptionService = {
  /**
   * Get all prescriptions for a patient
   * @param {string} patientId - Patient ID
   * @returns {Promise} - Promise with prescription data
   */
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

  /**
   * Create a new prescription
   * @param {Object} prescriptionData - Prescription data
   * @returns {Promise} - Promise with created prescription
   */
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

  /**
   * Verify a prescription
   * @param {string} prescriptionId - Prescription ID
   * @param {string} patientId - Patient ID
   * @returns {Promise} - Promise with verification result
   */
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

  /**
   * Dispense a prescription
   * @param {Object} dispensingData - Dispensing data
   * @returns {Promise} - Promise with dispensing result
   */
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

  /**
   * Get prescription details from blockchain by scanning QR code
   * @param {string} patientId - Patient ID from QR code
   * @param {string} prescriptionId - Prescription ID from QR code
   * @returns {Promise} - Promise with prescription details
   */
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
  
  /**
   * Dispense a prescription from QR code data
   * @param {Object} qrData - QR code data
   * @param {string} pharmacistId - Pharmacist ID
   * @param {string} note - Optional dispensing note
   * @returns {Promise} - Promise with dispensing result
   */
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
        note: note // Changed from "comment" to "note" to match backend expectation
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
  },

  /**
   * Get prescription details from blockchain by scanning QR code
   * @param {string} patientId - Patient ID from QR code
   * @param {string} prescriptionId - Prescription ID from QR code
   * @returns {Promise} - Promise with prescription details
   */
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
  
  /**
   * Dispense a prescription from QR code data
   * @param {Object} qrData - QR code data
   * @param {string} pharmacistId - Pharmacist ID
   * @param {string} note - Optional dispensing note
   * @returns {Promise} - Promise with dispensing result
   */
  dispenseFromQR: async (qrData, pharmacistId, note = '') => {
    try {
      if (!qrData.prescriptionId || !qrData.patientId) {
        throw new Error('Invalid QR code data: missing prescription or patient ID');
      }
      
      const dispensingData = {
        patientId: qrData.patientId,
        prescriptionId: qrData.prescriptionId,
        pharmacistId: pharmacistId || localStorage.getItem('userId') || '879861538',
        comment: note
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
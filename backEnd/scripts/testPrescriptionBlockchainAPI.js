/**
 * Script for Prescription-Blockchain API Interactions
 * 
 * This script tests the integration between the backend API and blockchain
 * for various prescription-related operations.
 */

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Configuration
const API_BASE = process.env.API_BASE_URL || 'http://localhost:45000';
const TEST_PATIENT_ID = 'TEST-PAT-001';
const TEST_DOCTOR_ID = 'TEST-DOC-001';
const TEST_PHARMACIST_ID = 'TEST-PHARM-001';

// Debug flag - set to true for detailed error logging
const DEBUG = true;

// Helper function to log results
const logResult = (testName, success, response, error = null) => {
  console.log(`\n----- ${testName} -----`);
  console.log(`Status: ${success ? 'SUCCESS ✓' : 'FAILED ✗'}`);
  
  if (success) {
    console.log('Response:', JSON.stringify(response, null, 2));
  } else {
    // More detailed error logging
    if (error?.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Data:', error.response.data);
    } else {
      console.log('Error:', error?.message || 'Unknown error');
    }
  }
};

// 1. Create a prescription
const createPrescription = async () => {  try {
    if (DEBUG) console.log(`Calling: POST ${API_BASE}/doctor/prescriptions (Blockchain API on port 45000)`);
    
    const response = await axios.post(`${API_BASE}/doctor/prescriptions`, {
      patientId: TEST_PATIENT_ID,
      doctorId: TEST_DOCTOR_ID,
      patientName: 'Test Patient',
      prescriptions: [
        {
          medicationName: 'Paracetamol',
          dosage: '500mg',
          instructions: 'Take twice daily after meals'
        },
        {
          medicationName: 'Amoxicillin',
          dosage: '250mg',
          instructions: 'Take three times daily'
        }
      ]
    });

    logResult('Create Prescription', true, response.data);
    return response.data;
  } catch (error) {
    if (DEBUG && error.response) {
      console.log('Error Response:', error.response.data);
      console.log('Status:', error.response.status);
      console.log('Headers:', error.response.headers);
    } else if (DEBUG) {
      console.log('Error:', error.message);
    }
    logResult('Create Prescription', false, null, error);
    return null;
  }
};

// 2. Get a prescription by patient ID
const getPrescription = async (patientId) => {
  try {
    if (DEBUG) console.log(`Calling: GET ${API_BASE}/doctor/prescriptions?patientId=${patientId}`);
    
    const response = await axios.get(`${API_BASE}/doctor/prescriptions`, {
      params: { patientId }
    });

    logResult('Get Prescription', true, response.data);
    return response.data;
  } catch (error) {
    if (DEBUG && error.response) {
      console.log('Error Response:', error.response.data);
      console.log('Status:', error.response.status);
    } else if (DEBUG) {
      console.log('Error:', error.message);
    }
    logResult('Get Prescription', false, null, error);
    return null;
  }
};

// 3. Dispense a prescription
const dispensePrescription = async (patientId, prescriptionId) => {
  try {
    if (DEBUG) console.log(`Calling: POST ${API_BASE}/pharmacist/dispense`);
    
    const response = await axios.post(`${API_BASE}/pharmacist/dispense`, {
      patientId,
      prescriptionId,
      pharmacistId: TEST_PHARMACIST_ID,
      notes: 'Test dispensing notes'  // Changed from 'comment' to 'notes' to match controller
    });

    logResult('Dispense Prescription', true, response.data);
    return response.data;
  } catch (error) {
    if (DEBUG && error.response) {
      console.log('Error Response:', error.response.data);
      console.log('Status:', error.response.status);
    } else if (DEBUG) {
      console.log('Error:', error.message);
    }
    logResult('Dispense Prescription', false, null, error);
    return null;
  }
};

// 4. Revoke a prescription
const revokePrescription = async (patientId, prescriptionId) => {
  try {
    if (DEBUG) console.log(`Calling: POST ${API_BASE}/doctor/prescriptions/revoke`);
    
    const response = await axios.post(`${API_BASE}/doctor/prescriptions/revoke`, {
      patientId,
      prescriptionId,
      doctorId: TEST_DOCTOR_ID
    });

    logResult('Revoke Prescription', true, response.data);
    return response.data;
  } catch (error) {
    if (DEBUG && error.response) {
      console.log('Error Response:', error.response.data);
      console.log('Status:', error.response.status);
    } else if (DEBUG) {
      console.log('Error:', error.message);
    }
    logResult('Revoke Prescription', false, null, error);
    return null;
  }
};

// 5. Get prescription history for a patient
const getPrescriptionHistory = async (patientId) => {
  try {
    if (DEBUG) console.log(`Calling: GET ${API_BASE}/patient/prescriptions/history/${patientId}`);
    
    // This might need to be adjusted based on how your API is set up
    const response = await axios.get(`${API_BASE}/patient/prescriptions/history/${patientId}`);

    logResult('Get Prescription History', true, response.data);
    return response.data;
  } catch (error) {
    if (DEBUG && error.response) {
      console.log('Error Response:', error.response.data);
      console.log('Status:', error.response.status);
    } else if (DEBUG) {
      console.log('Error:', error.message);
    }
    logResult('Get Prescription History', false, null, error);
    return null;
  }
};

// 6. Get doctor's prescription history
const getDoctorPrescriptionHistory = async (doctorId) => {
  try {
    if (DEBUG) console.log(`Calling: GET ${API_BASE}/doctor/prescriptions/doctor/${doctorId}`);
    
    const response = await axios.get(`${API_BASE}/doctor/prescriptions/doctor/${doctorId}`);

    logResult('Get Doctor Prescription History', true, response.data);
    return response.data;
  } catch (error) {
    if (DEBUG && error.response) {
      console.log('Error Response:', error.response.data);
      console.log('Status:', error.response.status);
    } else if (DEBUG) {
      console.log('Error:', error.message);
    }
    logResult('Get Doctor Prescription History', false, null, error);
    return null;
  }
};

// 7. Get pharmacist's dispense history
const getPharmacistDispenseHistory = async (pharmacistId) => {
  try {
    if (DEBUG) console.log(`Calling: GET ${API_BASE}/pharmacist/dispense-history/${pharmacistId}`);
    
    const response = await axios.get(`${API_BASE}/pharmacist/dispense-history/${pharmacistId}`);

    logResult('Get Pharmacist Dispense History', true, response.data);
    return response.data;
  } catch (error) {
    if (DEBUG && error.response) {
      console.log('Error Response:', error.response.data);
      console.log('Status:', error.response.status);
    } else if (DEBUG) {
      console.log('Error:', error.message);
    }
    logResult('Get Pharmacist Dispense History', false, null, error);
    return null;
  }
};

// Run a single test
const runSingleTest = async () => {
  const testType = process.argv[2];
  const args = process.argv.slice(3);

  switch (testType) {
    case 'create':
      await createPrescription();
      break;
    case 'get':
      await getPrescription(args[0] || TEST_PATIENT_ID);
      break;
    case 'dispense':
      if (args.length < 2) {
        console.log('Usage: node testPrescriptionBlockchainAPI.js dispense [patientId] [prescriptionId]');
        return;
      }
      await dispensePrescription(args[0], args[1]);
      break;
    case 'revoke':
      if (args.length < 2) {
        console.log('Usage: node testPrescriptionBlockchainAPI.js revoke [patientId] [prescriptionId]');
        return;
      }
      await revokePrescription(args[0], args[1]);
      break;
    case 'history':
      await getPrescriptionHistory(args[0] || TEST_PATIENT_ID);
      break;
    case 'doctor-history':
      await getDoctorPrescriptionHistory(args[0] || TEST_DOCTOR_ID);
      break;
    case 'pharmacist-history':
      await getPharmacistDispenseHistory(args[0] || TEST_PHARMACIST_ID);
      break;
    default:
      console.log('Invalid test type. Available tests:');
      console.log('- create');
      console.log('- get [patientId]');
      console.log('- dispense [patientId] [prescriptionId]');
      console.log('- revoke [patientId] [prescriptionId]');
      console.log('- history [patientId]');
      console.log('- doctor-history [doctorId]');
      console.log('- pharmacist-history [pharmacistId]');
  }
};

// Run comprehensive test scenario (full workflow)
const runComprehensiveTest = async () => {
  console.log('\n===== STARTING COMPREHENSIVE PRESCRIPTION API TEST =====\n');
  
  // 1. Create prescription
  console.log('STEP 1: Creating prescription...');
  const createResult = await createPrescription();
  if (!createResult?.success) {
    console.log('Failed to create prescription. Stopping test.');
    return;
  }
  
  // 2. Get prescription
  console.log('\nSTEP 2: Fetching prescription...');
  const getResult = await getPrescription(TEST_PATIENT_ID);
  if (!getResult?.success) {
    console.log('Failed to fetch prescription. Stopping test.');
    return;
  }
  
  // Extract prescriptionId
  const prescriptionId = getResult?.data?.prescriptions?.[0]?.prescriptionId;
  if (!prescriptionId) {
    console.log('Could not extract prescriptionId. Stopping test.');
    return;
  }
  
  // 3. Dispense the prescription
  console.log(`\nSTEP 3: Dispensing prescription (ID: ${prescriptionId})...`);
  const dispenseResult = await dispensePrescription(TEST_PATIENT_ID, prescriptionId);
  if (!dispenseResult?.success) {
    console.log('Failed to dispense prescription. Continuing test...');
  }
  
  // 4. Check prescription history
  console.log('\nSTEP 4: Checking prescription history...');
  await getPrescriptionHistory(TEST_PATIENT_ID);
  
  // 5. Check doctor's prescription history
  console.log('\nSTEP 5: Checking doctor prescription history...');
  await getDoctorPrescriptionHistory(TEST_DOCTOR_ID);
  
  // 6. Check pharmacist's dispense history
  console.log('\nSTEP 6: Checking pharmacist dispense history...');
  await getPharmacistDispenseHistory(TEST_PHARMACIST_ID);
  
  // 7. Revoke another prescription (if there's a second one)
  const secondPrescriptionId = getResult?.data?.prescriptions?.[1]?.prescriptionId;
  if (secondPrescriptionId) {
    console.log(`\nSTEP 7: Revoking second prescription (ID: ${secondPrescriptionId})...`);
    await revokePrescription(TEST_PATIENT_ID, secondPrescriptionId);
  }
  
  console.log('\n===== COMPREHENSIVE TEST COMPLETE =====');
};

// Main execution
const main = async () => {
  if (process.argv.length <= 2) {
    await runComprehensiveTest();
  } else {
    await runSingleTest();
  }
};

// Run main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

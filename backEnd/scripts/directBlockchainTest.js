/**
 * Direct Test Script for Prescription-Blockchain API Interactions
 * 
 * This script tests direct interactions with the blockchain API on port 45000
 * for prescription-related operations.
 */

const axios = require('axios');
const { URLSearchParams } = require('url');
const dotenv = require('dotenv');

dotenv.config();

// Configuration
const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000';
const CHANNEL_ID = process.env.CHANNEL_ID || 'mychannel';
const CHAINCODE_ID = process.env.CHAINCODE_ID || 'basic';
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

// Test blockchain connection health
const testBlockchainHealth = async () => {
  try {
    console.log(`Checking blockchain health at ${BLOCKCHAIN_API}/health`);
    
    const response = await axios.get(`${BLOCKCHAIN_API}/health`);
    logResult('Blockchain Health Check', true, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    logResult('Blockchain Health Check', false, null, error);
    return { success: false, error };
  }
};

// Create a prescription on the blockchain
const createPrescription = async () => {
  try {
    console.log(`Creating prescription via blockchain API at ${BLOCKCHAIN_API}/invoke`);
    
    // Create a prescription asset
    const prescriptionId = 'RX-' + Date.now();
    const prescription = {
      PatientId: TEST_PATIENT_ID,
      DoctorId: TEST_DOCTOR_ID,
      PatientName: 'Test Patient',
      Prescriptions: [
        {
          PrescriptionId: prescriptionId,
          PatientId: TEST_PATIENT_ID,
          CreatedBy: TEST_DOCTOR_ID,
          MedicationName: 'Paracetamol',
          Dosage: '500mg',
          Instructions: 'Take twice daily after meals',
          Status: "Active",
          ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          PrescriptionId: 'RX-' + (Date.now() + 1),
          PatientId: TEST_PATIENT_ID,
          CreatedBy: TEST_DOCTOR_ID,
          MedicationName: 'Amoxicillin',
          Dosage: '250mg',
          Instructions: 'Take three times daily',
          Status: "Active",
          ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ]
    };

    // Format request properly based on CLI format
    const params = new URLSearchParams();
    params.append('channelid', CHANNEL_ID);
    params.append('chaincodeid', CHAINCODE_ID);
    params.append('function', 'CreateAsset');
    params.append('args', JSON.stringify(prescription));
    
    console.log('Request params:', params.toString());
    console.log('Formatted prescription data:', JSON.stringify(prescription));
    
    // Send to blockchain
    const response = await axios.post(
      `${BLOCKCHAIN_API}/invoke`, 
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    logResult('Create Prescription', true, response.data);
    return { success: true, data: response.data, prescriptionId };
  } catch (error) {
    logResult('Create Prescription', false, null, error);
    return { success: false, error };
  }
};

// Query prescriptions for a patient
const queryPrescriptions = async (patientId) => {
  try {
    console.log(`Querying prescriptions for patient ${patientId}`);
    
    // Format request properly
    const params = new URLSearchParams();
    params.append('channelid', CHANNEL_ID);
    params.append('chaincodeid', CHAINCODE_ID);
    params.append('function', 'GetAssetsByPatientId');  // Assuming this function exists
    params.append('args', JSON.stringify({ PatientId: patientId }));
    
    // Query blockchain
    const response = await axios.post(
      `${BLOCKCHAIN_API}/query`, 
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    logResult('Query Prescriptions', true, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    logResult('Query Prescriptions', false, null, error);
    return { success: false, error };
  }
};

// Update prescription status (e.g., for dispensing)
const updatePrescriptionStatus = async (patientId, prescriptionId, status, updatedBy) => {
  try {
    console.log(`Updating prescription ${prescriptionId} status to ${status}`);
    
    // Format request properly
    const params = new URLSearchParams();
    params.append('channelid', CHANNEL_ID);
    params.append('chaincodeid', CHAINCODE_ID);
    params.append('function', 'UpdatePrescriptionStatus');  // Assuming this function exists
    params.append('args', JSON.stringify({
      PatientId: patientId,
      PrescriptionId: prescriptionId,
      Status: status,
      UpdatedBy: updatedBy
    }));
    
    // Send to blockchain
    const response = await axios.post(
      `${BLOCKCHAIN_API}/invoke`, 
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    logResult(`Update Prescription Status to ${status}`, true, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    logResult(`Update Prescription Status to ${status}`, false, null, error);
    return { success: false, error };
  }
};

// Run a single test based on command line arguments
const runSingleTest = async () => {
  const testType = process.argv[2];
  const args = process.argv.slice(3);

  switch (testType) {
    case 'health':
      await testBlockchainHealth();
      break;
    case 'create':
      await createPrescription();
      break;
    case 'query':
      await queryPrescriptions(args[0] || TEST_PATIENT_ID);
      break;
    case 'update':
      if (args.length < 3) {
        console.log('Usage: node directBlockchainTest.js update [patientId] [prescriptionId] [status] [updatedBy]');
        return;
      }
      await updatePrescriptionStatus(args[0], args[1], args[2], args[3] || TEST_PHARMACIST_ID);
      break;
    default:
      console.log('Invalid test type. Available tests:');
      console.log('- health');
      console.log('- create');
      console.log('- query [patientId]');
      console.log('- update [patientId] [prescriptionId] [status] [updatedBy]');
  }
};

// Run comprehensive test workflow
const runComprehensiveTest = async () => {
  console.log('\n===== STARTING COMPREHENSIVE BLOCKCHAIN API TEST =====\n');
  
  // 1. Test health
  console.log('STEP 1: Checking blockchain health...');
  const healthResult = await testBlockchainHealth();
  if (!healthResult.success) {
    console.log('Blockchain health check failed. Testing will continue but may fail.');
  }
  
  // 2. Create prescription
  console.log('\nSTEP 2: Creating prescription...');
  const createResult = await createPrescription();
  if (!createResult.success) {
    console.log('Failed to create prescription. Stopping test.');
    return;
  }
  
  // Save the prescription ID for use in subsequent tests
  const prescriptionId = createResult.prescriptionId;
  
  // 3. Query prescriptions
  console.log('\nSTEP 3: Querying prescriptions...');
  await queryPrescriptions(TEST_PATIENT_ID);
  
  // 4. Update prescription status to dispensed
  if (prescriptionId) {
    console.log(`\nSTEP 4: Dispensing prescription (ID: ${prescriptionId})...`);
    await updatePrescriptionStatus(
      TEST_PATIENT_ID,
      prescriptionId,
      'Dispensed',
      TEST_PHARMACIST_ID
    );
  } else {
    console.log('\nSTEP 4: Skipping dispense test - no prescription ID available.');
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

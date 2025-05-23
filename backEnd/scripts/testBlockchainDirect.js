/**
 * Direct Test Script for Blockchain API Interactions
 * 
 * This script tests the direct connection to the blockchain API on port 45000
 * for various prescription-related operations.
 */

const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Configuration
const BLOCKCHAIN_API = 'http://localhost:45000';
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

// Test direct blockchain API connection
const testBlockchainConnection = async () => {
  try {
    console.log(`Checking blockchain API at ${BLOCKCHAIN_API}`);
    
    // Simple health check or status endpoint
    const response = await axios.get(`${BLOCKCHAIN_API}/health`);
    
    logResult('Blockchain Connection Test', true, response.data);
    return response.data;
  } catch (error) {
    logResult('Blockchain Connection Test', false, null, error);
    return null;
  }
};

// Create an asset directly through blockchain API
const createAsset = async () => {
  try {
    console.log(`Creating asset via blockchain API at ${BLOCKCHAIN_API}/invoke`);
    
    // Create a prescription asset object
    const assetObject = {
      PatientId: TEST_PATIENT_ID,
      DoctorId: TEST_DOCTOR_ID,
      PatientName: 'Test Patient',
      Prescriptions: [
        {
          PrescriptionId: Date.now().toString(),
          PatientId: TEST_PATIENT_ID,
          CreatedBy: TEST_DOCTOR_ID,
          MedicationName: 'Paracetamol',
          Dosage: '500mg',
          Instructions: 'Take twice daily after meals',
          Status: "Active",
          ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ]
    };

    // Format request as URL-encoded form data
    const params = new URLSearchParams();
    params.append('channelid', 'mychannel');
    params.append('chaincodeid', 'basic');
    params.append('function', 'CreateAsset');
    params.append('args', JSON.stringify(assetObject));

    // Send to blockchain
    const response = await axios.post(
      `${BLOCKCHAIN_API}/invoke`, 
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    logResult('Create Asset', true, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    logResult('Create Asset', false, null, error);
    return { success: false };
  }
};

// Read an asset by ID
const readAsset = async (patientId) => {
  try {
    console.log(`Reading asset via blockchain API at ${BLOCKCHAIN_API}/query for patient: ${patientId}`);
    
    // Query blockchain
    const response = await axios.get(`${BLOCKCHAIN_API}/query`, {
      params: {
        channelid: 'mychannel',
        chaincodeid: 'basic',
        function: 'ReadAsset',
        args: patientId
      }
    });

    logResult('Read Asset', true, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    logResult('Read Asset', false, null, error);
    return { success: false };
  }
};

// Run tests
const main = async () => {
  console.log('\n===== TESTING DIRECT BLOCKCHAIN API CONNECTION =====\n');
  
  // 1. Test connection to blockchain API
  console.log('STEP 1: Testing connection to blockchain API...');
  await testBlockchainConnection();
  
  // 2. Create asset
  console.log('\nSTEP 2: Creating asset...');
  const createResult = await createAsset();
  if (!createResult.success) {
    console.log('Failed to create asset. Continuing test...');
  }
  
  // 3. Read asset
  console.log('\nSTEP 3: Reading asset...');
  await readAsset(TEST_PATIENT_ID);
  
  console.log('\n===== BLOCKCHAIN API TEST COMPLETE =====');
};

// Run main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

/**
 * Test Blockchain Connection
 * 
 * This script tests the connection to the blockchain API and verifies
 * that the API is properly configured.
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

// Test query endpoint with a simple query
const testQueryEndpoint = async () => {
  try {
    console.log(`Testing query endpoint at ${BLOCKCHAIN_API}/query`);
    
    // Format request properly
    const params = new URLSearchParams();
    params.append('channelid', CHANNEL_ID);
    params.append('chaincodeid', CHAINCODE_ID);
    params.append('function', 'GetPrescriptionsByDoctor');
    params.append('args', 'doctor456');
    
    // Send to blockchain
    const response = await axios.get(
      `${BLOCKCHAIN_API}/query`, 
      { params }
    );
    
    logResult('Query Endpoint Test', true, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    logResult('Query Endpoint Test', false, null, error);
    return { success: false, error };
  }
};

// Test invoke endpoint with a simple invoke
const testInvokeEndpoint = async () => {
  try {
    console.log(`Testing invoke endpoint at ${BLOCKCHAIN_API}/invoke`);
    
    // Create a test asset - format exactly as shown in the CLI example - format exactly as shown in the CLI example
    const testAsset = {
      PatientName: 'Test Patient',
      DateOfBirth: '1990-01-01',
      DateOfBirth: '1990-01-01',
      Prescriptions: [
        {
          PrescriptionId: 'RX-TEST-' + Date.now(),
          MedicationName: 'Test Medication',
          Dosage: '10mg',
          Instructions: 'Test instructions',
          Status: "Active",
          ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ]
    };
    
    // Format request properly
    const params = new URLSearchParams();
    params.append('channelid', CHANNEL_ID);
    params.append('chaincodeid', CHAINCODE_ID);
    params.append('function', 'CreateAsset');
    params.append('args', JSON.stringify(testAsset));
    
    // Send to blockchain
    const response = await axios.post(
      `${BLOCKCHAIN_API}/invoke`, 
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    logResult('Invoke Endpoint Test', true, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    logResult('Invoke Endpoint Test', false, null, error);
    return { success: false, error };
  }
};

// Test querying the asset we just created
const testQueryCreatedAsset = async () => {
  try {
    console.log(`Testing query for created asset at ${BLOCKCHAIN_API}/query`);
    
    // Format request properly
    const params = new URLSearchParams();
    params.append('channelid', CHANNEL_ID);
    params.append('chaincodeid', CHAINCODE_ID);
    params.append('function', 'GetPrescriptionsByDoctor');
    params.append('args', 'TEST-DOC-001');
    
    // Send to blockchain
    const response = await axios.get(
      `${BLOCKCHAIN_API}/query`, 
      { params }
    );
    
    logResult('Query Created Asset Test', true, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    logResult('Query Created Asset Test', false, null, error);
    return { success: false, error };
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('\n===== BLOCKCHAIN API CONNECTION TESTS =====\n');
  
  // 1. Test health endpoint
  const healthResult = await testBlockchainHealth();
  
  // 2. Test query endpoint
  const queryResult = await testQueryEndpoint();
  
  // 3. Test invoke endpoint
  const invokeResult = await testInvokeEndpoint();
  
  // 4. Test querying the created asset
  const queryCreatedResult = await testQueryCreatedAsset();
  
  // Summary
  console.log('\n===== TEST SUMMARY =====');
  console.log(`Health Check: ${healthResult.success ? 'PASSED ✓' : 'FAILED ✗'}`);
  console.log(`Query Endpoint: ${queryResult.success ? 'PASSED ✓' : 'FAILED ✗'}`);
  console.log(`Invoke Endpoint: ${invokeResult.success ? 'PASSED ✓' : 'FAILED ✗'}`);
  console.log(`Query Created Asset: ${queryCreatedResult.success ? 'PASSED ✓' : 'FAILED ✗'}`);
  
  const allPassed = healthResult.success && queryResult.success && invokeResult.success && queryCreatedResult.success;
  console.log(`\nOverall Status: ${allPassed ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗'}`);
  
  if (!allPassed) {
    console.log('\nTroubleshooting Tips:');
    console.log('1. Verify the blockchain API is running on port 45000');
    console.log('2. Check that the channel and chaincode IDs are correct');
    console.log('3. Ensure the blockchain network is properly set up');
    console.log('4. Check the blockchain API logs for errors');
  }
};

// Run the tests
runAllTests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
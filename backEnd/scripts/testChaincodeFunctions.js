/**
 * Test Chaincode Functions
 * 
 * This script tests specific chaincode functions based on the CLI examples.
 */

const axios = require('axios');
const { URLSearchParams } = require('url');
const dotenv = require('dotenv');

dotenv.config();

// Configuration
const BLOCKCHAIN_API = process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000';
const CHANNEL_ID = process.env.CHANNEL_ID || 'mychannel';
const CHAINCODE_ID = process.env.CHAINCODE_ID || 'basic';

// Helper function to log results
const logResult = (testName, success, response, error = null) => {
  console.log(`\n----- ${testName} -----`);
  
  // Check if response contains error message
  let hasBlockchainError = false;
  if (success && typeof response === 'string') {
    // Check if the response string indicates an error
    hasBlockchainError = response.includes('Error:') || 
                         response.includes('error:') || 
                         response.includes('does not exist') ||
                         response.includes('chaincode response 500');
  }
  
  // Update success flag if blockchain returned an error
  if (hasBlockchainError) {
    success = false;
  }
  
  console.log(`Status: ${success ? 'SUCCESS ✓' : 'FAILED ✗'}`);
  
  if (success) {
    if (typeof response === 'string') {
      try {
        // Try to parse and pretty-print JSON
        const parsed = JSON.parse(response);
        console.log('Response:', JSON.stringify(parsed, null, 2));
      } catch (e) {
        // If not JSON, print as is
        console.log('Response:', response);
      }
    } else {
      console.log('Response:', JSON.stringify(response, null, 2));
    }
  } else {
    // More detailed error logging
    if (hasBlockchainError) {
      console.log('Blockchain Error:', response);
    } else if (error?.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Data:', error.response.data);
    } else {
      console.log('Error:', error?.message || 'Unknown error');
    }
  }
};

// Test GetPrescriptionsByDoctor function
const testGetPrescriptionsByDoctor = async () => {
  try {
    console.log(`Testing GetPrescriptionsByDoctor at ${BLOCKCHAIN_API}/query`);
    
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
    
    logResult('GetPrescriptionsByDoctor Test', true, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    logResult('GetPrescriptionsByDoctor Test', false, null, error);
    return { success: false, error };
  }
};

// Test ReadAsset function
const testReadAsset = async () => {
  try {
    console.log(`Testing ReadAsset at ${BLOCKCHAIN_API}/query`);
    
    // Format request properly
    const params = new URLSearchParams();
    params.append('channelid', CHANNEL_ID);
    params.append('chaincodeid', CHAINCODE_ID);
    params.append('function', 'ReadAsset');
    params.append('args', '001');
    
    // Send to blockchain
    const response = await axios.get(
      `${BLOCKCHAIN_API}/query`, 
      { params }
    );
    
    logResult('ReadAsset Test', true, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    logResult('ReadAsset Test', false, null, error);
    return { success: false, error };
  }
};

// Test CreateAsset function
const testCreateAsset = async () => {
  try {
    console.log(`Testing CreateAsset at ${BLOCKCHAIN_API}/invoke`);      // Create a test asset - format exactly as shown in the CLI example
    const testAsset = {
      PatientId: "test-" + Date.now(),
      DoctorId: "doctor456",
      PatientName: "Test Patient",
      DateOfBirth: "1990-01-01",
      Prescriptions: [
        {
          PrescriptionId: "rx-test-" + Date.now(),
          MedicationName: "Test Medication",
          Dosage: "10mg",
          Instructions: "Take once daily",
          Status: "Active",
          CreatedBy: "doctor456",
          TxID: "",
          Timestamp: new Date().toISOString(),
          ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          DispensingPharmacist: "N/A",
          DispensingTimestamp: "N/A"
        }
      ],
      LastUpdated: new Date().toISOString() // Add LastUpdated field to match the Asset struct
    };
    
    // Format request properly
    const params = new URLSearchParams();
    params.append('channelid', CHANNEL_ID);
    params.append('chaincodeid', CHAINCODE_ID);
    params.append('function', 'CreateAsset');
    params.append('args', JSON.stringify(testAsset));
      // Log formatted data - make sure it includes the required fields
    console.log('Formatted asset data:', JSON.stringify(testAsset, null, 2));
    
    // Send to blockchain
    const response = await axios.post(
      `${BLOCKCHAIN_API}/invoke`, 
      params,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    logResult('CreateAsset Test', true, response.data);
    return { success: true, data: response.data, patientId: testAsset.PatientId };
  } catch (error) {
    logResult('CreateAsset Test', false, null, error);
    return { success: false, error };
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('\n===== CHAINCODE FUNCTION TESTS =====\n');
  
  // 1. Test GetPrescriptionsByDoctor
  const getPrescriptionsResult = await testGetPrescriptionsByDoctor();
  
  // 2. Test ReadAsset
  const readAssetResult = await testReadAsset();
  
  // 3. Test CreateAsset
  const createAssetResult = await testCreateAsset();
  
  // 4. Test ReadAsset for the newly created asset
  let verifyCreatedAssetResult = { success: false };
  if (createAssetResult.success && createAssetResult.patientId) {
    try {
      console.log(`\nVerifying created asset with ID: ${createAssetResult.patientId}`);
      
      // Format request properly
      const params = new URLSearchParams();
      params.append('channelid', CHANNEL_ID);
      params.append('chaincodeid', CHAINCODE_ID);
      params.append('function', 'ReadAsset');
      params.append('args', createAssetResult.patientId);
      
      // Send to blockchain
      const response = await axios.get(
        `${BLOCKCHAIN_API}/query`, 
        { params }
      );
      
      logResult('Verify Created Asset Test', true, response.data);
      verifyCreatedAssetResult = { success: true, data: response.data };
    } catch (error) {
      logResult('Verify Created Asset Test', false, null, error);
    }
  }
    // Summary
  console.log('\n===== TEST SUMMARY =====');
  console.log(`GetPrescriptionsByDoctor: ${getPrescriptionsResult.success ? 'PASSED ✓' : 'FAILED ✗'}`);
  console.log(`ReadAsset: ${readAssetResult.success ? 'PASSED ✓' : 'FAILED ✗'}`);
  console.log(`CreateAsset: ${createAssetResult.success ? 'PASSED ✓' : 'FAILED ✗'}`);
  console.log(`Verify Created Asset: ${verifyCreatedAssetResult.success ? 'PASSED ✓' : 'FAILED ✗'}`);
  
  const allPassed = getPrescriptionsResult.success && 
                    readAssetResult.success && 
                    createAssetResult.success &&
                    verifyCreatedAssetResult.success;
                    
  console.log(`\nOverall Status: ${allPassed ? 'ALL TESTS PASSED ✓' : 'SOME TESTS FAILED ✗'}`);
};

// Run the tests
runAllTests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
runAllTests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
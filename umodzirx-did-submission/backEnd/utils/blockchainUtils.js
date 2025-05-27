/**
 * Blockchain Utilities - Helper functions for blockchain operations
 */
const axios = require('axios');
const { URLSearchParams } = require('url');
const { queryChaincode, invokeChaincode, parseBlockchainResponse } = require('./blockchainService');

/**
 * Process blockchain response data
 * @param {any} rawData - The raw data from the blockchain
 * @returns {any} - The processed data
 */
function processBlockchainResponse(rawData) {
  return parseBlockchainResponse(rawData);
}

/**
 * Query blockchain with retries
 * @param {string} functionName - The chaincode function to call
 * @param {string|string[]} args - The arguments to pass to the function
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @returns {Promise<any>} - The response from the blockchain
 */
async function queryBlockchainWithRetries(functionName, args, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[BLOCKCHAIN] Query attempt ${attempt}/${maxRetries} for function ${functionName}`);
      const result = await queryChaincode(functionName, args);
      return result;
    } catch (error) {
      console.error(`[BLOCKCHAIN] Query attempt ${attempt} failed:`, error.message);
      lastError = error;
      
      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 100; // 200ms, 400ms, 800ms, etc.
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError || new Error(`Failed to query blockchain after ${maxRetries} attempts`);
}

/**
 * Format prescription data for blockchain submission
 * Based on the CLI format: {"Function":"CreateAsset","Args":["{...JSON object...}"]}
 * 
 * @param {Object} prescriptionData - The prescription data to format
 * @returns {string} - JSON string ready for blockchain submission
 */
function formatPrescriptionForBlockchain(prescriptionData) {
  // Ensure all keys follow the expected capitalization pattern
  const formattedData = {
    PatientId: prescriptionData.patientId || prescriptionData.PatientId,
    DoctorId: prescriptionData.doctorId || prescriptionData.DoctorId,
    PatientName: prescriptionData.patientName || prescriptionData.PatientName,
    DateOfBirth: prescriptionData.dateOfBirth || prescriptionData.DateOfBirth || "",
    Prescriptions: []
  };
    // Format prescriptions array
  if (prescriptionData.prescriptions || prescriptionData.Prescriptions) {
    const prescriptions = prescriptionData.prescriptions || prescriptionData.Prescriptions;
    
    formattedData.Prescriptions = prescriptions.map(p => ({
      PrescriptionId: p.prescriptionId || p.PrescriptionId,
      MedicationName: p.medicationName || p.MedicationName,
      Dosage: p.dosage || p.Dosage,
      Instructions: p.instructions || p.Instructions,
      Status: p.status || p.Status || "Active",
      CreatedBy: p.createdBy || p.CreatedBy || formattedData.DoctorId,
      TxID: p.txID || p.TxID || "",
      Timestamp: p.timestamp || p.Timestamp || new Date().toISOString(),
      ExpiryDate: p.expiryDate || p.ExpiryDate || "",
      DispensingPharmacist: p.dispensingPharmacist || p.DispensingPharmacist || "N/A",
      DispensingTimestamp: p.dispensingTimestamp || p.DispensingTimestamp || "N/A"
    }));
  }
  
  // Return just the JSON string of the data (not wrapped in any additional structure)
  // Return just the JSON string of the data (not wrapped in any additional structure)
  return JSON.stringify(formattedData);
}

/**
 * Direct blockchain API call using the format from CLI commands
 * @param {string} functionName - The chaincode function to call
 * @param {string|Object} args - The arguments to pass to the function
 * @returns {Promise<any>} - The response from the blockchain
 */
async function directBlockchainInvoke(functionName, args) {
  try {
    // Format args as a JSON string if it's an object
    const formattedArgs = typeof args === 'object' ? JSON.stringify(args) : args;
    
    // Create the request body in the format expected by the CLI
    const requestData = new URLSearchParams();
    requestData.append('channelid', process.env.CHANNEL_ID || 'mychannel');
    requestData.append('chaincodeid', process.env.CHAINCODE_ID || 'basic');
    requestData.append('function', functionName);
    requestData.append('args', 
      typeof formattedArgs === 'string' && formattedArgs.length > 100 
        ? formattedArgs.substring(0, 100) + '...' 
        : formattedArgs);
    
    console.log(`[BLOCKCHAIN] Invoking function ${functionName} with args:`, 
      typeof formattedArgs === 'string' && formattedArgs.length > 100 
        ? formattedArgs.substring(0, 100) + '...' 
        : formattedArgs);
    
    // Send the request
    const response = await axios.post(
      `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/invoke`,
      requestData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    return response.data;
  } catch (error) {
    console.error(`[BLOCKCHAIN] Direct invoke error for function ${functionName}:`, error.message);
    throw error;
  }
}

/**
 * Direct blockchain API query using the format from CLI commands
 * @param {string} functionName - The chaincode function to call
 * @param {string|Object} args - The arguments to pass to the function
 * @returns {Promise<any>} - The response from the blockchain
 */
async function directBlockchainQuery(functionName, args) {
  try {
    // Format args as a JSON string if it's an object
    const formattedArgs = typeof args === 'object' ? JSON.stringify(args) : args;
    
    // Create the request params in the format expected by the CLI
    const params = {
      channelid: process.env.CHANNEL_ID || 'mychannel',
      chaincodeid: process.env.CHAINCODE_ID || 'basic',
      function: functionName,
      args: 
      typeof formattedArgs === 'string' && formattedArgs.length > 100 
        ? formattedArgs.substring(0, 100) + '...' 
        : formattedArgs
    };
    
    console.log(`[BLOCKCHAIN] Querying function ${functionName} with args:`, 
      typeof formattedArgs === 'string' && formattedArgs.length > 100 
        ? formattedArgs.substring(0, 100) + '...' 
        : formattedArgs);
    
    // Send the request
    const response = await axios.get(
      `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/query`,
      { params }
    );
    
    return response.data;
  } catch (error) {
    console.error(`[BLOCKCHAIN] Direct query error for function ${functionName}:`, error.message);
    throw error;
  }
}

module.exports = {
  processBlockchainResponse,
  queryBlockchainWithRetries,
  formatPrescriptionForBlockchain,
  directBlockchainInvoke,
  directBlockchainQuery
};
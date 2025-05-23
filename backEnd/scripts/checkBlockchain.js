/**
 * Simple script to check blockchain connectivity and API behavior
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const API_BASE = process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000';
const CHANNEL_ID = process.env.CHANNEL_ID || 'mychannel';
const CHAINCODE_ID = process.env.CHAINCODE_ID || 'basic';
const TEST_PATIENT_ID = 'test-patient-1715606400000'; // Use a known patient ID or your own

async function checkBlockchain() {
  console.log('=======================================');
  console.log('🔍 BLOCKCHAIN CONNECTION TEST');
  console.log('=======================================');
  console.log('API Base URL:', API_BASE);
  console.log('Channel ID:', CHANNEL_ID);
  console.log('Chaincode ID:', CHAINCODE_ID);
  console.log('Test Patient ID:', TEST_PATIENT_ID);
  console.log('---------------------------------------\n');

  try {
    console.log('1️⃣ Testing direct query with GET params...');
    
    const directQueryUrl = `${API_BASE}/query?channelid=${CHANNEL_ID}&chaincodeid=${CHAINCODE_ID}&function=ReadAsset&args=${TEST_PATIENT_ID}`;
    console.log(`GET ${directQueryUrl}`);
    
    const directResponse = await axios.get(directQueryUrl);
    
    console.log('✅ Response received!');
    console.log('Status:', directResponse.status);
    console.log('Headers:', JSON.stringify(directResponse.headers, null, 2));
    console.log('Data:', directResponse.data);
    console.log('\n---------------------------------------\n');
    
    // Test with axios params
    console.log('2️⃣ Testing query with axios params...');
    
    const paramsResponse = await axios.get(`${API_BASE}/query`, {
      params: {
        channelid: CHANNEL_ID,
        chaincodeid: CHAINCODE_ID,
        function: 'ReadAsset',
        args: TEST_PATIENT_ID
      }
    });
    
    console.log('✅ Response received!');
    console.log('Status:', paramsResponse.status);
    console.log('Data:', paramsResponse.data);
    
  } catch (error) {
    console.error('❌ ERROR!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      console.error('No response received. Is the blockchain API running?');
      console.error('Request details:', error.request._header);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
checkBlockchain();

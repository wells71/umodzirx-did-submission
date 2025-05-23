require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');

async function testBlockchainAPI() {
  try {
    console.log('Testing blockchain API with different request formats...');    const testAsset = {
      PatientId: "test-" + Date.now(),
      DoctorId: "doctor-test",
      PatientName: "Test Patient",
      Prescriptions: [
        {
          PrescriptionId: "rx-test-" + Date.now(),
          PatientId: "test-" + Date.now(),
          CreatedBy: "doctor-test", 
          MedicationName: "Test Medication",
          Dosage: "10mg",
          Instructions: "Take twice daily",
          Status: "Active",
          ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ]
    };
    
    const assetJSON = JSON.stringify(testAsset);
    
    // Try using direct querystring format
    console.log('\n--- Method 1: Direct querystring ---');
    const url = `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/invoke?channelid=mychannel&chaincodeid=basic&function=CreateAsset&args=${encodeURIComponent(assetJSON)}`;
    console.log('Request URL:', url);
    
    try {
      const response1 = await axios.post(url);
      console.log('Response:', response1.data);
    } catch (err) {
      console.error('Method 1 failed:', err.message);
    }
    
    // Try using curl format as shown in example
    console.log('\n--- Method 2: Form data as curl example shows ---');
    const formData = new FormData();
    formData.append('channelid', 'mychannel');
    formData.append('chaincodeid', 'basic');
    formData.append('function', 'CreateAsset');
    formData.append('args', assetJSON);
    
    try {
      const response2 = await axios.post(
        `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/invoke`, 
        formData,
        { headers: formData.getHeaders() }
      );
      console.log('Response:', response2.data);
    } catch (err) {
      console.error('Method 2 failed:', err.message);
    }
    
    // Try using URLSearchParams
    console.log('\n--- Method 3: URLSearchParams ---');
    const params = new URLSearchParams();
    params.append('channelid', 'mychannel');
    params.append('chaincodeid', 'basic');
    params.append('function', 'CreateAsset');
    params.append('args', assetJSON);
    
    console.log('Request body:', params.toString());
    
    try {
      const response3 = await axios.post(
        `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/invoke`,
        params,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      console.log('Response:', response3.data);
    } catch (err) {
      console.error('Method 3 failed:', err.message);
    }
    
    // Try direct string (this often works with Go servers)
    console.log('\n--- Method 4: Direct string ---');
    const data = `channelid=mychannel&chaincodeid=basic&function=CreateAsset&args=${encodeURIComponent(assetJSON)}`;
    console.log('Request body:', data);
    
    try {
      const response4 = await axios.post(
        `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/invoke`,
        data,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      console.log('Response:', response4.data);
    } catch (err) {
      console.error('Method 4 failed:', err.message);
    }
    
    // Try using array notation for args
    console.log('\n--- Method 5: Array notation for args ---');
    const paramsArray = new URLSearchParams();
    paramsArray.append('channelid', 'mychannel');
    paramsArray.append('chaincodeid', 'basic');
    paramsArray.append('function', 'CreateAsset');
    paramsArray.append('args', assetJSON);
    
    console.log('Request body:', paramsArray.toString());
    
    try {
      const response5 = await axios.post(
        `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/invoke`,
        paramsArray,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      console.log('Response:', response5.data);
    } catch (err) {
      console.error('Method 5 failed:', err.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testBlockchainAPI().then(() => console.log('Debug testing complete')).catch(console.error);

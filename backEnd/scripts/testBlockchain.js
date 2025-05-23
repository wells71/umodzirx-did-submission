require('dotenv').config();
const axios = require('axios');
const { URLSearchParams } = require('url');

async function testBlockchainConnection() {
  console.log('Testing blockchain connection...');
  
  try {
    // Test the health/ping endpoint if available
    const healthResponse = await axios.get(`${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/health`);
    console.log('Blockchain health check:', healthResponse.data);
  } catch (error) {
    console.log('Health check not available or failed:', error.message);
  }
    // Create a test asset
  const testAsset = {
    PatientId: "test-" + Date.now(),
    DoctorId: "doctor-test",
    PatientName: "Test Patient",
    DateOfBirth: "1990-01-01",
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
  
  try {
    // Format request properly - Args should be a single JSON string in an array
    const requestData = new URLSearchParams();
    requestData.append('channelid', process.env.CHANNEL_ID || 'mychannel');
    requestData.append('chaincodeid', process.env.CHAINCODE_ID || 'basic');
    requestData.append('function', 'CreateAsset');
    requestData.append('args', JSON.stringify(testAsset));
    
    console.log('Sending test invoke with payload:', JSON.stringify(testAsset, null, 2));
    console.log('URL params:', requestData.toString());
    
    const response = await axios.post(
      `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/invoke`,
      requestData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    console.log('Create asset response:', response.data);
    console.log('Test successful!');
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testBlockchainConnection().catch(console.error);

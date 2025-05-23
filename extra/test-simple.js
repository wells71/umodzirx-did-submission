const axios = require('axios');

async function testOpenFDA() {
  try {
    console.log("Starting test...");
    const response = await axios.get('https://api.fda.gov/drug/label.json?limit=1');
    console.log('Status:', response.status);
    console.log('Success!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testOpenFDA();

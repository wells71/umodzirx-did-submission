const axios = require('axios');

async function testOpenFDA() {
  try {
    // URL for a simple query to the OpenFDA API
    const url = 'https://api.fda.gov/drug/label.json';
    const response = await axios.get(url, {
      params: {
        search: 'active_ingredient:acetaminophen',
        limit: 1
      }
    });
    
    console.log('Status Code:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testOpenFDA();

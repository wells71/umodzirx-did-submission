const https = require('https');

// URL for a simple query to the OpenFDA API
const url = 'https://api.fda.gov/drug/label.json?search=active_ingredient:acetaminophen&limit=1';

https.get(url, (res) => {
  let data = '';

  // A chunk of data has been received.
  res.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received.
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    try {
      const parsedData = JSON.parse(data);
      console.log('Response Data:', JSON.stringify(parsedData, null, 2));
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      console.log('Raw response:', data);
    }
  });

}).on('error', (err) => {
  console.error('Error:', err.message);
});

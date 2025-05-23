// Debug OpenFDA API call for drug search
const axios = require('axios');

// Search for azithromycin using different approaches
async function testOpenFDASearch() {
  try {
    // Approach 1: Original query with exact match
    const exactMatchUrl = 'https://api.fda.gov/drug/label.json';
    const exactMatchResponse = await axios.get(exactMatchUrl, {
      params: {
        search: `openfda.brand_name:"azithromycin"~3 OR openfda.generic_name:"azithromycin"~3 OR openfda.substance_name:"azithromycin"~3`,
        limit: 10
      }
    });

    console.log('Approach 1 (Original - Exact Match) Results:');
    if (exactMatchResponse.data && exactMatchResponse.data.results) {
      console.log(`Found ${exactMatchResponse.data.results.length} results`);
      exactMatchResponse.data.results.forEach((result, i) => {
        console.log(`Result ${i + 1}: ${result.openfda?.brand_name?.[0] || 'No brand name'} / ${result.openfda?.generic_name?.[0] || 'No generic name'}`);
      });
    } else {
      console.log('No results found with exact match');
    }

    // Approach 2: More relaxed search
    const relaxedUrl = 'https://api.fda.gov/drug/label.json';
    const relaxedResponse = await axios.get(relaxedUrl, {
      params: {
        search: `azithromycin`,
        limit: 10
      }
    });

    console.log('\nApproach 2 (Simple term search) Results:');
    if (relaxedResponse.data && relaxedResponse.data.results) {
      console.log(`Found ${relaxedResponse.data.results.length} results`);
      relaxedResponse.data.results.forEach((result, i) => {
        console.log(`Result ${i + 1}: ${result.openfda?.brand_name?.[0] || 'No brand name'} / ${result.openfda?.generic_name?.[0] || 'No generic name'}`);
      });
    } else {
      console.log('No results found with relaxed search');
    }

    // Approach 3: Using the drug endpoint instead of label endpoint
    const drugEndpointUrl = 'https://api.fda.gov/drug/ndc.json';
    const drugEndpointResponse = await axios.get(drugEndpointUrl, {
      params: {
        search: `generic_name:azithromycin OR brand_name:azithromycin`,
        limit: 10
      }
    });

    console.log('\nApproach 3 (Using drug/ndc endpoint) Results:');
    if (drugEndpointResponse.data && drugEndpointResponse.data.results) {
      console.log(`Found ${drugEndpointResponse.data.results.length} results`);
      drugEndpointResponse.data.results.forEach((result, i) => {
        console.log(`Result ${i + 1}: ${result.brand_name || 'No brand name'} / ${result.generic_name || 'No generic name'}`);
      });
    } else {
      console.log('No results found with drug endpoint');
    }

  } catch (error) {
    console.error('Error testing OpenFDA API:', error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testOpenFDASearch();

// Export the function for potential use elsewhere
module.exports = {
  testOpenFDASearch
};

/**
 * Blockchain Service - Utility functions for interacting with the blockchain API
 */
const axios = require('axios');

/**
 * Invoke a chaincode function (write operation)
 * @param {string} functionName - The chaincode function to invoke
 * @param {Array|Object|string} args - Arguments to pass to the function
 * @returns {Promise} - The blockchain API response
 */
async function invokeChaincode(functionName, args) {
  try {
    // Create form data with the correct format
    const formData = new URLSearchParams();
    formData.append('channelid', process.env.CHANNEL_ID || 'mychannel');
    formData.append('chaincodeid', process.env.CHAINCODE_ID || 'basic');
    formData.append('function', functionName);
    
    // Format args based on CLI format
    if (Array.isArray(args)) {
      // If it's an array, handle each argument
      args.forEach(arg => {
        // If arg is an object or array, stringify it
        if (typeof arg === 'object') {
          formData.append('args', JSON.stringify(arg));
        } else {
          formData.append('args', arg.toString());
        }
      });
    } else if (typeof args === 'object') {
      // If it's a single object, stringify it
      formData.append('args', JSON.stringify(args));
    } else if (args !== undefined) {
      // If it's a primitive value, convert to string
      formData.append('args', args.toString());
    }

    console.log(`[BLOCKCHAIN] Invoking ${functionName} with args:`, 
      typeof args === 'object' ? JSON.stringify(args).substring(0, 100) + '...' : args);

    // Make the API call
    const response = await axios.post(
      `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/invoke`,
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data;
  } catch (error) {
    console.error('Blockchain invoke error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Query a chaincode function (read operation)
 * @param {string} functionName - The chaincode function to query
 * @param {Array|Object|string} args - Arguments to pass to the function
 * @returns {Promise} - The blockchain API response
 */
async function queryChaincode(functionName, args) {
  try {
    // Create URL parameters
    const params = new URLSearchParams();
    params.append('channelid', process.env.CHANNEL_ID || 'mychannel');
    params.append('chaincodeid', process.env.CHAINCODE_ID || 'basic');
    params.append('function', functionName);
    
    // Format args based on CLI format
    if (Array.isArray(args)) {
      // If it's an array, handle each argument
      args.forEach(arg => {
        // If arg is an object or array, stringify it
        if (typeof arg === 'object') {
          params.append('args', JSON.stringify(arg));
        } else {
          params.append('args', arg.toString());
        }
      });
    } else if (typeof args === 'object') {
      // If it's a single object, stringify it
      params.append('args', JSON.stringify(args));
    } else if (args !== undefined) {
      // If it's a primitive value, convert to string
      params.append('args', args.toString());
    }

    console.log(`[BLOCKCHAIN] Querying ${functionName} with args:`, 
      typeof args === 'object' ? JSON.stringify(args).substring(0, 100) + '...' : args);

    // Make the API call
    const url = `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/query`;
    const response = await axios.get(url, { 
      params: params,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.data;
  } catch (error) {
    console.error('Blockchain query error:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Parse blockchain response data
 * @param {any} rawData - The raw data from the blockchain
 * @returns {any} - The parsed data
 */
function parseBlockchainResponse(rawData) {
  try {
    // If it's already an object, return it
    if (rawData === null || rawData === undefined) {
      return null;
    }
    
    if (typeof rawData === 'object' && !Buffer.isBuffer(rawData)) {
      return rawData;
    }
    
    // If it's a string, try to parse it as JSON
    if (typeof rawData === 'string') {
      // Handle empty strings
      if (rawData.trim() === '') {
        return null;
      }
      
      // Check if it's an error message
      if (rawData.includes('error') || rawData.includes('Error') || rawData.includes('does not exist')) {
        console.log('[PARSE] Detected error message in response:', rawData);
        return { error: rawData };
      }
      
      // Check if the response starts with "Response:" and extract the JSON part
      if (rawData.startsWith('Response:')) {
        console.log('[PARSE] Detected "Response:" prefix, extracting JSON part');
        const jsonPart = rawData.substring('Response:'.length).trim();
        try {
          return JSON.parse(jsonPart);
        } catch (jsonError) {
          console.log('[PARSE] Failed to parse JSON after "Response:" prefix');
          // Continue to try other parsing methods
        }
      }
      
      try {
        return JSON.parse(rawData);
      } catch (jsonError) {
        console.log('[PARSE] Failed to parse as JSON, attempting to clean the string');
        
        // Try to find a valid JSON object in the string
        const possibleJsonStart = rawData.indexOf('{');
        const possibleJsonEnd = rawData.lastIndexOf('}') + 1;
        
        if (possibleJsonStart !== -1 && possibleJsonEnd > possibleJsonStart) {
          const jsonCandidate = rawData.substring(possibleJsonStart, possibleJsonEnd);
          try {
            return JSON.parse(jsonCandidate);
          } catch (cleanJsonError) {
            console.log('[PARSE] Failed to parse cleaned JSON string');
          }
        }
        
        console.log('[PARSE] All parsing attempts failed, returning as string');
        return rawData;
      }
    }
    
    // If it's a Buffer, convert to string and try to parse
    if (Buffer.isBuffer(rawData)) {
      const strData = rawData.toString('utf8');
      try {
        return JSON.parse(strData);
      } catch (bufferError) {
        console.log('[PARSE] Failed to parse buffer as JSON, returning as string');
        return strData;
      }
    }
    
    // Default fallback
    return rawData;
  } catch (err) {
    console.error('[PARSE] Failed to parse blockchain response:', err);
    return null;
  }
}

module.exports = {
  invokeChaincode,
  queryChaincode,
  parseBlockchainResponse
};
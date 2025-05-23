import axios from 'axios';

const MOSIP_BASE_URL = 'https://api.mosip.io/v1';

export const initiateAuth = async () => {
  try {
    const response = await axios.post(`${MOSIP_BASE_URL}/auth/initiate`, {
      clientId: process.env.REACT_APP_MOSIP_CLIENT_ID,
      clientSecret: process.env.REACT_APP_MOSIP_CLIENT_SECRET
    });
    return response.data;
  } catch (error) {
    console.error('MOSIP Auth Initiation Error:', error);
    throw error;
  }
};

export const verifyDigitalID = async (digitalId) => {
  try {
    const response = await axios.post(`${MOSIP_BASE_URL}/auth/verify`, {
      digitalId,
      clientId: process.env.REACT_APP_MOSIP_CLIENT_ID
    });
    return response.data;
  } catch (error) {
    console.error('MOSIP DigitalID Verification Error:', error);
    throw error;
  }
};

export const getAuthToken = async (authCode) => {
  try {
    const response = await axios.post(`${MOSIP_BASE_URL}/auth/token`, {
      code: authCode,
      clientId: process.env.REACT_APP_MOSIP_CLIENT_ID,
      clientSecret: process.env.REACT_APP_MOSIP_CLIENT_SECRET
    });
    return response.data;
  } catch (error) {
    console.error('MOSIP Token Fetch Error:', error);
    throw error;
  }
};

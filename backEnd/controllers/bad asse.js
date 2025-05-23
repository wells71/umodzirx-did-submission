const axios = require('axios');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const jose = require('jose');
const User = require('../models/User');
const { generateToken } = require('../utils/auth');
const { createPrivateKey } = require('crypto');
const { URLSearchParams } = require('url');

const ISSUER = 'http://localhost:8088';
const CLIENT_ID = 'IIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjQR0E';
const REDIRECT_URI = 'http://localhost:5000/auth/login';
const TOKEN_PATH = '/v1/esignet/oauth/v2/token';
const USERINFO_PATH = '/v1/esignet/oidc/userinfo';
const SCOPES = 'openid profile email';
const CALLBACK_URL = 'http://localhost:13130/callback';


const PRIVATE_KEY_JWK = {
  "kty": "RSA",
  "n": "jQR0E6R6JNbCaFxxGySedRKS2YxniJIBRhGo58Lfqe8GvZT5-Ono7HaEkpXfejY4ELGIFBgiyercpisf8rE4DurxaoaQ8AQZpaf_LM1Ti4rHjU8Z_oiyc-hxG2LX48rOJLy5vR2VwtVOmMKF3OtHHhTvivG1MDTOBLVFj0EDhyaLogryTr0KPT6UfbWUD340bNhL8vWzBeQrUFFBl8KoumP_o8XBzUTRUzcUNFCKbLvabgzuQXkWsaMWpQwlhdJAlrIeSbVWz7kAcOik9KPsWvNVkvB_coRlp83gCxxJLRMkt1FiL3m5knikuvIvJ0ZxcBwl9_Sn2FDWoggTJT6ZVw",
  "e": "AQAB",
  "d": "cq9Dg9IJMDqkguFjbzK51_aSDXFdpjkv5f9owYvAAOEPN1GYdnItZ1n_-YL_69F6iUEIrWbvrA1hA5cg9WxhbehvDDaCW2DKRuo44gPexSbJocfKGTKtBwzsJ9ycPXrraf8-g2ozKO_3as8QtRl3jiRyqCppM9pODpAqERZLuzZNzkxV7T1uOqsmGQb-a0syCJPafsk-WYMiiWreb6B5FKIaWE5LMV8lyzpsbe0WWyQUtdc1uIhtspNm_C8rwUJ22mZnnKXfcR1uTbQ6aYCivNFNmTnYpgjNCKSALooReF_7zY262L9DsrhKh3OCqEsTmip281ECFAzu_Wr8IGS7SQ",
  "p": "wfFCqWT5RaRAKGDc74T9WiFRepcVATrdZ0NRwtFUa191wiDqaHXMjDFZGhIg2hV20IhMM3v0gnUVNaXLJykymxdb9mb4L3mN4N15---bAMkf7YFjG_t9RQgSWnw14RhR7O-lZNzeuzNdQck41Rip-WQamCIz71mm9tDW6z9c69M",
  "q": "uiPaqkiRAbKBjD_TpTeFrGcO-bsJrvXeIGqYDAMwr0UF2PsAy9qSyEYsMTkr4O2JgK2l-AbQsUpZJJ8ugvfjJ0Sbn3QgSzmxCBLf_RboK-tWBkyQ1TyCdf3yiElCQFGmprC9Q6vYqwJV1sRpVihsnvwBs88sOy_HDE53ZMZ9Pe0",
  "dp": "vwlSG5-9tq6rD9sR5dE-6ggFxVaKtzJvomb6Y4dku3tFeJqJq6nVeYamePrAZ3FbHuATB2ejGtoPsU-FhCadlY115YnaEJGQgp5GqTaEnUp_66hWotqfs17XDVBqljYphNUuOuMhdo6K3uFB3Q41Z9YGKDMQq0TJJTfja8h3VEc",
  "dq": "IPJXsexGPlaqN3jUrVm2f11-eRVyEVXTi0lSwE2QQHWnI1DKQ0rc0DYbfFryOU3SGMSjq9MI_Vh7js_eG7BktH6gTQjw7l-3xgYRP2rejWeKQnMq75NWRCw-0YCmCVxqcva1iVTRdPNk3i7FtkpRb5KLepgg7Bj40mTRHTVE1cE",
  "qi": "Q08X7hAygRhwPwPL3GKa-A53XUKp3kMyyR5OTmlSeEUfr_EHhCS5afZPKJpVoIi74bTy5FUd4PeqgVHZMjE4BpMVKoTX2orRFcS_uFr5eSxjV9ODAX6Cf_hIhHV3YZfMxhTRg5Uf_vtzD2YQJSxgWgBXoyFz-RnO8OG-3ToVeyo",
  "kid": "client-assertion-key-1" // Added kid parameter
};

class AuthController {
 
  static base64urlDecode(inputStr) {
    console.log('Base64URL decoding input:', inputStr);
    let paddingNeeded = 4 - (inputStr.length % 4);
    if (paddingNeeded && paddingNeeded !== 4) {
      console.log(`Adding ${paddingNeeded} padding characters`);
      inputStr += '='.repeat(paddingNeeded);
    }
    
    const buffer = Buffer.from(inputStr, 'base64');
    const result = buffer.toString('utf-8');
    console.log('Base64URL decoding result:', result);
    return result;
  }


  static async jwtToPem(jwk) {
    console.log('Converting JWK to PEM...');
    try {
      // Convert JWK to PEM using jwkToPem
      const pem = jwkToPem(jwk, { private: true });
      console.log('Successfully converted JWK to PEM');
      return pem;
    } catch (error) {
      console.error('Error converting JWK to PEM:', error);
      throw error;
    }
  }

  static async login(req, res) {
    console.log('\n=== LOGIN STARTED ===');
    
    try {
      // 1. Get authorization code from query params
      const code = req.query.code;
      console.log('Authorization code received:', code);
      
      // 2. Convert JWK to PEM format
      const privateKeyPem = await AuthController.jwtToPem(PRIVATE_KEY_JWK);
      console.log('Private key converted to PEM format');
      
      // 3. Create private key for signing
      const privateKey = createPrivateKey({
        key: privateKeyPem,
        format: 'pem'
      });

      // 4. Prepare client assertion payload
      const now = Math.floor(Date.now() / 1000);
      const clientAssertionPayload = {
        iss: CLIENT_ID,
        sub: CLIENT_ID,
        aud: ISSUER + TOKEN_PATH,
        jti: Math.random().toString(36).substring(2),
        exp: now + 300,
        iat: now
      };
      console.log('Client assertion payload:', clientAssertionPayload);
      
      // 5. Sign the client assertion JWT
      const clientAssertion = jwt.sign(clientAssertionPayload, privateKey, { 
        algorithm: 'RS256',
        keyid: PRIVATE_KEY_JWK.kid
      });
      console.log('Client assertion JWT generated');

      // 6. Prepare token request parameters
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('client_id', CLIENT_ID);
      params.append('client_assertion_type', 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer');
      params.append('client_assertion', clientAssertion);
      params.append('redirect_uri', REDIRECT_URI);

      console.log('Making token request to:', ISSUER + TOKEN_PATH);
      
      // 7. Exchange authorization code for tokens
      const tokenResponse = await axios.post(ISSUER + TOKEN_PATH, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('Token response received');
      
      // 8. Extract access token
      const accessToken = tokenResponse.data.access_token;
      if (!accessToken) {
        throw new Error('No access token received in response');
      }
      console.log('Access token obtained');

      // 9. Fetch user info using access token
      console.log('Making userinfo request to:', ISSUER + USERINFO_PATH);
      const userInfoResponse = await axios.get(ISSUER + USERINFO_PATH, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      console.log('Userinfo response received');
      
      // 10. Process user info
      let userInfo = userInfoResponse.data;
      userInfo = {
        ...userInfo,
        role: 'admin' // Set default role
      };

      // 11. Encrypt user info
      const encryptedUserInfo = AuthController.encrypt(JSON.stringify(userInfo));
      console.log('User info encrypted');

      // 12. Prepare callback parameters
      const callbackParams = {
        code: code,
        encryptedUserInfo: encryptedUserInfo,
        possibleRoles: ['admin', 'user'],
        defaultRole: 'admin',
        encryptionKey: ENCRYPTION_KEY
      };

      // 13. Encode and sign parameters
      const encodedParams = Buffer.from(JSON.stringify(callbackParams)).toString('base64');
      const sig = crypto.createHash('sha256')
        .update(encodedParams + ENCRYPTION_KEY)
        .digest('hex');

      // 14. Redirect to callback URL with encrypted data
      const redirectUrl = `${CALLBACK_URL}?params=${encodeURIComponent(encodedParams)}&sig=${encodeURIComponent(sig)}`;
      console.log('Redirecting to callback URL:', redirectUrl);
      return res.redirect(redirectUrl);

    } catch (error) {
      console.error('\n=== LOGIN ERROR ===', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      return res.status(500).json({ 
        error: 'Authentication failed',
        details: error.response?.data || error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  static async register(req, res) {
    // ... (keep existing register implementation)
  }
}

module.exports = AuthController;
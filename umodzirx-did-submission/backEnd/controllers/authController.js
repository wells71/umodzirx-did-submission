const axios = require('axios');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const { URLSearchParams } = require('url');
const crypto = require('crypto');
const dotenv = require('dotenv');
const UserController = require('../controllers/userController');

dotenv.config();

const TOKEN_EXPIRATION = parseInt(process.env.TOKEN_EXPIRATION_SEC || '300', 10);
const CODE_EXPIRY_MINUTES = parseInt(process.env.CODE_EXPIRY_MINUTES || '5', 10);
const ADMIN_EMAILS = process.env.ADMIN_EMAILS 
  ? process.env.ADMIN_EMAILS.split(',').map(email => email.trim()) 
  : ['admin@example.com'];

let PRIVATE_KEY_PEM;
try {
  const PRIVATE_KEY_JWK = JSON.parse(process.env.PRIVATE_KEY_JWK);
  PRIVATE_KEY_PEM = jwkToPem(PRIVATE_KEY_JWK, { private: true });
} catch (error) {
  console.error('[AUTH] Failed to initialize private key:', error);
  process.exit(1);
}

// strore value of token expiration in seconds
let temporaryInfo ={
  code:'',
  userInfor:'',
  token:''
} ;

const decodeJWT = (token) => {
  const [header, payload] = token.split('.');
  return {
    header: JSON.parse(Buffer.from(header, 'base64').toString()),
    payload: JSON.parse(Buffer.from(payload, 'base64').toString()),
  };
};

const createClientAssertion = async () => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: process.env.CLIENT_ID,
    sub: process.env.CLIENT_ID,
    aud: `${process.env.ISSUER}${process.env.TOKEN_PATH}`,
    jti: crypto.randomBytes(16).toString('hex'),
    exp: now + TOKEN_EXPIRATION,
    iat: now
  };
  return jwt.sign(payload, PRIVATE_KEY_PEM, { algorithm: 'RS256' });
};

const getRoleDashboard = (role) => ({
  admin: '/admin',
  doctor: '/doctor',
  pharmacist: '/pharmacist',
  patient: '/patient'
});

const login = async (req, res) => {
  const { code, state } = req.query;
  
  try {
    if (!code) throw new Error('Authorization code required');
    const clientAssertion = await createClientAssertion();
    
    // Exchange the code for a token
    const tokenResponse = await axios.post(
      `${process.env.ISSUER}${process.env.TOKEN_PATH}`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env.CLIENT_ID,
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: clientAssertion,
        redirect_uri: process.env.REDIRECT_URI
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    console.log("[AUTH] Token exchange successful");

    // Get user info
    const userInfoResponse = await axios.get(
      `${process.env.ISSUER}${process.env.USERINFO_PATH}`,
      { headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` } }
    );
    
    const userInfo = decodeJWT(userInfoResponse.data).payload;

    let role = userInfo.role || 'patient'; 

    // Use UserController instead of staffTable for consistency
    const dbUser = await UserController.findUserByDigitalID(userInfo.phone_number);
    if (dbUser && !role.includes(dbUser.role)) role = (dbUser.role);

    const user = { 
      id: userInfo.phone_number, 
      email: userInfo.email, 
      name: userInfo.name, 
      birthday: userInfo.birthdate,
      role: role
    };

    // Generate a temporary code for the frontend
    const frontendCode = crypto.randomBytes(32).toString('hex');
    temporaryInfo = {
      code: frontendCode, 
      user: user,
      role: role
    };
     
    // Create the redirect URL to the frontend
    const redirectUrl = new URL(process.env.FRONTEND_CALLBACK_PATH, process.env.FRONTEND_BASE_URL);
    redirectUrl.searchParams.append('code', frontendCode);
    redirectUrl.searchParams.append('role', role);
    
    console.log("[AUTH] Redirecting to frontend:", redirectUrl.toString());

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    return res.redirect(`${process.env.FRONTEND_ERROR_PATH}?error=authentication_failed`);
  }
};

const exchangeCode = async (req, res) => {
  const { code, role } = req.body;
  console.log("[AUTH] Received authorization request with code:", code, "role:", role);
  
  try {
    // Check if code exists and matches the stored temporary code
    if (!code || code !== temporaryInfo.code) {
      console.error("[AUTH] Invalid code received:", code);
      console.error("[AUTH] Expected code:", temporaryInfo.code);
      throw new Error('Invalid or expired authorization code');
    }
    
    // Validate role
    const validRoles = ['admin', 'doctor', 'patient', 'pharmacist'];
    if (!role || !validRoles.includes(role)) {
      console.error("[AUTH] Invalid role received:", role);
      throw new Error('Invalid role selection');
    }

    console.log("[AUTH] Creating token for user:", temporaryInfo.user?.id);
    
    // Create JWT token
    const token = jwt.sign(
      {
        id: temporaryInfo.user.id,
        email: temporaryInfo.user.email,
        role: role
      },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    console.log("[AUTH] Token created successfully");

    return res.json({
      success: true,
      token,
      user: {
        id: temporaryInfo.user.id,
        email: temporaryInfo.user.email,
        name: temporaryInfo.user.name,
        birthday: temporaryInfo.user.birthday,
      },
      role: temporaryInfo.role
    });
  } catch (error) {
    console.error('[AUTH] Exchange error:', error);
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { login, exchangeCode, getRoleDashboard };
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// OIDC Callback for Login
router.get('/login', authController.login);

// Registration Endpoint (if implemented)


// Exchange Code Endpoint
router.post('/exchange', authController.exchangeCode);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// OIDC Callback for Login
router.get('/login', authController.login);

// Exchange Code Endpoint
router.post('/exchange', authController.exchangeCode);

module.exports = router;

const express = require('express');
const router = express.Router();
const PharmacistController = require('../controllers/pharmacistController');

// Authentication and verification routes
router.get('/veripatient', PharmacistController.veripatient);

// Prescription management routes
router.get('/prescriptions', PharmacistController.getPrescriptions);
router.post('/dispense', PharmacistController.dispenseMedication);

// New route for viewing dispense history
router.get('/dispense-history/:pharmacistId', PharmacistController.getDispenseHistory);

module.exports = router;
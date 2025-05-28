const express = require('express');
const PatientController = require('../controllers/patientController');

const router = express.Router();

// Patient prescription routes
router.get('/prescriptions', PatientController.getPrescriptions);

// Patient prescription history
router.get('/prescriptions/history/:patientId', PatientController.getPrescriptionHistory);

// Patient profile routes
router.get('/profile', PatientController.getPatientProfile);
router.post('/profile', PatientController.updatePatientProfile);

module.exports = router;

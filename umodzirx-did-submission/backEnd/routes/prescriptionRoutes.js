const express = require('express');
const PrescriptionController = require('../controllers/prescriptionController');
const router = express.Router();

// POST: Create a prescription
router.post('/prescriptions', PrescriptionController.createPrescription);

// GET: Retrieve a prescription by patientId (query param)
router.get('/prescriptions', PrescriptionController.getPrescription);

// POST: Revoke a prescription
router.post('/prescriptions/revoke', PrescriptionController.revokePrescription);

// POST: Dispense a prescription
router.post('/prescriptions/dispense', PrescriptionController.dispensePrescription);

// POST: Update a prescription
router.put('/prescriptions', PrescriptionController.updatePrescription);

// GET: Get prescription history for a doctor (both route param and query param versions)
router.get('/prescriptions/doctor/:doctorId', PrescriptionController.getDoctorPrescriptionHistory);
router.get('/prescriptions/doctor', PrescriptionController.getDoctorPrescriptionHistory); // Added for query param support

// GET: Patient verification callback
router.get('/verifypatient', PrescriptionController.verifypatient);

module.exports = router;


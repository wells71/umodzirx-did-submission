const express = require('express');
const router = express.Router();
const PrescriptionController = require('../controllers/prescriptionController');
const PharmacistController = require('../controllers/pharmacistController');

// Handle prescription dispensing
router.post('/dispense', async (req, res) => {
  console.log('Prescription dispense request received:', JSON.stringify(req.body));
  
  try {
    // Try the PrescriptionController first
    return await PrescriptionController.dispensePrescription(req, res);
  } catch (error) {
    console.error('Failed with PrescriptionController, trying PharmacistController:', error);
    
    // If PrescriptionController fails, try the PharmacistController
    return await PharmacistController.dispenseMedication(req, res);
  }
});

module.exports = router;

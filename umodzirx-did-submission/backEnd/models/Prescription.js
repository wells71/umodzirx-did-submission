const axios = require('axios');

class PrescriptionController {
  static async createPrescription(req, res) {
    const { doctor_name, patient_id, medication, dosage, instructions } = req.body;
    
    const requestData = {
      headers: {
        type: "SendTransaction",
        signer: "user1",
        channel: "default-channel",
        chaincode: "chaincode_js"
      },
      func: "issuePrescription",
      args: [
        `pres-${Date.now()}`, // Unique Prescription ID
        doctor_name,
        patient_id,
        medication,
        dosage,
        instructions,
        "24" // Example additional argument
      ],
      init: false
    };

    try {
      const response = await axios.post(
        'https://u0zy6vfzce-u0xgnn6gvm-connect.us0-aws-ws.kaleido.io/transactions',
        requestData,
        {
          headers: {
            'accept': '*/*',
            'Content-Type': 'application/json',
            'Authorization': 'Basic dTBkNjkyZ3hmaTpCb2tqQ3JreXIzNk1qZnowZDc4WkIyWmx5RGRDejdaczk1UDhIYnBQdzNF'
          }
        }
      );

      res.status(201).json({
        message: 'Prescription created successfully on blockchain',
        data: response.data
      });
    } catch (error) {
      console.error('Error creating prescription:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'Failed to create prescription' });
    }
  }

  static async getPrescription(req, res) {
    try {
      const response = await axios.get(
        'https://u0zy6vfzce-u0xgnn6gvm-connect.us0-aws-ws.kaleido.io/transactions/3f8bae104040b3a732eb1dc3e99682071baf4e0fb370c6fc643c62b389f378d3?fly-channel=default-channel&fly-signer=user1',
        {
          headers: {
            'accept': 'application/json',
            'Authorization': 'Basic dTBkNjkyZ3hmaTpCb2tqQ3JreXIzNk1qZnowZDc4WkIyWmx5RGRDejdaczk1UDhIYnBQdzNF'
          }
        }
      );

      res.json(response.data);
    } catch (error) {
      console.error('Error fetching prescription:', error.response ? error.response.data : error.message);
      res.status(500).json({ message: 'Failed to retrieve prescription' });
    }
  }
}

module.exports = PrescriptionController;

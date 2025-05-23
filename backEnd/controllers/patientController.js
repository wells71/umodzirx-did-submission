const axios = require('axios');
const crypto = require('crypto');

class PatientController {
  static async getPrescriptions(req, res) {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ 
        error: "Patient ID is required" 
      });
    }

    try {
      // Query blockchain using ReadAsset function
      const response = await axios.get(`${process.env.BLOCKCHAIN_API_URL}/query`, {
        params: {
          channelid: process.env.CHANNEL_ID,
          chaincodeid: process.env.CHAINCODE_ID,
          function: "ReadAsset",
          args: patientId,
        },
      });

      // Check if response contains valid data
      if (!response.data || response.data.error) {
        return res.status(404).json({
          success: false,
          error: "Prescription not found",
        });
      }

      let rawData = response.data;
      
      // If response is a string starting with "Response: ", extract the JSON part
      if (typeof rawData === "string" && rawData.startsWith("Response: ")) {
        rawData = rawData.replace("Response: ", "").trim();
      }

      let historyData;
      try {
        historyData = JSON.parse(rawData);
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: "Failed to parse blockchain response",
          details: err.message,
        });
      }

      // Process prescription data - the returned data should be a single asset object, not an array
      let asset;
      if (Array.isArray(historyData)) {
        // If it's an array (for compatibility), find the correct asset
        asset = historyData.find(entry => entry.PatientId === patientId);
        if (!asset) {
          return res.status(404).json({
            success: false,
            error: "No valid prescription found",
          });
        }
      } else if (typeof historyData === 'object') {
        // If response is a single object
        asset = historyData;
      } else {
        return res.status(500).json({
          success: false,
          error: "Unexpected response format from blockchain",
        });
      }

      // Extract prescriptions from the asset
      const prescriptionsForPatient = [];
      if (asset.Prescriptions && Array.isArray(asset.Prescriptions)) {
        asset.Prescriptions.forEach(prescription => {
          prescriptionsForPatient.push({
            prescriptionId: prescription.PrescriptionId || crypto.randomBytes(8).toString('hex'),
            medicationName: prescription.MedicationName || "Unknown",
            dosage: prescription.Dosage || "N/A",
            instructions: prescription.Instructions || "N/A",
            diagnosis: prescription.Diagnosis || "N/A",
            createdBy: prescription.CreatedBy || asset.DoctorId || "N/A",
            status: prescription.Status || "Active",
            txId: prescription.TxID || "",
            timestamp: prescription.Timestamp || new Date().toISOString(),
            expiryDate: prescription.ExpiryDate || "",
            dispensingPharmacist: prescription.DispensingPharmacist || "",
            dispensingTimestamp: prescription.DispensingTimestamp || ""
          });
        });
      }

      // Format the response
      const formattedData = {
        patientId,
        patientName: asset.PatientName || "N/A",
        dateOfBirth: asset.DateOfBirth || "N/A",
        prescriptions: prescriptionsForPatient,
      };

      return res.status(200).json({
        success: true,
        data: formattedData,
      });
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve prescriptions",
        details: error.response?.data || error.message,
      });
    }
  }

  static async getPrescriptionHistory(req, res) {
    const { patientId } = req.params;

    if (!patientId) {
      return res.status(400).json({ 
        error: "Patient ID is required",
        success: false
      });
    }

    try {
      // Query blockchain for prescription history
      const response = await axios.get(`${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/query`, {
        params: {
          channelid: process.env.CHANNEL_ID || 'mychannel',
          chaincodeid: process.env.CHAINCODE_ID || 'basic',
          function: "GetAssetHistory",
          args: patientId,
        },
      });

      // Check if response contains valid data
      if (!response.data || response.data.error) {
        return res.status(404).json({
          success: false,
          error: "Prescription history not found",
        });
      }

      let rawData = response.data;
      
      // If response is a string starting with "Response: ", extract the JSON part
      if (typeof rawData === "string" && rawData.startsWith("Response: ")) {
        rawData = rawData.replace("Response: ", "").trim();
      }

      let historyData;
      try {
        historyData = JSON.parse(rawData);
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: "Failed to parse blockchain response",
          details: err.message,
        });
      }

      // Format the prescription history
      const prescriptionHistory = historyData.map(record => ({
        timestamp: record.timestamp,
        txId: record.txId,
        patientName: record.patientName || "N/A",
        doctorId: record.doctorId,
        lastUpdated: record.lastUpdated,
        prescriptions: Array.isArray(record.prescriptions) ? record.prescriptions.map(p => ({
          prescriptionId: p.prescriptionId,
          medicationName: p.medicationName,
          dosage: p.dosage,
          instructions: p.instructions,
          diagnosis: p.diagnosis,
          status: p.status,
          createdBy: p.createdBy,
          timestamp: p.timestamp,
          expiryDate: p.expiryDate || ""
        })) : []
      }));

      return res.status(200).json({
        success: true,
        data: {
          patientId,
          historyCount: prescriptionHistory.length,
          history: prescriptionHistory
        }
      });
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve prescription history",
        details: error.response?.data || error.message,
      });
    }
  }
}

module.exports = PatientController;
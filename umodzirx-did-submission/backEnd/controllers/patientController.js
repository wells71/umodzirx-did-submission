const axios = require('axios');
const crypto = require('crypto');

class PatientController { 
  static async getPrescriptions(req, res) {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    try {
      // Query blockchain for patient asset
      const response = await axios.get(`${process.env.BLOCKCHAIN_API_URL}/query`, {
        params: {
          channelid: process.env.CHANNEL_ID,
          chaincodeid: process.env.CHAINCODE_ID,
          function: "ReadAsset",
          args: patientId,
        },
      });

      if (!response.data || response.data.error) {
        return res.status(404).json({
          success: false,
          error: "Prescription not found",
        });
      }

      // Parse blockchain response
      const asset = PatientController._parseBlockchainResponse(response.data, patientId);
      if (!asset.success) {
        return res.status(asset.status).json({
          success: false,
          error: asset.error,
          details: asset.details
        });
      }

      // Transform prescriptions to API format
      const prescriptions = PatientController._formatPrescriptions(asset.data);

      return res.status(200).json({
        success: true,
        data: {
          patientId,
          patientName: asset.data.PatientName || "N/A",
          dateOfBirth: asset.data.DateOfBirth || "N/A",
          prescriptions,
        },
      });
    } catch (error) {
      console.error("Prescription retrieval error:", error.response?.data || error.message);
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
      // Query blockchain for asset history
      const response = await axios.get(`${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/query`, {
        params: {
          channelid: process.env.CHANNEL_ID || 'mychannel',
          chaincodeid: process.env.CHAINCODE_ID || 'basic',
          function: "GetAssetHistory",
          args: patientId,
        },
      });

      if (!response.data || response.data.error) {
        return res.status(404).json({
          success: false,
          error: "Prescription history not found",
        });
      }

      // Parse blockchain response
      const historyData = PatientController._parseBlockchainResponse(response.data);
      if (!historyData.success) {
        return res.status(500).json({
          success: false,
          error: historyData.error,
          details: historyData.details,
        });
      }

      // Format prescription history
      const history = historyData.data.map(record => ({
        timestamp: record.timestamp,
        txId: record.txId,
        patientName: record.patientName || "N/A",
        doctorId: record.doctorId,
        lastUpdated: record.lastUpdated,
        prescriptions: PatientController._formatPrescriptions(record.prescriptions || [])
      }));

      return res.status(200).json({
        success: true,
        data: {
          patientId,
          historyCount: history.length,
          history
        }
      });
    } catch (error) {
      console.error("Prescription history retrieval error:", error.response?.data || error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve prescription history",
        details: error.response?.data || error.message,
      });
    }
  }

  static _parseBlockchainResponse(rawData, patientId = null) {
    try {
      // Extract JSON from prefixed response strings
      if (typeof rawData === "string" && rawData.startsWith("Response: ")) {
        rawData = rawData.replace("Response: ", "").trim();
      }

      const parsedData = typeof rawData === "string" ? JSON.parse(rawData) : rawData;

      // Handle array responses (find specific patient asset)
      if (Array.isArray(parsedData) && patientId) {
        const asset = parsedData.find(entry => entry.PatientId === patientId);
        if (!asset) {
          return {
            success: false,
            status: 404,
            error: "No valid prescription found"
          };
        }
        return { success: true, data: asset };
      }

      // Handle single object or array responses
      if (typeof parsedData === 'object') {
        return { success: true, data: parsedData };
      }

      return {
        success: false,
        status: 500,
        error: "Unexpected response format from blockchain"
      };
    } catch (err) {
      return {
        success: false,
        status: 500,
        error: "Failed to parse blockchain response",
        details: err.message
      };
    }
  }

  static _formatPrescriptions(data) {
    const prescriptions = data?.Prescriptions || data || [];
    
    if (!Array.isArray(prescriptions)) {
      return [];
    }

    return prescriptions.map(prescription => ({
      prescriptionId: prescription.PrescriptionId || 
                     prescription.prescriptionId || 
                     crypto.randomBytes(8).toString('hex'),
      medicationName: prescription.MedicationName || prescription.medicationName || "Unknown",
      dosage: prescription.Dosage || prescription.dosage || "N/A",
      instructions: prescription.Instructions || prescription.instructions || "N/A",
      diagnosis: prescription.Diagnosis || prescription.diagnosis || "N/A",
      status: prescription.Status || prescription.status || "Active",
      createdBy: prescription.CreatedBy || prescription.createdBy || "N/A",
      timestamp: prescription.Timestamp || prescription.timestamp || new Date().toISOString(),
      expiryDate: prescription.ExpiryDate || prescription.expiryDate || "",
      dispensingPharmacist: prescription.DispensingPharmacist || prescription.dispensingPharmacist || "",
      dispensingTimestamp: prescription.DispensingTimestamp || prescription.dispensingTimestamp || "",
      txId: prescription.TxID || prescription.txId || ""
    }));
  }
}

module.exports = PatientController;
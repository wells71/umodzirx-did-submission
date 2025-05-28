const axios = require('axios');
const crypto = require('crypto');
const { pool } = require('../config/db');

class PatientController { 
  static async ensurePatientProfileTableExists() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS patient_profiles (
          id SERIAL PRIMARY KEY,
          patient_id TEXT UNIQUE NOT NULL,
          name TEXT,
          sex TEXT,
          occupation TEXT,
          alcohol_use TEXT,
          tobacco_use TEXT,
          blood_group TEXT,
          other_history TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS patient_allergies (
          id SERIAL PRIMARY KEY,
          patient_id TEXT NOT NULL,
          name TEXT NOT NULL,
          severity TEXT,
          reaction TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patient_profiles(patient_id) ON DELETE CASCADE
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS patient_medical_conditions (
          id SERIAL PRIMARY KEY,
          patient_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patient_profiles(patient_id) ON DELETE CASCADE
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS patient_medications (
          id SERIAL PRIMARY KEY,
          patient_id TEXT NOT NULL,
          name TEXT NOT NULL,
          dosage TEXT,
          frequency TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patient_profiles(patient_id) ON DELETE CASCADE
        );
      `);

      console.log('✅ Patient profile tables verified');
    } catch (err) {
      console.error('❌ Patient profile table creation error:', err.message);
      throw err;
    }
  }
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

  static async getPatientProfile(req, res) {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ 
        success: false,
        error: "Patient ID is required" 
      });
    }

    try {
      // Ensure tables exist
      await PatientController.ensurePatientProfileTableExists();

      // Get patient profile
      const profileResult = await pool.query(
        'SELECT * FROM patient_profiles WHERE patient_id = $1',
        [patientId]
      );

      if (profileResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Patient profile not found"
        });
      }

      const profile = profileResult.rows[0];

      // Get allergies
      const allergiesResult = await pool.query(
        'SELECT id, name, severity, reaction FROM patient_allergies WHERE patient_id = $1 ORDER BY created_at DESC',
        [patientId]
      );

      // Get medical conditions
      const conditionsResult = await pool.query(
        'SELECT id, name, description FROM patient_medical_conditions WHERE patient_id = $1 ORDER BY created_at DESC',
        [patientId]
      );

      // Get medications
      const medicationsResult = await pool.query(
        'SELECT id, name, dosage, frequency FROM patient_medications WHERE patient_id = $1 ORDER BY created_at DESC',
        [patientId]
      );

      return res.status(200).json({
        success: true,
        data: {
          id: patientId,
          name: profile.name,
          sex: profile.sex,
          occupation: profile.occupation,
          alcoholUse: profile.alcohol_use,
          tobaccoUse: profile.tobacco_use,
          bloodGroup: profile.blood_group,
          otherHistory: profile.other_history,
          allergies: allergiesResult.rows,
          medicalConditions: conditionsResult.rows,
          currentMedications: medicationsResult.rows
        }
      });
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      return res.status(500).json({
        success: false,
        error: "Failed to retrieve patient profile",
        details: error.message
      });
    }
  }

  static async updatePatientProfile(req, res) {
    const { patientId, name, sex, occupation, alcoholUse, tobaccoUse, bloodGroup, otherHistory, allergies, medicalConditions, currentMedications } = req.body;

    if (!patientId) {
      return res.status(400).json({ 
        success: false,
        error: "Patient ID is required" 
      });
    }

    try {
      // Ensure tables exist
      await PatientController.ensurePatientProfileTableExists();

      // Begin transaction
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Check if profile exists
        const profileExists = await client.query(
          'SELECT 1 FROM patient_profiles WHERE patient_id = $1',
          [patientId]
        );

        if (profileExists.rows.length === 0) {
          // Create new profile
          await client.query(
            `INSERT INTO patient_profiles (patient_id, name, sex, occupation, alcohol_use, tobacco_use, blood_group, other_history)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [patientId, name, sex, occupation, alcoholUse, tobaccoUse, bloodGroup, otherHistory]
          );
        } else {
          // Update existing profile but preserve name and sex from eSignet
          // Get existing profile data
          const existingProfile = await client.query(
            'SELECT name, sex FROM patient_profiles WHERE patient_id = $1',
            [patientId]
          );
          
          // Use existing name and sex if they exist (from eSignet)
          const existingName = existingProfile.rows[0].name;
          const existingSex = existingProfile.rows[0].sex;
          
          await client.query(
            `UPDATE patient_profiles 
             SET name = $2, sex = $3, occupation = $4, alcohol_use = $5, tobacco_use = $6, blood_group = $7, other_history = $8, updated_at = CURRENT_TIMESTAMP
             WHERE patient_id = $1`,
            [patientId, existingName || name, existingSex || sex, occupation, alcoholUse, tobaccoUse, bloodGroup, otherHistory]
          );
        }

        // Clear existing allergies and add new ones
        await client.query('DELETE FROM patient_allergies WHERE patient_id = $1', [patientId]);
        if (allergies && allergies.length > 0) {
          for (const allergy of allergies) {
            await client.query(
              `INSERT INTO patient_allergies (patient_id, name, severity, reaction)
               VALUES ($1, $2, $3, $4)`,
              [patientId, allergy.name, allergy.severity, allergy.reaction]
            );
          }
        }

        // Clear existing medical conditions and add new ones
        await client.query('DELETE FROM patient_medical_conditions WHERE patient_id = $1', [patientId]);
        if (medicalConditions && medicalConditions.length > 0) {
          for (const condition of medicalConditions) {
            await client.query(
              `INSERT INTO patient_medical_conditions (patient_id, name, description)
               VALUES ($1, $2, $3)`,
              [patientId, condition.name, condition.description || '']
            );
          }
        }

        // Clear existing medications and add new ones
        await client.query('DELETE FROM patient_medications WHERE patient_id = $1', [patientId]);
        if (currentMedications && currentMedications.length > 0) {
          for (const medication of currentMedications) {
            await client.query(
              `INSERT INTO patient_medications (patient_id, name, dosage, frequency)
               VALUES ($1, $2, $3, $4)`,
              [patientId, medication.name, medication.dosage, medication.frequency]
            );
          }
        }

        await client.query('COMMIT');

        return res.status(200).json({
          success: true,
          message: "Patient profile updated successfully"
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error updating patient profile:', error);
      return res.status(500).json({
        success: false,
        error: "Failed to update patient profile",
        details: error.message
      });
    }
  }
}

module.exports = PatientController;
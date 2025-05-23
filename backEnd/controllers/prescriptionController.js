const axios = require('axios');
const { URLSearchParams } = require('url');
const dotenv = require('dotenv');
const jwkToPem = require('jwk-to-pem');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');



const TOKEN_EXPIRATION = parseInt(process.env.TOKEN_EXPIRATION_SEC || '300', 10);
const CODE_EXPIRY_MINUTES = parseInt(process.env.CODE_EXPIRY_MINUTES || '5', 10);

dotenv.config();

// Import blockchain utilities
const { processBlockchainResponse, queryBlockchainWithRetries } = require('../utils/blockchainUtils');

const decodeJWT = (token) => {
  const [header, payload] = token.split('.');
  return {
    header: JSON.parse(Buffer.from(header, 'base64').toString()),
    payload: JSON.parse(Buffer.from(payload, 'base64').toString()),
  };
};
let PRIVATE_KEY_PEM;
try {
const PRIVATE_KEY_JWK = JSON.parse(process.env.PRIVATE_KEY_JWK);
PRIVATE_KEY_PEM = jwkToPem(PRIVATE_KEY_JWK, { private: true });
} catch (error) {
console.error('[AUTH] Failed to initialize private key:', error);
process.exit(1);
}

const createClientAssertion = async () => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: process.env.CLIENT_ID,
    sub: process.env.CLIENT_ID,
    aud: `${process.env.ISSUER}${process.env.TOKEN_PATH}`,
    jti: crypto.randomBytes(16).toString('hex'),
    exp: now + TOKEN_EXPIRATION,
    iat: now
  };
  return jwt.sign(payload, PRIVATE_KEY_PEM, { algorithm: 'RS256' });
};

class PrescriptionController {
  static async createPrescription(req, res) {
    const { patientId, doctorId, patientName, prescriptions } = req.body;

    // Validate request
    if (!patientId || !doctorId || !patientName || !prescriptions) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: { patientId, doctorId, patientName, prescriptions }
      });
    }

    try {
      // Generate prescription IDs upfront so we can track them
      const prescriptionsWithIds = prescriptions.map(p => ({
        ...p,
        prescriptionId: crypto.randomBytes(8).toString('hex')
      }));

      // Create a properly formatted asset object
      const assetObject = {
        PatientId: patientId,
        DoctorId: doctorId,
        PatientName: patientName,
        DateOfBirth: req.body.dateOfBirth || "N/A",
        Prescriptions: prescriptionsWithIds.map(p => ({
          PrescriptionId: p.prescriptionId,
          MedicationName: p.medicationName || p.medication || 'Unknown',
          Dosage: p.dosage,
          Instructions: p.instructions ,
          Diagnosis : p.diagnosis ,
          Status: "Active",
          CreatedBy: doctorId,
          TxID: "",
          Timestamp: new Date().toISOString(),
          ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          DispensingPharmacist: "N/A",
          DispensingTimestamp: "N/A"
        }))
      };

      // Prepare blockchain request
      const requestData = new URLSearchParams();
      requestData.append('channelid', process.env.CHANNEL_ID || 'mychannel');
      requestData.append('chaincodeid', process.env.CHAINCODE_ID || 'basic');
      requestData.append('function', 'CreateAsset');
      // The args should be a single string in an array, not JSON object itself
      requestData.append('args', JSON.stringify(assetObject));

      console.log(`Creating prescription for patient ${patientId}:`, JSON.stringify(assetObject));

      // Send to blockchain
      const blockchainResponse = await axios.post(
        `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/invoke`, 
        requestData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      console.log(`Blockchain response for create:`, JSON.stringify(blockchainResponse.data));

      // Return formatted response immediately
      res.status(201).json({
        success: true,
        message: 'Prescription creation request submitted successfully',
        data: {
          id: patientId,
          doctorId,
          patientId,
          patientName,
          prescriptions: prescriptionsWithIds.map(p => ({
            prescriptionId: p.prescriptionId,
            medicationName: p.medicationName || p.medication || 'Unknown',
            dosage: p.dosage,
            instructions: p.instructions, 
            diagnosis: p.diagnosis
          })),
          txId: blockchainResponse.data.txId,
          createdAt: new Date().toISOString()
        }
      });

      // After responding to client, verify the prescription was created
      // This runs asynchronously and doesn't block the response
      try {
        // Use exponential backoff for verification
        await queryBlockchainWithRetries({
          channelid: process.env.CHANNEL_ID || 'mychannel',
          chaincodeid: process.env.CHAINCODE_ID || 'basic',
          function: "ReadAsset",
          args: patientId
        }, {
          maxRetries: 6,       // More retries
          initialDelay: 3000,  // Start with 3 seconds
          maxDelay: 30000      // Max 30 seconds between retries
        });
        
        console.log(`✅ Verified prescription creation for patient ${patientId}`);
      } catch (verifyError) {
        // This won't affect the client response since we're already responded
        console.error(`⚠️ Could not verify prescription creation: ${verifyError.message}`);
      }
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      res.status(500).json({ 
        error: 'Failed to create prescription',
        details: error.response?.data || error.message
      });
    }
  }

  static async getPrescription(req, res) {
    const { patientId } = req.query;

    if (!patientId) {
      return res.status(400).json({ error: "Patient ID is required" });
    }

    try {
      // Query blockchain with the correct format
      // Note: The blockchain API expects args to be an array
      const response = await axios.get(`${process.env.BLOCKCHAIN_API_URL || "http://localhost:45000"}/query`, {
        params: {
          channelid: process.env.CHANNEL_ID || "mychannel",
          chaincodeid: process.env.CHAINCODE_ID || "basic",
          function: "ReadAsset", // Using the correct function from smartcontract.go
          args: patientId, // This will be sent as args[]=patientId
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
      console.log("processing query", response.data);
      
      // Check for "does not exist" error in the raw data
      if (typeof rawData === "string" && rawData.includes("does not exist")) {
        // This is not an error - it just means the patient has no prescriptions
        return res.status(200).json({
          success: true,
          message: "No prescriptions found for this patient",
          data: {
            patientId: patientId,
            patientName: "Unknown",
            prescriptions: []
          }
        });
      }

      let assetData;
      try {
        assetData = processBlockchainResponse(rawData); // Use helper function
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: "Failed to parse blockchain response",
          details: err.message,
        });
      }

      // The ReadAsset function returns a single asset object, not an array
      if (!assetData || !assetData.PatientId) {
        return res.status(404).json({
          success: false,
          error: "No valid prescription data found",
          rawResponse: typeof rawData === 'string' ? rawData.substring(0, 100) : 'non-string response'
        });
      }

      // Process the asset data - should be a single object with Prescriptions array
      const asset = assetData;
      
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
            expiryDate: prescription.ExpiryDate || ""
          });
        });
      }

      if (prescriptionsForPatient.length === 0) {
        return res.status(404).json({
          success: false,
          error: "No valid prescription found",
        });
      }

      // Format the response
      const formattedData = {
        patientId: patientId,
        patientName: asset.PatientName || "N/A",
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
        error: "Failed to retrieve prescription",
        details: error.response?.data || error.message,
      });
    }
  }


 
  static  verifypatient = async (req, res) => {
    const { code, state } = req.query;
    console.log("verifypatient at doctor called,,,,");
    try {
      if (!code) throw new Error('Authorization code required');
  
      const clientAssertion = await createClientAssertion();
      const tokenResponse = await axios.post(
        `${process.env.ISSUER}${process.env.TOKEN_PATH}`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          client_id: process.env.CLIENT_ID,
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: clientAssertion,
          redirect_uri: 'http://localhost:5000/doctor/verifypatient'
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
  
      const userInfo = decodeJWT(
        (await axios.get(
          `${process.env.ISSUER}${process.env.USERINFO_PATH}`,
          { headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` } }
        )).data
      ).payload;
  
     
      
      const patient ={ 
        id: userInfo.phone_number, 
        name: userInfo.name , 
        birthday:userInfo.birthdate
       }
  
        console.log('patient', patient);
       console.log("redirectin to doctor dashboard")
      const encodedPatient = Buffer.from(JSON.stringify(patient)).toString('base64');
      const redirectUrl = new URL("/doctor","http://localhost:13130");
      redirectUrl.searchParams.append('patient',encodedPatient);
   
  
      return res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('[AUTH] Login error:', error);
      return res.redirect(`${process.env.FRONTEND_ERROR_PATH}?error=authentication_failed`);
    }
  };

  // RevokePrescription - allows a doctor to revoke an active prescription
  static async revokePrescription(req, res) {
    const { patientId, prescriptionId, doctorId } = req.body;

    // Validate request
    if (!patientId || !prescriptionId || !doctorId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: { patientId, prescriptionId, doctorId }
      });
    }

    try {
      // Prepare blockchain request
      const requestData = new URLSearchParams();
      requestData.append('channelid', process.env.CHANNEL_ID || 'mychannel');
      requestData.append('chaincodeid', process.env.CHAINCODE_ID || 'basic');
      requestData.append('function', 'RevokePrescriptionJSON');
      
      // Format revocation data according to the smartcontract
      const revocationData = {
        patientId: patientId,
        prescriptionId: prescriptionId,
        doctorId: doctorId
      };
      
      // The args should be the JSON string
      requestData.append('args', JSON.stringify(revocationData));

      // Send to blockchain
      const blockchainResponse = await axios.post(
        `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/invoke`, 
        requestData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      return res.status(200).json({
        success: true,
        message: 'Prescription revoked successfully',
        data: {
          patientId,
          prescriptionId,
          doctorId,
          txId: blockchainResponse.data.txId,
          revokedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to revoke prescription',
        details: error.response?.data || error.message
      });
    }
  }
  
  // DispensePrescription - allows a pharmacist to dispense a prescription
  static async dispensePrescription(req, res) {
    const { patientId, prescriptionId, pharmacistId, note } = req.body;

    // Validate request
    if (!patientId || !prescriptionId || !pharmacistId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: { patientId, prescriptionId, pharmacistId }
      });
    }

    try {
      // Prepare blockchain request
      const requestData = new URLSearchParams();
      requestData.append('channelid', process.env.CHANNEL_ID || 'mychannel');
      requestData.append('chaincodeid', process.env.CHAINCODE_ID || 'basic');
      requestData.append('function', 'DispensePrescription');
      
      // Format dispensation data according to the smartcontract
      const dispensationData = {
        patientId: patientId,
        prescriptionId: prescriptionId,
        pharmacistId: pharmacistId,
        note: note || "N/A"
      };
      
      // Log the dispensation data for debugging
      console.log(`Dispensation data sent to blockchain: ${JSON.stringify(dispensationData)}`);
      
      // The args should be the JSON string
      requestData.append('args', JSON.stringify(dispensationData));

      // Send to blockchain
      const blockchainResponse = await axios.post(
        `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/invoke`, 
        requestData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      // Log the raw blockchain response for debugging
      console.log(`Raw blockchain response from dispensation: ${JSON.stringify(blockchainResponse.data)}`);

      // Check if the response contains an error
      if (typeof blockchainResponse.data === 'string' && blockchainResponse.data.includes('Error:')) {
        console.error('Blockchain error during dispensation:', blockchainResponse.data);
        return res.status(400).json({
          success: false,
          message: 'Failed to dispense prescription',
          error: blockchainResponse.data,
          data: { patientId, prescriptionId, pharmacistId }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Prescription dispensed successfully',
        data: {
          patientId,
          prescriptionId,
          pharmacistId,
          txId: blockchainResponse.data.txId || 'unknown',
          dispensedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Dispensation error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      return res.status(500).json({ 
        success: false,
        error: 'Failed to dispense prescription',
        details: error.response?.data || error.message,
        request: {
          patientId,
          prescriptionId,
          pharmacistId
        }
      });
    }
  }

  // Get doctor's prescription history - returns prescriptions issued by this doctor
 static async getDoctorPrescriptionHistory(req, res) {
    const { doctorId } = req.params;

    if (!doctorId) {
        return res.status(400).json({ 
            error: "Doctor ID is required",
            success: false
        });
    }

    try {
        console.log(`[DOCTOR] Fetching prescription history for doctor ID: ${doctorId}`);
        
        const response = await axios.get(`${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/query`, {
            params: {
                channelid: process.env.CHANNEL_ID || 'mychannel',
                chaincodeid: process.env.CHAINCODE_ID || 'basic',
                function: "GetPrescriptionsByDoctor",
                args: doctorId,
            },
        });

        // Process the response
        let prescriptions = [];
        
        if (typeof response.data === 'string') {
            // Handle string response (could be JSON string)
            try {
                // First, check if the response starts with "Response:" and extract the actual JSON part
                let jsonStr = response.data;
                if (response.data.startsWith('Response:')) {
                    // Extract the JSON part after "Response:"
                    jsonStr = response.data.substring('Response:'.length).trim();
                }
                prescriptions = JSON.parse(jsonStr);
            } catch (e) {
                console.error('[DOCTOR] Failed to parse response as JSON:', e);
                console.log('[DOCTOR] Response data:', response.data.substring(0, 200)); // Log the beginning of the response
                
                // Try to extract JSON from response string - look for array pattern
                const jsonMatch = response.data.match(/\[.*\]/s); // Add 's' flag to match across lines
                if (jsonMatch) {
                    try {
                        prescriptions = JSON.parse(jsonMatch[0]);
                    } catch (e) {
                        console.error('[DOCTOR] Failed to parse extracted JSON:', e);
                    }
                } else {
                    // Try to extract object pattern if array pattern not found
                    const objectMatch = response.data.match(/\{.*\}/s);
                    if (objectMatch) {
                        try {
                            const obj = JSON.parse(objectMatch[0]);
                            // If it's an object with a prescriptions array, use that
                            if (obj.prescriptions && Array.isArray(obj.prescriptions)) {
                                prescriptions = obj.prescriptions;
                            } else {
                                // Otherwise wrap the object in an array
                                prescriptions = [obj];
                            }
                        } catch (e) {
                            console.error('[DOCTOR] Failed to parse object JSON:', e);
                        }
                    }
                }
            }
        } else if (Array.isArray(response.data)) {
            prescriptions = response.data;
        } else if (response.data && typeof response.data === 'object') {
            // Handle if the response is already an object
            if (response.data.prescriptions && Array.isArray(response.data.prescriptions)) {
                prescriptions = response.data.prescriptions;
            } else {
                // Add the object itself as a single prescription
                prescriptions = [response.data];
            }
        }

        // Ensure we have an array
        if (!Array.isArray(prescriptions)) {
            prescriptions = [];
        }

        // Format the prescriptions consistently
        const formattedPrescriptions = prescriptions.map(p => ({
            diagnosis: p.Diagnosis || 'Not specified',
            dosage: p.Dosage || 'Not specified',
            expiryDate: p.ExpiryDate || null,
            instructions: p.Instructions || 'Not specified',
            medicationName: p.MedicationName || 'Not specified',
            patientId: p.PatientId || 'Unknown',
            patientName: p.PatientName || 'Unknown',
            prescriptionId: p.PrescriptionId || require('crypto').randomBytes(4).toString('hex'),
            status: p.Status || 'Unknown',
            timestamp: p.Timestamp || new Date().toISOString(),
            txId: p.TxID || 'Not available'
        }));

        return res.status(200).json({
            success: true,
            data: {
                doctorId,
                prescriptionCount: formattedPrescriptions.length,
                prescriptions: formattedPrescriptions
            }
        });

    } catch (error) {
        console.error("[DOCTOR] Error retrieving prescription history:", error);
        
        // Handle "no prescriptions found" case specially
        if (error.response?.data?.includes?.('no prescriptions found')) {
            return res.status(200).json({
                success: true,
                data: {
                    doctorId,
                    prescriptionCount: 0,
                    prescriptions: []
                }
            });
        }

        return res.status(500).json({
            success: false,
            error: "Failed to retrieve prescription history",
            details: error.response?.data || error.message,
        });
    }
}


  // Get all prescriptions
  static async getAllPrescriptions(req, res) {
    try {
        const prescriptions = await Prescription.find({})
            .populate('patient', 'firstName lastName')
            .populate('doctor', 'firstName lastName')
            .populate('medication');
        
        res.status(200).json({
            success: true,
            count: prescriptions.length,
            data: prescriptions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
  }

  // UpdatePrescription - allows a doctor to update an existing prescription
  static async updatePrescription(req, res) {
    const { patientId, prescriptionId, doctorId, updates } = req.body;

    // Validate request
    if (!patientId || !prescriptionId || !doctorId || !updates) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        details: { patientId, prescriptionId, doctorId }
      });
    }

    try {
      // First, get the current prescription data
      const getResponse = await axios.get(`${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/query`, {
        params: {
          channelid: process.env.CHANNEL_ID || 'mychannel',
          chaincodeid: process.env.CHAINCODE_ID || 'basic',
          function: "ReadAsset",
          args: patientId
        },
      });
      
      // Process the response
      let assetData;
      try {
        assetData = processBlockchainResponse(getResponse.data);
      } catch (err) {
        return res.status(500).json({
          success: false,
          error: "Failed to parse blockchain response",
          details: err.message
        });
      }
      
      if (!assetData) {
        return res.status(404).json({
          success: false,
          error: "Patient record not found"
        });
      }
      
      // Find the specific prescription to update
      let prescriptionFound = false;
      if (assetData.Prescriptions && Array.isArray(assetData.Prescriptions)) {
        for (let i = 0; i < assetData.Prescriptions.length; i++) {
          if (assetData.Prescriptions[i].PrescriptionId === prescriptionId) {
            // Update prescription fields
            if (updates.dosage) assetData.Prescriptions[i].Dosage = updates.dosage;
            if (updates.instructions) assetData.Prescriptions[i].Instructions = updates.instructions;
            if (updates.diagnosis) assetData.Prescriptions[i].Diagnosis = updates.diagnosis;
            if (updates.medicationName) assetData.Prescriptions[i].MedicationName = updates.medicationName;
            if (updates.expiryDate) assetData.Prescriptions[i].ExpiryDate = updates.expiryDate;
            
            // Only update if the doctor is the original creator
            if (assetData.Prescriptions[i].CreatedBy !== doctorId) {
              return res.status(403).json({
                success: false,
                error: "Only the prescribing doctor can update this prescription"
              });
            }
            
            prescriptionFound = true;
            break;
          }
        }
      }
      
      if (!prescriptionFound) {
        return res.status(404).json({
          success: false,
          error: "Prescription not found"
        });
      }
      
      // Prepare blockchain request for UpdatePrescription
      const requestData = new URLSearchParams();
      requestData.append('channelid', process.env.CHANNEL_ID || 'mychannel');
      requestData.append('chaincodeid', process.env.CHAINCODE_ID || 'basic');
      requestData.append('function', 'UpdatePrescription');
      
      // The args should be patientId and the prescription JSON
      requestData.append('args', JSON.stringify([patientId, JSON.stringify(assetData)]));

      // Send to blockchain
      const blockchainResponse = await axios.post(
        `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/invoke`, 
        requestData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      return res.status(200).json({
        success: true,
        message: 'Prescription updated successfully',
        data: {
          patientId,
          prescriptionId,
          doctorId,
          updates,
          txId: blockchainResponse.data.txId,
          updatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to update prescription',
        details: error.response?.data || error.message
      });
    }
  }

}

module.exports = PrescriptionController;
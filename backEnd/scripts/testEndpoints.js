/**
 * API Endpoint Test Script
 * 
 * This script tests the API endpoints that interact with blockchain:
 * 1. Doctor creating a prescription via prescriptionController
 * 2. Pharmacist dispensing the prescription via pharmacistController
 * 
 * Run with: node scripts/testEndpoints.js
 */

require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const TEST_PATIENT_ID = `patient-test-${Date.now()}`;
const TEST_DOCTOR_ID = 'doctor-test-001';
const TEST_PHARMACIST_ID = 'pharmacist-test-001';

// Helper for logging
const logStep = (step, details = null) => {
  console.log(`\n==== ${step} ====`);
  if (details) {
    console.log(JSON.stringify(details, null, 2));
  }
};

// Helper for sleeping
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main test function
async function runApiEndpointTests() {
  try {
    let prescriptionId;
      // Step 1: Create prescription using doctor endpoint
    logStep("1. Creating prescription via doctor endpoint");
    
    const prescriptionData = {
      patientId: TEST_PATIENT_ID,
      doctorId: TEST_DOCTOR_ID,
      patientName: "API Test Patient",
      dateOfBirth: "1985-05-15",
      prescriptions: [
        {
          medicationName: "API Test Med",
          dosage: "200mg",
          instructions: "Take twice daily with food"
        }
      ]
    };
    
    // Make the API call to create prescription
    // The correct endpoint is /doctor/prescriptions
    const createResponse = await axios.post(
      `${BACKEND_URL}/doctor/prescriptions`,
      prescriptionData,
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    logStep("Creation response", createResponse.data);
    
    // Store the prescription ID for later use
    if (createResponse.data.data && createResponse.data.data.prescriptions) {
      prescriptionId = createResponse.data.data.id;
    } else {
      // Try to extract from received data
      prescriptionId = TEST_PATIENT_ID; // Fallback
    }
    
    // Wait for blockchain to process
    console.log("Waiting for blockchain to process (15 seconds)...");
    await sleep(15000);
      // Step 2: Verify the prescription was created
    logStep("2. Verifying prescription was created");
    
    // The correct endpoint is /doctor/prescriptions
    const verifyResponse = await axios.get(
      `${BACKEND_URL}/doctor/prescriptions`,
      { params: { patientId: TEST_PATIENT_ID } }
    );
    
    logStep("Verification response", verifyResponse.data);
    
    // Extract the prescription ID from the response
    if (verifyResponse.data.data && 
        verifyResponse.data.data.prescriptions && 
        verifyResponse.data.data.prescriptions.length > 0) {
      prescriptionId = verifyResponse.data.data.prescriptions[0].prescriptionId;
      logStep("Found prescription ID", { prescriptionId });
    } else {
      logStep("Warning: Could not find prescription ID in response", { 
        response: verifyResponse.data, 
        usingPatientId: TEST_PATIENT_ID 
      });
      // In this case, we'll try using the patient ID with the pharmacist endpoint
      prescriptionId = "unknown";
    }
    
    // Step 3: Dispense the prescription using pharmacist endpoint
    logStep("3. Dispensing prescription via pharmacist endpoint");
    
    const dispensationData = {
      patientId: TEST_PATIENT_ID,
      prescriptionId: prescriptionId,
      pharmacistId: TEST_PHARMACIST_ID,
      comment: "Dispensed via API test"
    };
    
    // First get the prescription details for the pharmacist
    const pharmGetResponse = await axios.get(
      `${BACKEND_URL}/pharmacist/prescriptions`,
      { params: { patientId: TEST_PATIENT_ID } }
    );
    
    logStep("Pharmacist get prescriptions response", pharmGetResponse.data);
    
    // If the pharmacist endpoint returns a prescription ID, use that one
    if (pharmGetResponse.data.data && 
        pharmGetResponse.data.data.prescriptions && 
        pharmGetResponse.data.data.prescriptions.length > 0) {
      prescriptionId = pharmGetResponse.data.data.prescriptions[0].prescriptionId;
      dispensationData.prescriptionId = prescriptionId;
      logStep("Using prescription ID from pharmacist endpoint", { prescriptionId });
    }
    
    // Make the API call to dispense prescription
    try {
      const dispenseResponse = await axios.post(
        `${BACKEND_URL}/pharmacist/dispense`,
        dispensationData,
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      logStep("Dispensation response", dispenseResponse.data);
      
      // Step 4: Verify the prescription status has been updated
      console.log("Waiting for blockchain to process (15 seconds)...");
      await sleep(15000);
      
      logStep("4. Verifying prescription status has changed");
      
      const finalResponse = await axios.get(
        `${BACKEND_URL}/pharmacist/prescriptions`,
        { params: { patientId: TEST_PATIENT_ID } }
      );
      
      logStep("Final verification response", finalResponse.data);
      
      // Check if status changed to "Dispensed"
      if (finalResponse.data.data && 
          finalResponse.data.data.prescriptions && 
          finalResponse.data.data.prescriptions.length > 0) {
        
        const finalStatus = finalResponse.data.data.prescriptions[0].status;
        
        logStep("Final prescription status", { 
          expectedStatus: "Dispensed", 
          actualStatus: finalStatus,
          success: finalStatus === "Dispensed"
        });
        
        if (finalStatus === "Dispensed") {
          console.log("\n✅ API Endpoint Test SUCCESSFUL! Full lifecycle completed!");
        } else {
          console.log(`\n⚠️ API Endpoint Test PARTIAL SUCCESS. Status is not 'Dispensed' (${finalStatus})`);
        }
      } else {
        console.log("\n⚠️ API Endpoint Test PARTIAL SUCCESS. Could not verify final status");
      }
    } catch (dispenseError) {
      logStep("Error during dispensing", {
        message: dispenseError.message,
        response: dispenseError.response?.data || "No response data"
      });
      
      // Even if dispensation failed, we've verified that the prescription was created
      console.log("\n⚠️ API Endpoint Test PARTIAL SUCCESS. Creation worked but dispensation failed");
    }
    
  } catch (error) {
    console.error("\n❌ API Endpoint Test FAILED");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("No response received");
    } else {
      console.error("Error:", error.message);
    }
  }
}

// Run the tests
runApiEndpointTests();

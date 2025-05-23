
/**
 * Creates a standardized prescription data structure for QR code generation
 * This helps maintain consistency across different prescription views
 * 
 * @param {Object} prescription - The prescription data
 * @returns {Object} - Standardized prescription data for QR codes
 */
export const createPrescriptionQRData = (prescription) => {
  if (!prescription) return null;
  
  return {
    // Use consistent naming conventions across different data sources
    prescriptionId: prescription.id || prescription.prescriptionId,
    patientId: prescription.patientId,
    patientName: prescription.patientName,
    medication: prescription.medications || prescription.medicationName,
    dosage: prescription.dosage,
    instructions: prescription.instructions,
    date: prescription.date || prescription.timestamp,
    status: prescription.status,
    txID: prescription.txID,
    doctorName: prescription.doctorName || prescription.doctorId,
    expiryDate: prescription.expiryDate,
    // Include dispensing information
    dispensingStatus: prescription.status === 'Dispensed' ? 'Dispensed' : 'Ready for dispensing',
    dispensingPharmacist: prescription.dispensingPharmacist || null,
    dispensingTimestamp: prescription.dispensingTimestamp || null,
    // Include a verification URL that can be used to verify this prescription
    verifyUrl: `${window.location.origin}/verify-prescription/${prescription.id || prescription.prescriptionId}`,
    // Include a dispensing URL for pharmacists to use
    dispenseUrl: `${window.location.origin}/dispense-prescription/${prescription.id || prescription.prescriptionId}/${prescription.patientId}`,
    // Include a timestamp for when this QR was generated
    generatedAt: new Date().toISOString(),
    // Include a type field to identify this as a prescription QR code
    type: 'prescription'
  };
};

/**
 * Validates a scanned QR code data to verify if it's a valid prescription
 * 
 * @param {Object|string} qrData - The parsed QR code data
 * @returns {boolean} - True if valid prescription QR
 */
export const isValidPrescriptionQR = (qrData) => {
  let data;
  
  // If it's a string, try to parse it
  if (typeof qrData === 'string') {
    try {
      data = JSON.parse(qrData);
    } catch (error) {
      return false;
    }
  } else {
    data = qrData;
  }
  
  // Check required fields for a prescription QR
  return (
    data &&
    (data.prescriptionId || data.id) &&
    (data.patientId) &&
    (data.medication || data.medications || data.medicationName)
  );
};

import React from 'react';
import QRCode from 'react-qr-code';
import { FiDownload, FiInfo } from 'react-icons/fi';
import { createPrescriptionQRData } from '../../utils/qrUtils';

/**
 * A reusable component for displaying and downloading prescription QR codes
 * 
 * @param {Object} prescription - The prescription data to encode in the QR
 * @param {string} size - The size of the QR code (default: 150)
 * @param {boolean} showInfo - Whether to show additional info about the QR code (default: true)
 */
const PrescriptionQRCode = ({ prescription, size = 150, showInfo = true }) => {
  if (!prescription) return null;

  const downloadQRCode = () => {
    // Get the svg element
    const svg = document.getElementById(`prescription-qr-${prescription.id}`);
    if (!svg) return;
    
    // Create a canvas to convert SVG to image
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    // Set canvas size for good quality
    canvas.width = 300;
    canvas.height = 300;
    
    img.onload = function() {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob(function(blob) {
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.download = `prescription-${prescription.id || 'rx'}.png`;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };
  
  
  // Create a standardized data object for the QR code
  const qrCodeData = createPrescriptionQRData(prescription);

  // Determine status color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'dispensed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-3 rounded-lg shadow">
        <QRCode
          id={`prescription-qr-${prescription.id || prescription.prescriptionId}`}
          size={size}
          value={JSON.stringify(qrCodeData)}
        />
      </div>
      
      {showInfo && (
        <div className="mt-3 text-center w-full">
          <p className="text-xs text-gray-500">
            Scan to verify and dispense prescription
          </p>
          
          <div className="mt-2 text-xs bg-gray-50 p-2 rounded border border-gray-100">
            <div className="flex items-center justify-center mb-1">
              <FiInfo className="h-3 w-3 mr-1 text-gray-400" />
              <span className="font-medium">QR Code Information</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-left">
              <span className="text-gray-500">Medication:</span>
              <span className="font-medium truncate">{prescription.medications || prescription.medicationName}</span>
              
              <span className="text-gray-500">Patient ID:</span>
              <span className="font-medium">{prescription.patientId}</span>
              
              <span className="text-gray-500">Status:</span>
              <span className={`font-medium ${getStatusColor(prescription.status)}`}>
                {prescription.status || 'Active'}
              </span>
              
              <span className="text-gray-500">Prescription ID:</span>
              <span className="font-medium">{prescription.id || prescription.prescriptionId}</span>
            </div>
          </div>
        </div>
      )}
      
      <button 
        onClick={downloadQRCode}
        className="mt-3 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors flex items-center"
      >
        <FiDownload className="h-4 w-4 mr-1.5" />
        Download QR Code
      </button>
    </div>
  );
};

export default PrescriptionQRCode;

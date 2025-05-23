import React, { useMemo, useState, useCallback } from 'react';
import QRCode from 'react-qr-code';
import { FiDownload, FiCheck, FiLoader } from 'react-icons/fi';

const PatientQRCode = ({ patientId, patientName }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  // Memoize the QR code value to prevent unnecessary re-renders
  const qrCodeValue = useMemo(() => JSON.stringify({
    id: patientId,
    name: patientName,
    type: 'patient',
    timestamp: new Date().toISOString() // Add timestamp for uniqueness
  }), [patientId, patientName]);
  
  // Function to download QR code as PNG with error handling
  const downloadQRCode = useCallback(() => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    
    try {
      const svg = document.getElementById('patient-qrcode');
      if (!svg) {
        throw new Error('QR code element not found');
      }
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const pngFile = canvas.toDataURL('image/png');
          
          // Download PNG
          const downloadLink = document.createElement('a');
          downloadLink.download = `patient-id-${patientId}.png`;
          downloadLink.href = pngFile;
          downloadLink.click();
          
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 3000); // Reset success state after 3 seconds
        } catch (error) {
          console.error('Error generating PNG:', error);
        } finally {
          setIsDownloading(false);
        }
      };
      
      img.onerror = () => {
        console.error('Error loading image');
        setIsDownloading(false);
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (error) {
      console.error('Error downloading QR code:', error);
      setIsDownloading(false);
    }
  }, [patientId]);

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg shadow-sm relative">
        {/* Add a subtle animation to draw attention to the QR code */}
        <div className="absolute inset-0 rounded-lg border-2 border-blue-400 animate-pulse opacity-30"></div>
        <QRCode
          id="patient-qrcode"
          value={qrCodeValue}
          size={200}
          level="H" // High error correction level
          includeMargin={true}
        />
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Scan to verify your identity at the pharmacy
      </p>
      <button
        onClick={downloadQRCode}
        disabled={isDownloading}
        className={`mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-xs font-medium 
          ${isDownloading ? 'opacity-75 cursor-wait' : 'hover:bg-gray-50 dark:hover:bg-gray-600'} 
          ${downloadSuccess ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' : 'text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700'} 
          transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        aria-label="Download QR Code"
      >
        {isDownloading ? (
          <>
            <FiLoader className="mr-2 h-4 w-4 animate-spin" />
            Downloading...
          </>
        ) : downloadSuccess ? (
          <>
            <FiCheck className="mr-2 h-4 w-4" />
            Downloaded
          </>
        ) : (
          <>
            <FiDownload className="mr-2 h-4 w-4" />
            Download QR Code
          </>
        )}
      </button>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Show this to your pharmacist
      </div>
    </div>
  );
};

export default React.memo(PatientQRCode);

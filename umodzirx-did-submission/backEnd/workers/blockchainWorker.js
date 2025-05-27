const amqp = require('amqplib');
const { Contract } = require('fabric-contract-api');
const crypto = require('crypto');

/**
 * Processes blockchain write tasks from the queue.
 */
const processBlockchainWrite = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'blockchain_write';

    await channel.assertQueue(queue, { durable: true });

    console.log('Blockchain Worker is waiting for tasks...');

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const { transactionData } = JSON.parse(msg.content.toString());

        try {
          // Send to blockchain REST API using the correct format
          const axios = require('axios');
          const { URLSearchParams } = require('url');
          
          // Format the asset data according to the smart contract requirements
          const assetData = {
            PatientId: transactionData.patientId,
            DoctorId: transactionData.doctorId,
            PatientName: transactionData.patientName,
            DateOfBirth: transactionData.dateOfBirth || "",
            Prescriptions: transactionData.prescriptions.map(p => ({
              PrescriptionId: p.prescriptionId || crypto.randomBytes(8).toString('hex'),
              PatientId: transactionData.patientId,
              CreatedBy: transactionData.doctorId,
              MedicationName: p.medicationName || p.medication || 'Unknown',
              Dosage: p.dosage,
              Instructions: p.instructions || '',
              Status: "Active",
              ExpiryDate: p.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }))
          };
          
          // Prepare blockchain request
          const requestData = new URLSearchParams();
          requestData.append('channelid', process.env.CHANNEL_ID || 'mychannel');
          requestData.append('chaincodeid', process.env.CHAINCODE_ID || 'basic');
          requestData.append('function', 'CreateAsset');
          requestData.append('args', JSON.stringify(assetData));
          
          // Submit to blockchain
          const response = await axios.post(
            `${process.env.BLOCKCHAIN_API_URL || 'http://localhost:45000'}/invoke`, 
            requestData,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          );

          console.log('Transaction successful:', response.data);
          channel.ack(msg);
        } catch (error) {
          console.error('Blockchain write error:', error.response?.data || error.message);
          channel.nack(msg);
        }
      }
    });
  } catch (error) {
    console.error('Blockchain Worker error:', error);
  }
};

processBlockchainWrite();

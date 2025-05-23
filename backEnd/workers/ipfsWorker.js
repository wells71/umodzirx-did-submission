const amqp = require('amqplib');
const ipfsClient = require('ipfs-http-client');

// IPFS client setup
const ipfs = ipfsClient({
  host: process.env.IPFS_HOST,
  port: process.env.IPFS_PORT,
  protocol: process.env.IPFS_PROTOCOL,
});

/**
 * Processes IPFS upload tasks from the queue.
 */
const processIpfsUpload = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'ipfs_upload';

    await channel.assertQueue(queue, { durable: true });

    console.log('IPFS Worker is waiting for tasks...');

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const { fileBuffer, metadata } = JSON.parse(msg.content.toString());

        try {
          // Upload file to IPFS
          const fileAdded = await ipfs.add(fileBuffer);
          const metadataAdded = await ipfs.add(JSON.stringify(metadata));

          console.log('File uploaded to IPFS:', fileAdded);
          console.log('Metadata uploaded to IPFS:', metadataAdded);

          channel.ack(msg);
        } catch (error) {
          console.error('IPFS upload error:', error);
          channel.nack(msg);
        }
      }
    });
  } catch (error) {
    console.error('IPFS Worker error:', error);
  }
};

processIpfsUpload();

const { Pool } = require('pg');
const net = require('net');
const { URL } = require('url');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Parse connection string
const dbUrl = new URL(process.env.DATABASE_URL);
const config = {
  user: dbUrl.username,
  password: dbUrl.password,
  host: dbUrl.hostname,
  port: parseInt(dbUrl.port) || 5432,
  database: dbUrl.pathname.slice(1),
  ssl: {
    rejectUnauthorized: false,
    servername: dbUrl.hostname
  },
  // Connection settings
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS) || 30000,
  // Pool settings
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 5,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
  query_timeout: 10000,
  statement_timeout: 10000
};

const pool = new Pool(config);

// Set up global error handlers for the pool
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});

pool.on('connect', (client) => {
  console.log('New client connected to database pool');
});

// Enhanced connection test
const connectDB = async () => {
  try {
    // First test raw TCP connection
    await new Promise((resolve, reject) => {
      const socket = net.createConnection({
        host: config.host,
        port: config.port,
        timeout: 10000
      });

      socket.on('connect', () => {
        console.log('TCP connection successful to database server');
        socket.destroy();
        resolve();
      });

      socket.on('error', (err) => {
        console.error('TCP connection error:', err.message);
        socket.destroy();
        reject(err);
      });
      
      socket.on('timeout', () => {
        console.error('TCP connection timeout');
        socket.destroy();
        reject(new Error('TCP connection timeout'));
      });
    });

    // Then connect with pg
    console.log('Establishing database pool connection...');
    const client = await pool.connect();
    try {
      console.log('Testing database connection with query...');
      await client.query('SELECT 1');
      console.log('Database query successful');
      return client;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    throw error;
  }
};

module.exports = { pool, connectDB };
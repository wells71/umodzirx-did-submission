require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./db');
const { initializeEncryption } = require('../utils/encryption');
const UserController = require('../controllers/userController');
const withRetry = require('./retry');

// Route imports
const authRoutes = require('../routes/authRoutes');
const prescriptionRoutes = require('../routes/prescriptionRoutes');
const pharmaRoutes = require('../routes/pharmaRoutes');
const userRoutes = require('../routes/userRoutes');
const patientRoutes = require('../routes/patientRoutes');
const prescriptionEndpoints = require('../routes/prescriptionEndpoints'); // Add the new route file

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_BASE_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use('/auth', authRoutes);
app.use('/doctor', prescriptionRoutes);
app.use('/pharmacist', pharmaRoutes);
app.use('/admin', userRoutes);
app.use('/patient', patientRoutes);
app.use('/prescriptions', prescriptionEndpoints); // Add the new route

// Global error handler
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;
  res.status(statusCode).json({ 
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    requestedPath: req.originalUrl
  });
});



const startServer = async () => {
  try {
    // Initialize encryption
    await initializeEncryption();

    // Database connection with retry
    await withRetry(async () => {
      console.log('🔗 Attempting database connection...');
      const client = await connectDB();
      console.log('✅ Database connection established');
      await UserController.ensureTableExists();
    }, 5, 2000); // 5 attempts with 2s initial delay

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('💀 Fatal startup error:', error.message);
    process.exit(1);
  }
};

startServer();
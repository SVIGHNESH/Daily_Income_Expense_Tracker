const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load environment variables from multiple possible locations
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import routes
const authRoutes = require('./routes/auth');
const entryRoutes = require('./routes/entry');

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://finance-diary-frontend.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Finance Diary API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb_configured: !!process.env.MONGODB_URI,
    mongodb_connection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Debug endpoint (only in development)
app.get('/debug/env', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Debug endpoint not available in production' });
  }
  
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI_SET: !!process.env.MONGODB_URI,
    JWT_SECRET_SET: !!process.env.JWT_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entryRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI environment variable is not set');
      console.error('Available environment variables:');
      console.error('NODE_ENV:', process.env.NODE_ENV);
      console.error('PORT:', process.env.PORT);
      console.error('FRONTEND_URL:', process.env.FRONTEND_URL);
      return false;
    }
    
    console.log('🔗 Connecting to MongoDB...');
    console.log('📊 Environment:', process.env.NODE_ENV);
    console.log('✅ MongoDB URI configured');
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('🔍 Connection details:');
    console.error('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.error('NODE_ENV:', process.env.NODE_ENV);
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('🌐 Network connectivity issue - check your internet connection or MongoDB Atlas whitelist');
    }
    if (error.message.includes('authentication')) {
      console.error('🔐 Authentication issue - check your MongoDB credentials');
    }
    
    return false;
  }
};

// Start server
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  
  // Start server first
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  });
  
  // Then try to connect to database
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.log('⚠️  Server running without database connection');
    console.log('🔧 Please check your MONGODB_URI environment variable');
  } else {
    console.log('✅ Server fully operational with database connection');
  }
  
  return server;
};

// Start the application
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
const mongoose = require('mongoose');

// Global flag to track MongoDB availability
global.mongodbAvailable = true;

const connectDB = async () => {
  try {
    // Try to connect to MongoDB with timeout
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms', {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000, // Reduced timeout
      socketTimeoutMS: 45000,
      bufferCommands: false
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('⚠️  Server will continue without MongoDB (some features may not work)');

    // Don't exit the process - let the server run without MongoDB
    // This allows the frontend to connect and show appropriate error messages

    // Set up a flag to indicate MongoDB is not available
    global.mongodbAvailable = false;
  }
};

module.exports = connectDB; 
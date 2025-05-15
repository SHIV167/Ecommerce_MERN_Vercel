import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
console.log('DEBUG env MONGODB_URI:', process.env.MONGODB_URI);
// DEBUG: log loaded env var
console.log('DEBUG env MONGODB_URL:', process.env.MONGODB_URL);

// MongoDB connection string with cloud MongoDB as the primary connection
const MONGODB_URL = process.env.MONGODB_URI || process.env.MONGODB_URL ||
                   'mongodb://127.0.0.1:27017/newecom';

// Connect to MongoDB
export async function connectToDatabase() {
  try {
    mongoose.set('strictQuery', false);
    console.log('Attempting to connect to MongoDB at:', MONGODB_URL.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials in logs
    
    const options = {
      serverSelectionTimeoutMS: 30000, // Timeout after 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      // These options help with connection issues
      autoIndex: true,
      autoCreate: true,
    };
    
    await mongoose.connect(MONGODB_URL, options);
    console.log('MongoDB connected successfully');
    
    // Check connection status
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Return a special flag to indicate we should continue without DB
    // This allows the frontend to start even if DB fails
    return null;
  }
}

// Close MongoDB connection
export async function closeDatabaseConnection() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}

export default mongoose;
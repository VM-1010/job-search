import mongoose from 'mongoose';
import dns from 'dns';

const connectDB = async () => {
  // Force Node.js to use Google and Cloudflare DNS to resolve MongoDB Atlas SRV records
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (dnsErr) {
    console.warn('Warning: Could not set custom DNS servers, using system default:', dnsErr.message);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB Atlas connection failed:', error.message);
    console.log('Attempting local MongoDB connection fallback...');
    try {
      const localUri = 'mongodb://127.0.0.1:27017/job_platform';
      const conn = await mongoose.connect(localUri);
      console.log(`MongoDB connected locally: ${conn.connection.host}`);
    } catch (localError) {
      console.error('Local MongoDB connection also failed:', localError.message);
      process.exit(1);
    }
  }
};

export default connectDB;


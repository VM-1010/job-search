import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000 // Timeout Atlas connection after 3 seconds to trigger fallback
    });
    console.log(`MongoDB Connected (Atlas): ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB Atlas Connection Failed: ${error.message}`);
    console.log('Attempting local in-memory database fallback...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const localUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(localUri);
      console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
      console.log(`Database URI: ${localUri}`);
    } catch (fallbackError) {
      console.error(`MongoDB Fallback Connection Error: ${fallbackError.message}`);
      console.warn('--------------------------------------------------------------------------');
      console.warn('WARNING: Running server in OFFLINE/MOCK DB mode.');
      console.warn('The Express server is running successfully on port 5000,');
      console.warn('but database operations (saves, reads) will fail until MongoDB is active.');
      console.warn('--------------------------------------------------------------------------');
    }
  }
};

export default connectDB;

import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      tls: true,
      tlsInsecure: false,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('MongoDB Atlas connected');
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
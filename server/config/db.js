import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student-assignment-tracker');
    console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database Connection Error: ${error.message}`);
    // Exiting the process with a failure code to alert the developer
    console.log('💡 Note: Ensure your local MongoDB Service is running or update the MONGO_URI in server/.env');
  }
};

export default connectDB;

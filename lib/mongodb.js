import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    if (!process.env.MONGODBURI) {
      throw new Error("MONGODBURI environment variable is not defined");
    }
    
    if (mongoose.connections[0].readyState) {
      return;
    }
    
    await mongoose.connect(process.env.MONGODBURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export default connectMongoDB;

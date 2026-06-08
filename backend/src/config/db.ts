import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || "mongodb://mongodb:27017/formbuilder";

  try {
    await mongoose.connect(uri);
    console.log("[DB] MongoDB connected successfully");
  } catch (error) {
    console.error("[DB] MongoDB connection error:", error);
    process.exit(1);
  }

  mongoose.connection.on("error", (err) => {
    console.error("[DB] MongoDB runtime error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[DB] MongoDB disconnected");
  });
};

export default connectDB;

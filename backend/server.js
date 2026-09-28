import dotenv from "dotenv";
import dns from "dns"
import mongoose from "mongoose";
import app from "./app.js";


dotenv.config();
dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`FixIt server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();
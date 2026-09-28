import dotenv from "dotenv";
import dns from "dns";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "./models/user.js";

dotenv.config();

dns.setServers(["8.8.8.8","8.8.4.4"]);

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const hashedAdminPassword = await bcrypt.hash("admin123", 10);
    const hashedAgentPassword = await bcrypt.hash("agent123", 10);

    await User.findOneAndUpdate(
      { email: "admin@fixit.com" },
      {
        name: "FixIt Admin",
        email: "admin@fixit.com",
        password: hashedAdminPassword,
        contactNumber: "9999999999",
        role: "admin",
        isActive: true,
      },
      {
        upsert: true,
        new: true,
      }
    );

    await User.findOneAndUpdate(
      { email: "agent@fixit.com" },
      {
        name: "FixIt Agent",
        email: "agent@fixit.com",
        password: hashedAgentPassword,
        contactNumber: "8888888888",
        role: "agent",
        isActive: true,
      },
      {
        upsert: true,
        new: true,
      }
    );

    console.log("Admin user created/updated");
    console.log("Agent user created/updated");

    await mongoose.connection.close();

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seedUsers();
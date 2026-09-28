import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authroutes.js";
import userRoutes from "./routes/userRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import path from "path";
import notificationRoutes from "./routes/notificationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";



const app = express();

// Middleware

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/tickets",ticketRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);


// Test route
app.get("/", (req, res) => {
  res.json({
    message: "FixIt API is running 🚀",
  });
});

export default app;
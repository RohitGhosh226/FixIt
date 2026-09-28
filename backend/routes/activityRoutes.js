import express from "express";

import { getTicketActivity } from "../controllers/activityController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:ticketId", protect, getTicketActivity);

export default router;
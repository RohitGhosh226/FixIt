import express from "express";
import { createTicket,getTickets,getTicketById,updateTicket,assignTicket, addAttachment } from "../controllers/ticketcontrollers.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
const router = express.Router();

router.post("/", protect, createTicket);
router.get("/",protect,getTickets);
router.get("/:id",protect,getTicketById);
router.put("/:id", protect, updateTicket);
router.patch(
  "/:id/assign",
  protect,
  authorize("admin"),
  assignTicket
);
router.post(
  "/:id/attachments",
  protect,
  upload.single("file"),
  addAttachment
);


export default router;
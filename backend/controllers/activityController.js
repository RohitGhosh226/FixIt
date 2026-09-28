import ActivityLog from "../models/activityLog.js";
import Ticket from "../models/ticket.js";

export const getTicketActivity = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    if (
      req.user.role === "customer" &&
      ticket.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (
      req.user.role === "agent" &&
      (!ticket.assignedTo ||
        ticket.assignedTo.toString() !== req.user.userId)
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const activities = await ActivityLog.find({
      ticket: ticket._id,
    })
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error("Get activity error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
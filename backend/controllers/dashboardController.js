import Ticket from "../models/ticket.js";

export const getDashboardStats = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === "customer") {
      filter.createdBy = req.user.userId;
    }

    if (req.user.role === "agent") {
      filter.assignedTo = req.user.userId;
    }

    const [
      total,
      open,
      inProgress,
      resolved,
      closed,
      urgent,
    ] = await Promise.all([
      Ticket.countDocuments(filter),

      Ticket.countDocuments({
        ...filter,
        status: "open",
      }),

      Ticket.countDocuments({
        ...filter,
        status: "in-progress",
      }),

      Ticket.countDocuments({
        ...filter,
        status: "resolved",
      }),

      Ticket.countDocuments({
        ...filter,
        status: "closed",
      }),

      Ticket.countDocuments({
        ...filter,
        priority: "urgent",
      }),
    ]);

    return res.status(200).json({
      stats: {
        total,
        open,
        inProgress,
        resolved,
        closed,
        urgent,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
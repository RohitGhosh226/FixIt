import Ticket from "../models/ticket.js";
import User from "../models/user.js";
import { createActivity } from "../utils/createActivity.js";
import { createNotification } from "../utils/createNotification.js";
export const createTicket = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({
        message: "Title, description and category are required",
      });
    }

    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      createdBy: req.user.userId,
    });
    await createActivity({
  ticketId: ticket._id,
  userId: req.user.userId,
  action: "ticket_created",
  details: "Ticket was created",
});

    return res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Create ticket error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const getTickets = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      category,
      page = 1,
      limit = 10,
      sort = "-createdAt",
    } = req.query;

    const filter = {};

    // Role-based visibility
    if (req.user.role === "customer") {
      filter.createdBy = req.user.userId;
    }

    if (req.user.role === "agent") {
      filter.assignedTo = req.user.userId;
    }

    // Search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Filters
    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (category) {
      filter.category = category;
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 50);

    const skip = (pageNumber - 1) * limitNumber;

    const [tickets, totalTickets] = await Promise.all([
      Ticket.find(filter)
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email")
        .sort(sort)
        .skip(skip)
        .limit(limitNumber),

      Ticket.countDocuments(filter),
    ]);

    return res.status(200).json({
      count: tickets.length,
      totalTickets,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalTickets / limitNumber),
      tickets,
    });
  } catch (error) {
    console.error("Get tickets error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email");

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    if (
      req.user.role === "customer" &&
      ticket.createdBy._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (
      req.user.role === "agent" &&
      (!ticket.assignedTo ||
        ticket.assignedTo._id.toString() !== req.user.userId)
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    return res.status(200).json({
      ticket,
    });
  } catch (error) {
    console.error("Get ticket error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const updateTicket = async (req, res) => {
  try {
    const { title, description, category, priority, status } = req.body;

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    // Customer can update only their own ticket
    if (
      req.user.role === "customer" &&
      ticket.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    // Agent can update only assigned tickets
    if (
      req.user.role === "agent" &&
      (!ticket.assignedTo ||
        ticket.assignedTo.toString() !== req.user.userId)
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }
     const oldStatus = ticket.status; 
    if (title !== undefined) ticket.title = title;
    if (description !== undefined) ticket.description = description;
    if (category !== undefined) ticket.category = category;
    if (priority !== undefined) ticket.priority = priority;
    if (status !== undefined) ticket.status = status;

    await ticket.save();
    await ticket.populate("createdBy", "name email");
await ticket.populate("assignedTo", "name email");
if (status &&
  status !== oldStatus &&
  req.user.role === "agent" &&
  ticket.createdBy?._id) {
  await createActivity({
    ticketId: ticket._id,
    userId: req.user.userId,
    action: "status_changed",
    details: `Ticket status changed from ${oldStatus} to ${status}`,
  });

  if (ticket.createdBy?._id) {
    await createNotification({
      recipient: ticket.createdBy._id,
      ticket: ticket._id,
      type:
        status === "resolved"
          ? "ticket_resolved"
          : status === "closed"
          ? "ticket_closed"
          : "status_changed",
      message: `Your ticket "${ticket.title}" is now ${status}.`,
    });
  }
}

    return res.status(200).json({
      message: "Ticket updated successfully",
      ticket,
    });
  } catch (error) {
    console.error("Update ticket error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    // Only ticket owner or admin can delete
    if (
      req.user.role !== "admin" &&
      ticket.createdBy.toString() !== req.user.userId
    ) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    await ticket.deleteOne();

    return res.status(200).json({
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Delete ticket error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const assignTicket = async (req, res) => {
  try {
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({
        message: "Agent ID is required",
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
      });
    }

    const agent = await User.findOne({
      _id: agentId,
      role: "agent",
      isActive: true,
    });

    if (!agent) {
      return res.status(404).json({
        message: "Active agent not found",
      });
    }

    if (
  ticket.assignedTo &&
  ticket.assignedTo.toString() === agentId
) {
  return res.status(400).json({
    message: "Ticket is already assigned to this agent",
  });
}

    ticket.assignedTo = agent._id;

    await ticket.save();
    await ticket.populate("assignedTo", "name email");
    await createActivity({
  ticketId: ticket._id,
  userId: req.user.userId,
  action: "ticket_assigned",
  details: `Ticket assigned to ${agent.name}`,
});

await createNotification({
  recipient: agent._id,
  ticket: ticket._id,
  type: "ticket_assigned",
  message: `You have been assigned a new ticket: ${ticket.title}`,
});

    return res.status(200).json({
      message: "Ticket assigned successfully",
      ticket,
    });
  } catch (error) {
    console.error("Assign ticket error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
export const addAttachment = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

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

    if (!req.file) {
      return res.status(400).json({
        message: "File is required",
      });
    }

    ticket.attachments.push(`/uploads/${req.file.filename}`);

    await ticket.save();

    return res.status(200).json({
      message: "Attachment uploaded successfully",
      ticket,
    });
  } catch (error) {
    console.error("Upload error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
import Comment from "../models/comment.js";
import Ticket from "../models/ticket.js";
import { createActivity } from "../utils/createActivity.js";
import { createNotification } from "../utils/createNotification.js";


export const addComment = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Comment message is required",
      });
    }

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

    const comment = await Comment.create({
      ticket: ticket._id,
      user: req.user.userId,
      message,
    });

    await comment.populate("user", "name email role");
 // Activity log
    await createActivity({
      ticketId: ticket._id,
      userId: req.user.userId,
      action: "comment_added",
      details: "A new comment was added",
    });

    // Find who should receive the notification
    const recipient =
      ticket.createdBy.toString() === req.user.userId
        ? ticket.assignedTo
        : ticket.createdBy;

    // Create notification
    if (recipient) {
      await createNotification({
        recipient,
        ticket: ticket._id,
        type: "comment_added",
        message: `New comment added to ticket: ${ticket.title}`,
      });
    }
    return res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (error) {
    console.error("Add comment error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};


export const getComments = async (req, res) => {
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

    const comments = await Comment.find({
      ticket: ticket._id,
    })
      .populate("user", "name email role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      count: comments.length,
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
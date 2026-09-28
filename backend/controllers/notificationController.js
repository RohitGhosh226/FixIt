import Notification from "../models/notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.userId,
    })
      .populate("ticket", "title status")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.userId,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification error:", error.message);

    return res.status(500).json({
      message: "Server error",
    });
  }
};
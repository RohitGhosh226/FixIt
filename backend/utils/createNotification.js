import Notification from "../models/notification.js";

export const createNotification = async ({
  recipient,
  ticket,
  type,
  message,
}) => {
  await Notification.create({
    recipient,
    ticket,
    type,
    message,
  });
};
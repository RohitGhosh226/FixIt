import ActivityLog from "../models/activityLog.js";

export const createActivity = async ({
  ticketId,
  userId,
  action,
  details = "",
}) => {
  await ActivityLog.create({
    ticket: ticketId,
    user: userId,
    action,
    details,
  });
};
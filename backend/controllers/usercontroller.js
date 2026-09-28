import User from "../models/user.js";

export const getMe = (req, res) => {
  return res.status(200).json({
    message: "You are authenticated",
    user: req.user,
  });
};
export const getAgents = async (req, res) => {
  try {
    const agents = await User.find({
      role: "agent",
      isActive: true,
    }).select("_id name email");

    return res.status(200).json({
      agents,
    });
  } catch (error) {
    console.error("Get agents error:", error);

    return res.status(500).json({
      message: "Failed to fetch agents",
    });
  }
};
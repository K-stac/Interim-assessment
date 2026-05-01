const User = require("../models/User");

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Could not load profile.",
    });
  }
}

module.exports = { getProfile };

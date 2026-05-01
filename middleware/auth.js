const jwt = require("jsonwebtoken");
const User = require("../models/User");

const COOKIE_NAME = "token";

function getToken(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return null;
}

function authMiddleware(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please log in again.",
    });
  }
}

async function attachUserIfPresent(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (user) req.user = user;
  } catch {
    /* ignore invalid token for optional attach */
  }
  next();
}

module.exports = {
  authMiddleware,
  attachUserIfPresent,
  COOKIE_NAME,
};

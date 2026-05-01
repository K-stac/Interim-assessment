const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../utils/jwt");
const { COOKIE_NAME } = require("../middleware/auth");

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

/**
 * Register — README labels this as "GET /register" for the app flow; the REST API uses POST with a JSON body (password must not be sent in query strings).
 */
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
    });
    const token = signToken(user._id.toString());
    res.cookie(COOKIE_NAME, token, cookieOptions());
    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }
    const token = signToken(user._id.toString());
    res.cookie(COOKIE_NAME, token, cookieOptions());
    return res.json({
      success: true,
      message: "Logged in successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again later.",
    });
  }
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { ...cookieOptions(), maxAge: 0 });
  return res.json({ success: true, message: "Logged out." });
}

module.exports = { register, login, logout };

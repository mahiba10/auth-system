const express  = require("express");
const jwt      = require("jsonwebtoken");
const User     = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Helper: sign JWT
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, data: { user } });
};

// ── POST /api/auth/register ──────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const user = new User({ name, email, password });
await user.save();
    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/auth/me  (protected) ───────────────────────────
router.get("/me", protect, (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user } });
});

module.exports = router;
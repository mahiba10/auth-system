require("dotenv").config();
const express  = require("express");
const mongoose = require("mongoose");

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));

// Health check
app.get("/", (_, res) => res.json({ message: "Auth API is running 🚀" }));

// 404 handler
app.use((_, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Connect DB then start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });
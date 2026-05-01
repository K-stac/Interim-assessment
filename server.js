require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const cryptoRoutes = require("./routes/cryptoRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/", authRoutes);
app.use("/", userRoutes);
app.use("/crypto", cryptoRoutes);

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error("Missing JWT_SECRET in environment.");
    process.exit(1);
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI in environment.");
    process.exit(1);
  }
  await mongoose.connect(uri);
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});

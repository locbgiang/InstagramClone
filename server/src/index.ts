import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import healthRouter from "./routes/health.js";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cookieParser());

// CORS setup
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    process.env.CLIENT_URL || "http://localhost:5173"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Routes
app.use("/api", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

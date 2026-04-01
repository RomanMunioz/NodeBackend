import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
const PORT = process.env.PORT || 9090;

const defaultOrigins = [
  "https://RomanMunioz.github.io",
  "https://romanmunioz.github.io",
  "http://localhost:3000",
  "http://localhost:5173",
];

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : defaultOrigins;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

app.use(express.json());

app.use("/users", userRoutes);
app.use("/products", productRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Inventory API is running!",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      products: "/products",
      categories: "/products/categories",
      users: "/users",
    },
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.all("/*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

app.listen(PORT, "0.0.0.0", (err) => {
  if (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }

  console.log(`Backend server is running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
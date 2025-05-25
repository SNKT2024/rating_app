const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes importing
const authRoutes = require("./src/routes/auth");
const adminRoutes = require("./src/routes/adminRoutes");
const normalUserRoutes = require("./src/routes/normalUserRoutes");
const storeOwnerRoutes = require("./src/routes/storeOwnerRoutes");

//  Sample Route
app.get("/", (req, res) => {
  res.send("Welcome to the Store Rating API! Server is running.");
});

// Auth Routes
app.use("/api/auth", authRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);

// Normal User Routes
app.use("/api", normalUserRoutes);

// Store Owner Routes
app.use("/api/store-owner", storeOwnerRoutes);

// Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

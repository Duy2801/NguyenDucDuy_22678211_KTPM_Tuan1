// Main Server File
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Import Plugin Manager and Plugins
const pluginManager = require("./plugins/PluginManager");
const postManagementPlugin = require("./plugins/postManagementPlugin");
const commentSystemPlugin = require("./plugins/commentSystemPlugin");
const uploadImagePlugin = require("./plugins/uploadImagePlugin");

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/cms_db";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✓ Connected to MongoDB");
    initializeApplication();
  })
  .catch((error) => {
    console.error("✗ MongoDB connection error:", error);
    process.exit(1);
  });

// Initialize application
async function initializeApplication() {
  try {
    // Register all plugins
    console.log("\n=== Registering Plugins ===");
    pluginManager.registerPlugin(postManagementPlugin);
    pluginManager.registerPlugin(commentSystemPlugin);
    pluginManager.registerPlugin(uploadImagePlugin);

    // Initialize all plugins
    await pluginManager.initializeAllPlugins();

    // Register all plugin routes
    pluginManager.registerAllRoutes(app);

    // API Health Check Route
    app.get("/api/health", (req, res) => {
      res.status(200).json({
        success: true,
        message: "CMS API is running",
        plugins: pluginManager.getEnabledPlugins(),
      });
    });

    // Get all plugins info route
    app.get("/api/plugins", (req, res) => {
      res.status(200).json({
        success: true,
        data: pluginManager.getAllPluginsInfo(),
      });
    });

    // 404 Handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
      });
    });

    // Global Error Handler
    app.use((error, req, res, next) => {
      console.error("Error:", error.message);
      res.status(error.status || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔌 Plugins info: http://localhost:${PORT}/api/plugins\n`);
    });
  } catch (error) {
    console.error("Error initializing application:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down gracefully...");
  await mongoose.connection.close();
  console.log("MongoDB connection closed");
  process.exit(0);
});

module.exports = app;

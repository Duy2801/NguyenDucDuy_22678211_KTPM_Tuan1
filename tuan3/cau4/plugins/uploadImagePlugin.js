// Upload Image Plugin
const Plugin = require("./Plugin");
const mediaRoutes = require("../routes/mediaRoutes");
const fs = require("fs");
const path = require("path");

class UploadImagePlugin extends Plugin {
  constructor() {
    super("Upload Image", "1.0.0");
  }

  async initialize() {
    console.log(`Initializing ${this.name} plugin...`);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, "..", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("Uploads directory created");
    }

    return true;
  }

  registerRoutes(app) {
    console.log(`Registering routes for ${this.name} plugin...`);

    // Serve static files from uploads directory
    const uploadsPath = path.join(__dirname, "..", "uploads");
    app.use("/uploads", require("express").static(uploadsPath));

    // Register media routes
    app.use("/api/media", mediaRoutes);
  }
}

module.exports = new UploadImagePlugin();

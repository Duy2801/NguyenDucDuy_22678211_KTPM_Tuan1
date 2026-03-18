// Post Management Plugin
const Plugin = require("./Plugin");
const postRoutes = require("../routes/postRoutes");

class PostManagementPlugin extends Plugin {
  constructor() {
    super("Post Management", "1.0.0");
  }

  async initialize() {
    console.log(`Initializing ${this.name} plugin...`);
    // Any initialization logic here
    return true;
  }

  registerRoutes(app) {
    console.log(`Registering routes for ${this.name} plugin...`);
    app.use("/api/posts", postRoutes);
  }
}

module.exports = new PostManagementPlugin();

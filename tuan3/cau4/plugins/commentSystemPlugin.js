// Comment System Plugin
const Plugin = require("./Plugin");
const commentRoutes = require("../routes/commentRoutes");

class CommentSystemPlugin extends Plugin {
  constructor() {
    super("Comment System", "1.0.0");
  }

  async initialize() {
    console.log(`Initializing ${this.name} plugin...`);
    // Any initialization logic here
    return true;
  }

  registerRoutes(app) {
    console.log(`Registering routes for ${this.name} plugin...`);
    app.use("/api/comments", commentRoutes);
  }
}

module.exports = new CommentSystemPlugin();

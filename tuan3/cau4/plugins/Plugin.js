// Plugin System - Base Plugin Class
class Plugin {
  constructor(name, version) {
    this.name = name;
    this.version = version;
    this.enabled = false;
  }

  // Initialize plugin
  async initialize() {
    throw new Error("Plugin must implement initialize() method");
  }

  // Register routes with Express app
  registerRoutes(app) {
    throw new Error("Plugin must implement registerRoutes() method");
  }

  // Enable plugin
  enable() {
    this.enabled = true;
    console.log(`Plugin ${this.name} v${this.version} enabled`);
  }

  // Disable plugin
  disable() {
    this.enabled = false;
    console.log(`Plugin ${this.name} v${this.version} disabled`);
  }

  // Get plugin info
  getInfo() {
    return {
      name: this.name,
      version: this.version,
      enabled: this.enabled,
    };
  }
}

module.exports = Plugin;

// Plugin Manager - Manages all plugins
class PluginManager {
  constructor() {
    this.plugins = new Map();
  }

  // Register a plugin
  registerPlugin(plugin) {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered`);
      return false;
    }

    this.plugins.set(plugin.name, plugin);
    console.log(`Plugin ${plugin.name} registered`);
    return true;
  }

  // Enable a plugin
  async enablePlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    if (plugin.enabled) {
      console.warn(`Plugin ${pluginName} is already enabled`);
      return false;
    }

    await plugin.initialize();
    plugin.enable();
    return true;
  }

  // Disable a plugin
  disablePlugin(pluginName) {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found`);
    }

    plugin.disable();
    return true;
  }

  // Initialize all plugins
  async initializeAllPlugins() {
    console.log("\n=== Initializing All Plugins ===");
    for (const [name, plugin] of this.plugins) {
      try {
        await plugin.initialize();
        plugin.enable();
      } catch (error) {
        console.error(`Error initializing plugin ${name}:`, error.message);
      }
    }
    console.log("=== All Plugins Initialized ===\n");
  }

  // Register all plugin routes
  registerAllRoutes(app) {
    console.log("\n=== Registering Plugin Routes ===");
    for (const [name, plugin] of this.plugins) {
      if (plugin.enabled) {
        try {
          plugin.registerRoutes(app);
        } catch (error) {
          console.error(
            `Error registering routes for plugin ${name}:`,
            error.message,
          );
        }
      }
    }
    console.log("=== All Routes Registered ===\n");
  }

  // Get all plugins info
  getAllPluginsInfo() {
    const pluginsInfo = [];
    for (const plugin of this.plugins.values()) {
      pluginsInfo.push(plugin.getInfo());
    }
    return pluginsInfo;
  }

  // Get enabled plugins
  getEnabledPlugins() {
    const enabledPlugins = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.enabled) {
        enabledPlugins.push(plugin.getInfo());
      }
    }
    return enabledPlugins;
  }
}

module.exports = new PluginManager();

const express = require("express");
const cors = require("cors");

// CMS Core (Microkernel) - Chứa Plugin Manager và Routing cơ bản
class Microkernel {
  constructor() {
    this.app = express();
    this.plugins = []; // Nơi chứa các plugins đã đăng ký

    // Basic Config / Middleware
    this.app.use(cors());
    this.app.use(express.json());

    // Expose folder tĩnh cho frontend và media
    this.app.use(express.static("public"));
    this.app.use("/uploads", express.static("uploads"));
  }

  // Plugin Manager: Nạp plugin vào hệ thống
  registerPlugin(plugin) {
    this.plugins.push(plugin);
    console.log(`[Microkernel] Đã nạp plugin: ${plugin.name}`);
  }

  start(port = 3005) {
    // Init Routing cho tất cả các Plugin
    this.plugins.forEach((plugin) => {
      if (typeof plugin.setupRoutes === "function") {
        plugin.setupRoutes(this.app);
      }
    });

    this.app.listen(port, () => {
      console.log(
        `\n🚀 [CMS Core] Hệ thống hoạt động tại http://localhost:${port}`,
      );
    });
  }
}

module.exports = new Microkernel();

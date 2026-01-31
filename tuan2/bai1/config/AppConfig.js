// config/AppConfig.js
class AppConfig {
  constructor() {
    if (AppConfig.instance) {
      return AppConfig.instance;
    }

    this.env = "DEV";
    this.appName = "Notification System";

    AppConfig.instance = this;
  }

  static getInstance() {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }
}

module.exports = AppConfig;

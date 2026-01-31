// index.js
const AppConfig = require("./config/AppConfig");
const DevNotificationFactory = require("./factories/DevNotificationFactory");
const ProdNotificationFactory = require("./factories/ProdNotificationFactory");

const config = AppConfig.getInstance();
console.log("App:", config.appName);
console.log("Env:", config.env);

let factory;

if (config.env === "DEV") {
  factory = new DevNotificationFactory();
} else {
  factory = new ProdNotificationFactory();
}

const email = factory.createNotification("email");
email.send("Hello Singleton & Factory!");

const sms = factory.createNotification("sms");
sms.send("Design Patterns in Node.js");

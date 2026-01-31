// factories/ProdNotificationFactory.js
const NotificationFactory = require("./NotificationFactory");
const EmailNotification = require("../notifications/EmailNotification");
const SMSNotification = require("../notifications/SMSNotification");
const PushNotification = require("../notifications/PushNotification");

class ProdNotificationFactory extends NotificationFactory {
  createNotification(type) {
    if (type === "email") return new EmailNotification();
    if (type === "sms") return new SMSNotification();
    if (type === "push") return new PushNotification();
    throw new Error("Unsupported notification type");
  }
}

module.exports = ProdNotificationFactory;

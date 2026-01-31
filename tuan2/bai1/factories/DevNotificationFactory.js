// factories/DevNotificationFactory.js
const NotificationFactory = require("./NotificationFactory");
const EmailNotification = require("../notifications/EmailNotification");
const SMSNotification = require("../notifications/SMSNotification");

class DevNotificationFactory extends NotificationFactory {
  createNotification(type) {
    if (type === "email") return new EmailNotification();
    if (type === "sms") return new SMSNotification();
    throw new Error("Unsupported notification type");
  }
}

module.exports = DevNotificationFactory;

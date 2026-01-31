// notifications/SMSNotification.js
const Notification = require("./Notification");

class SMSNotification extends Notification {
  send(message) {
    console.log(`📱 Sending SMS: ${message}`);
  }
}

module.exports = SMSNotification;

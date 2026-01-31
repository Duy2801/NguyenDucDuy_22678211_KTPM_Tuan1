// notifications/EmailNotification.js
const Notification = require("./Notification");

class EmailNotification extends Notification {
  send(message) {
    console.log(`📧 Sending EMAIL: ${message}`);
  }
}

module.exports = EmailNotification;

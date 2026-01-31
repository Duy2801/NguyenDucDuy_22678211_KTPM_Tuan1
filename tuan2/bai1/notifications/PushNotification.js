// notifications/PushNotification.js
const Notification = require("./Notification");

class PushNotification extends Notification {
  send(message) {
    console.log(`🔔 Sending PUSH: ${message}`);
  }
}

module.exports = PushNotification;

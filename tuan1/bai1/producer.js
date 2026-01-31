const amqp = require("amqplib");

async function sendMessage() {
  const connection = await amqp.connect(
    "amqp://admin:admin123@localhost:5672"
  );
  const channel = await connection.createChannel();

  const queue = "demo_queue";
  const message = "Nguyen Duc DUy 4";

  await channel.assertQueue(queue);
  channel.sendToQueue(queue, Buffer.from(message));

  console.log("Pushed:", message);

  setTimeout(() => {
    connection.close();
  }, 500);
}

sendMessage();
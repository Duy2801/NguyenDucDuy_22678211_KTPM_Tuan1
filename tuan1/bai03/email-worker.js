const amqp = require("amqplib");

const QUEUE_NAME = "email_queue";
const MAX_RETRIES = 3;

function sendEmail(orderId) {
  return new Promise((resolve, reject) => {
    console.log("Đang gửi email cho order:", orderId);

    setTimeout(() => {
      if (Math.random() < 0.5) {
        return reject(new Error("Email lỗi"));
      }
      console.log("Gửi email thành công:", orderId);
      resolve();
    }, 4000);
  });
}

async function startWorker() {
  const connection = await amqp.connect("amqp://admin:admin123@localhost");
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME, { durable: true });
  channel.prefetch(1);

  console.log("Email Worker đang chạy...");

  channel.consume(QUEUE_NAME, async (msg) => {
    const { orderId } = JSON.parse(msg.content.toString());
    const retryCount = msg.properties.headers?.["x-retry-count"] || 0;
    const startTime = Date.now();
    try {
      await sendEmail(orderId);
      console.log(`✓ Email cho order ${orderId} gửi thành công`);
      channel.ack(msg);
    } catch (err) {
      console.error(
        `✗ Gửi email cho order ${orderId} thất bại (lần ${retryCount + 1}/${MAX_RETRIES}):`,
        err.message,
      );

      if (retryCount < MAX_RETRIES) {
        console.log(`⟳ Retry lần ${retryCount + 1} cho order ${orderId}...`);
        channel.sendToQueue(QUEUE_NAME, msg.content, {
          persistent: true,
          headers: {
            "x-retry-count": retryCount + 1,
          },
        });
        channel.ack(msg);
      } else {
        console.error(
          `⚠ Order ${orderId} đã retry ${MAX_RETRIES} lần, bỏ qua.`,
        );
        channel.ack(msg);
      }
    }
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`Hoàn thành công việc trong ${duration}s`);
  });
}

startWorker();

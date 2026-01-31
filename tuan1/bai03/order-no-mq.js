const express = require("express");

const app = express();
app.use(express.json());

function sendEmail(orderId) {
  return new Promise((resolve, reject) => {
    console.log("Đang gửi email cho order:", orderId);

    setTimeout(() => {
      if (Math.random() < 0.3) {
        return reject(new Error("Gửi email thất bại"));
      }
      console.log("Gửi email thành công:", orderId);
      resolve();
    }, 4000); 
  });
}

app.post("/order", async (req, res) => {
  try {
    const startTime = Date.now();
    const orderId = Date.now();
    
    await new Promise((resolve) => {
      setTimeout(() => {
        console.log("Tạo đơn hàng:", orderId);
        resolve();
      }, 2000);
    });
    await sendEmail(orderId);
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    console.log(`Hoàn thành công việc trong ${duration}s`);
    
    res.json({
      success: true,
      orderId,
      duration: `${duration}s`,
    });
  } catch (err) {
    console.error("Lỗi:", err.message);
    res.status(500).json({
      success: false,
      message: "Đặt hàng thất bại",
    });
  }
});

app.listen(3000, () => {
  console.log("Order API (NO MQ) chạy tại port 3000");
});

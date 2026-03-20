const mongoose = require("mongoose");

module.exports = {
  connect: () => {
    // Kết nối thẳng MongoDB theo mô hình Core kết nối Database
    mongoose
      .connect(
        "",
      )
      .then(() =>
        console.log("✅ [Database] Đã kết nối tới MongoDB thành công!"),
      )
      .catch((err) => console.error("❌ [Database] Lỗi kết nối MongoDB:", err));
  },
};

const express = require("express");
require("dotenv").config();

const authRoutes = require("./routes/auth.route");

const app = express();
app.use(express.json());

app.use("/api", authRoutes);

app.listen(3000, () => {
  console.log("Server chạy tại http://localhost:3000");
});

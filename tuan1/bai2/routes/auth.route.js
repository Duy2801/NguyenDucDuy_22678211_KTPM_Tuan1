const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRole = require("../middlewares/role.middleware");

router.post("/login", authController.login);

router.post("/refresh-token", authController.refreshToken);

router.get("/profile", authenticateToken, (req, res) => {
  res.json(req.user);
});

router.get("/admin", authenticateToken, authorizeRole("admin"), (req, res) => {
  res.json({ message: "Chào ADMIN 👑" });
});

// Lấy danh sách tất cả users (chỉ admin) - phải đứng trước /users/:id
router.get(
  "/users",
  authenticateToken,
  authorizeRole("admin"),
  authController.getAllUsers,
);

// Lấy thông tin user theo ID (Guest chỉ xem của mình, Admin xem tất cả)
router.get("/users/:id", authenticateToken, authController.getUserInfo);

// Xóa user (chỉ admin)
router.delete(
  "/users/:id",
  authenticateToken,
  authorizeRole("admin"),
  authController.deleteUser,
);

module.exports = router;

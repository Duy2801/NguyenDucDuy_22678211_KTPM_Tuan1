const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const authorizeRole = require("../middlewares/role.middleware");

// login
router.post("/login", authController.login);

// refresh token
router.post("/refresh-token", authController.refreshToken);

// ai có token cũng vào được
router.get("/profile", authenticateToken, (req, res) => {
  res.json(req.user);
});

// chỉ admin
router.get(
  "/admin",
  authenticateToken,
  authorizeRole("admin"),
  (req, res) => {
    res.json({ message: "Chào ADMIN 👑" });
  }
);

module.exports = router;

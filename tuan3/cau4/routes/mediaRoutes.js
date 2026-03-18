// API Routes - Media Routes
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const mediaController = require("../controllers/mediaController");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// GET /api/media - Get all media
router.get("/", mediaController.getAllMedia.bind(mediaController));

// GET /api/media/:id - Get media by ID
router.get("/:id", mediaController.getMediaById.bind(mediaController));

// POST /api/media/upload - Upload media
router.post(
  "/upload",
  upload.single("image"),
  mediaController.uploadMedia.bind(mediaController),
);

// DELETE /api/media/:id - Delete media
router.delete("/:id", mediaController.deleteMedia.bind(mediaController));

module.exports = router;

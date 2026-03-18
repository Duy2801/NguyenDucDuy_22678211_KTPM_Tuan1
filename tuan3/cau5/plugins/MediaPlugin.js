const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cấu hình Multer để upload file nhanh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// --- PLUGIN LOGIC ---
class MediaPlugin {
  constructor() {
    this.name = "Khối Thư viện ảnh (Media Plugin)";
  }

  setupRoutes(app) {
    // Upload Image
    app.post("/api/media/upload", upload.single("image"), (req, res) => {
      if (req.file) {
        res.json({
          message: "Upload thành công",
          url: "http://localhost:3005/uploads/" + req.file.filename,
        });
      } else {
        res.status(400).json({ error: "Không có file nào!" });
      }
    });

    // Get Media
    app.get("/api/media", (req, res) => {
      const dir = "./uploads/";
      if (!fs.existsSync(dir)) return res.json([]);

      // Đọc ổ đĩa lấy danh sách file để minh hoạ getMedia()
      const files = fs.readdirSync(dir).map((f) => ({
        url: "http://localhost:3005/uploads/" + f,
      }));
      res.json(files);
    });
  }
}

module.exports = new MediaPlugin();

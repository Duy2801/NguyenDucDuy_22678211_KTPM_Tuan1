const mongoose = require("mongoose");

// --- DATABASE TABLE ---
// Khai báo Model gọn nhẹ ngay bên trong Plugin thay vì tạo Repository/Service riêng
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
});
const Post = mongoose.model("PostPluginData", postSchema);

// --- PLUGIN LOGIC ---
class PostPlugin {
  constructor() {
    this.name = "Khối quản lý bài viết (Post Plugin)";
  }

  setupRoutes(app) {
    // GET Posts
    app.get("/api/posts", async (req, res) => {
      const posts = await Post.find();
      res.json(posts);
    });

    // CREATE Post
    app.post("/api/posts", async (req, res) => {
      const post = new Post(req.body);
      await post.save();
      res.json({ message: "Đã tạo bài viết", data: post });
    });

    // UPDATE Post
    app.put("/api/posts/:id", async (req, res) => {
      const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.json({ message: "Đã cập nhật", data: post });
    });

    // DELETE Post
    app.delete("/api/posts/:id", async (req, res) => {
      await Post.findByIdAndDelete(req.params.id);
      res.json({ message: "Đã xóa bài viết thành công" });
    });
  }
}

module.exports = new PostPlugin();

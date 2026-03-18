const mongoose = require("mongoose");

// --- DATABASE TABLE ---
const commentSchema = new mongoose.Schema({
  postId: String,
  content: String,
  author: String,
});
const Comment = mongoose.model("CommentPluginData", commentSchema);

// --- PLUGIN LOGIC ---
class CommentPlugin {
  constructor() {
    this.name = "Khối Bình luận (Comment Plugin)";
  }

  setupRoutes(app) {
    // ADD Comment
    app.post("/api/comments", async (req, res) => {
      const comment = new Comment(req.body);
      await comment.save();
      res.json({ message: "Đã thêm bình luận", data: comment });
    });

    // GET Comments by postId
    app.get("/api/comments/:postId", async (req, res) => {
      const comments = await Comment.find({ postId: req.params.postId });
      res.json(comments);
    });

    // DELETE Comment
    app.delete("/api/comments/:id", async (req, res) => {
      await Comment.findByIdAndDelete(req.params.id);
      res.json({ message: "Đã xóa bình luận" });
    });
  }
}

module.exports = new CommentPlugin();

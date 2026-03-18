// API Layer - Comment Controller
const commentService = require("../services/commentService");

class CommentController {
  // GET /api/comments - Get all comments
  async getAllComments(req, res) {
    try {
      const comments = await commentService.getAllComments();
      res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/comments/post/:postId - Get comments by post ID
  async getCommentsByPostId(req, res) {
    try {
      const comments = await commentService.getCommentsByPostId(
        req.params.postId,
      );
      res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/comments/:id - Get comment by ID
  async getCommentById(req, res) {
    try {
      const comment = await commentService.getCommentById(req.params.id);
      res.status(200).json({
        success: true,
        data: comment,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // POST /api/comments - Create new comment
  async createComment(req, res) {
    try {
      const comment = await commentService.createComment(req.body);
      res.status(201).json({
        success: true,
        data: comment,
        message: "Comment created successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // DELETE /api/comments/:id - Delete comment
  async deleteComment(req, res) {
    try {
      await commentService.deleteComment(req.params.id);
      res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new CommentController();

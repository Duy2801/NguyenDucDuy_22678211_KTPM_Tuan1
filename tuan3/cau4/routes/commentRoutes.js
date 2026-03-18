// API Routes - Comment Routes
const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

// GET /api/comments - Get all comments
router.get("/", commentController.getAllComments.bind(commentController));

// GET /api/comments/post/:postId - Get comments by post ID
router.get(
  "/post/:postId",
  commentController.getCommentsByPostId.bind(commentController),
);

// GET /api/comments/:id - Get comment by ID
router.get("/:id", commentController.getCommentById.bind(commentController));

// POST /api/comments - Create new comment
router.post("/", commentController.createComment.bind(commentController));

// DELETE /api/comments/:id - Delete comment
router.delete("/:id", commentController.deleteComment.bind(commentController));

module.exports = router;

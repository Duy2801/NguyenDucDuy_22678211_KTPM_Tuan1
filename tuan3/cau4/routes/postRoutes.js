// API Routes - Post Routes
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

// GET /api/posts - Get all posts
router.get("/", postController.getAllPosts.bind(postController));

// GET /api/posts/status/:status - Get posts by status
router.get(
  "/status/:status",
  postController.getPostsByStatus.bind(postController),
);

// GET /api/posts/:id - Get post by ID
router.get("/:id", postController.getPostById.bind(postController));

// POST /api/posts - Create new post
router.post("/", postController.createPost.bind(postController));

// PUT /api/posts/:id - Update post
router.put("/:id", postController.updatePost.bind(postController));

// DELETE /api/posts/:id - Delete post
router.delete("/:id", postController.deletePost.bind(postController));

module.exports = router;

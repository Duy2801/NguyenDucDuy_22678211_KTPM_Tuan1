// API Layer - Post Controller
const postService = require("../services/postService");

class PostController {
  // GET /api/posts - Get all posts
  async getAllPosts(req, res) {
    try {
      const posts = await postService.getAllPosts();
      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/posts/:id - Get post by ID
  async getPostById(req, res) {
    try {
      const post = await postService.getPostById(req.params.id);
      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // POST /api/posts - Create new post
  async createPost(req, res) {
    try {
      const post = await postService.createPost(req.body);
      res.status(201).json({
        success: true,
        data: post,
        message: "Post created successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // PUT /api/posts/:id - Update post
  async updatePost(req, res) {
    try {
      const post = await postService.updatePost(req.params.id, req.body);
      res.status(200).json({
        success: true,
        data: post,
        message: "Post updated successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // DELETE /api/posts/:id - Delete post
  async deletePost(req, res) {
    try {
      await postService.deletePost(req.params.id);
      res.status(200).json({
        success: true,
        message: "Post deleted successfully",
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/posts/status/:status - Get posts by status
  async getPostsByStatus(req, res) {
    try {
      const posts = await postService.getPostsByStatus(req.params.status);
      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new PostController();

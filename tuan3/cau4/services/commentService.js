// Business Logic Layer - Comment Service
const commentRepository = require("../repository/commentRepository");
const postRepository = require("../repository/postRepository");

class CommentService {
  // Get all comments
  async getAllComments() {
    try {
      return await commentRepository.findAll();
    } catch (error) {
      throw new Error(`Service error - Get all comments: ${error.message}`);
    }
  }

  // Get comments by post ID
  async getCommentsByPostId(postId) {
    try {
      // Verify post exists
      const post = await postRepository.findById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      return await commentRepository.findByPostId(postId);
    } catch (error) {
      throw new Error(
        `Service error - Get comments by post ID: ${error.message}`,
      );
    }
  }

  // Get comment by ID
  async getCommentById(id) {
    try {
      const comment = await commentRepository.findById(id);
      if (!comment) {
        throw new Error("Comment not found");
      }
      return comment;
    } catch (error) {
      throw new Error(`Service error - Get comment by ID: ${error.message}`);
    }
  }

  // Create new comment
  async createComment(commentData) {
    try {
      // Validate required fields
      if (!commentData.postId || !commentData.author || !commentData.content) {
        throw new Error("PostId, author, and content are required");
      }

      // Verify post exists
      const post = await postRepository.findById(commentData.postId);
      if (!post) {
        throw new Error("Post not found");
      }

      return await commentRepository.save(commentData);
    } catch (error) {
      throw new Error(`Service error - Create comment: ${error.message}`);
    }
  }

  // Delete comment
  async deleteComment(id) {
    try {
      const comment = await commentRepository.findById(id);
      if (!comment) {
        throw new Error("Comment not found");
      }

      await commentRepository.delete(id);
      return { message: "Comment deleted successfully" };
    } catch (error) {
      throw new Error(`Service error - Delete comment: ${error.message}`);
    }
  }

  // Delete all comments for a post
  async deleteCommentsByPostId(postId) {
    try {
      await commentRepository.deleteByPostId(postId);
      return { message: "All comments deleted successfully" };
    } catch (error) {
      throw new Error(
        `Service error - Delete comments by post ID: ${error.message}`,
      );
    }
  }
}

module.exports = new CommentService();

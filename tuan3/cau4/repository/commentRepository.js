// Data Access Layer - Comment Repository
const Comment = require("../models/Comment");

class CommentRepository {
  // Find all comments
  async findAll() {
    try {
      return await Comment.find()
        .populate("postId", "title")
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error finding comments: ${error.message}`);
    }
  }

  // Find comments by post ID
  async findByPostId(postId) {
    try {
      return await Comment.find({ postId }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error finding comments by post ID: ${error.message}`);
    }
  }

  // Find comment by ID
  async findById(id) {
    try {
      return await Comment.findById(id).populate("postId", "title");
    } catch (error) {
      throw new Error(`Error finding comment by ID: ${error.message}`);
    }
  }

  // Save new comment
  async save(commentData) {
    try {
      const comment = new Comment(commentData);
      return await comment.save();
    } catch (error) {
      throw new Error(`Error saving comment: ${error.message}`);
    }
  }

  // Delete comment
  async delete(id) {
    try {
      return await Comment.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting comment: ${error.message}`);
    }
  }

  // Delete all comments for a post
  async deleteByPostId(postId) {
    try {
      return await Comment.deleteMany({ postId });
    } catch (error) {
      throw new Error(`Error deleting comments by post ID: ${error.message}`);
    }
  }
}

module.exports = new CommentRepository();

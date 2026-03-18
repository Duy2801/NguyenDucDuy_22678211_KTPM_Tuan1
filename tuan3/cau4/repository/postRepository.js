// Data Access Layer - Post Repository
const Post = require("../models/Post");

class PostRepository {
  // Find all posts
  async findAll() {
    try {
      return await Post.find().sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error finding posts: ${error.message}`);
    }
  }

  // Find post by ID
  async findById(id) {
    try {
      return await Post.findById(id);
    } catch (error) {
      throw new Error(`Error finding post by ID: ${error.message}`);
    }
  }

  // Save new post
  async save(postData) {
    try {
      const post = new Post(postData);
      return await post.save();
    } catch (error) {
      throw new Error(`Error saving post: ${error.message}`);
    }
  }

  // Update post
  async update(id, postData) {
    try {
      return await Post.findByIdAndUpdate(
        id,
        { ...postData, updatedAt: Date.now() },
        { new: true, runValidators: true },
      );
    } catch (error) {
      throw new Error(`Error updating post: ${error.message}`);
    }
  }

  // Delete post
  async delete(id) {
    try {
      return await Post.findByIdAndDelete(id);
    } catch (error) {
      throw new Error(`Error deleting post: ${error.message}`);
    }
  }

  // Find posts by status
  async findByStatus(status) {
    try {
      return await Post.find({ status }).sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Error finding posts by status: ${error.message}`);
    }
  }
}

module.exports = new PostRepository();

// Business Logic Layer - Post Service
const postRepository = require("../repository/postRepository");

class PostService {
  // Get all posts
  async getAllPosts() {
    try {
      return await postRepository.findAll();
    } catch (error) {
      throw new Error(`Service error - Get all posts: ${error.message}`);
    }
  }

  // Get post by ID
  async getPostById(id) {
    try {
      const post = await postRepository.findById(id);
      if (!post) {
        throw new Error("Post not found");
      }
      return post;
    } catch (error) {
      throw new Error(`Service error - Get post by ID: ${error.message}`);
    }
  }

  // Create new post
  async createPost(postData) {
    try {
      // Validate required fields
      if (!postData.title || !postData.content || !postData.author) {
        throw new Error("Title, content, and author are required");
      }

      return await postRepository.save(postData);
    } catch (error) {
      throw new Error(`Service error - Create post: ${error.message}`);
    }
  }

  // Update post
  async updatePost(id, postData) {
    try {
      const existingPost = await postRepository.findById(id);
      if (!existingPost) {
        throw new Error("Post not found");
      }

      const updatedPost = await postRepository.update(id, postData);
      return updatedPost;
    } catch (error) {
      throw new Error(`Service error - Update post: ${error.message}`);
    }
  }

  // Delete post
  async deletePost(id) {
    try {
      const post = await postRepository.findById(id);
      if (!post) {
        throw new Error("Post not found");
      }

      await postRepository.delete(id);
      return { message: "Post deleted successfully" };
    } catch (error) {
      throw new Error(`Service error - Delete post: ${error.message}`);
    }
  }

  // Get posts by status
  async getPostsByStatus(status) {
    try {
      if (!["draft", "published"].includes(status)) {
        throw new Error('Invalid status. Must be "draft" or "published"');
      }
      return await postRepository.findByStatus(status);
    } catch (error) {
      throw new Error(`Service error - Get posts by status: ${error.message}`);
    }
  }
}

module.exports = new PostService();

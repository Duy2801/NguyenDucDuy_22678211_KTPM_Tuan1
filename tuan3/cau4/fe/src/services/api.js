// API Service Layer
const API_BASE_URL = "http://localhost:5000/api";

// Posts API
export const postsAPI = {
  getAllPosts: async () => {
    const response = await fetch(`${API_BASE_URL}/posts`);
    return response.json();
  },

  getPostById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`);
    return response.json();
  },

  createPost: async (postData) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    return response.json();
  },

  updatePost: async (id, postData) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    return response.json();
  },

  deletePost: async (id) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },
};

// Comments API
export const commentsAPI = {
  getAllComments: async () => {
    const response = await fetch(`${API_BASE_URL}/comments`);
    return response.json();
  },

  getCommentsByPostId: async (postId) => {
    const response = await fetch(`${API_BASE_URL}/comments/post/${postId}`);
    return response.json();
  },

  createComment: async (commentData) => {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
    });
    return response.json();
  },

  deleteComment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },
};

// Media API
export const mediaAPI = {
  getAllMedia: async () => {
    const response = await fetch(`${API_BASE_URL}/media`);
    return response.json();
  },

  uploadMedia: async (file, uploadedBy = "anonymous") => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("uploadedBy", uploadedBy);

    const response = await fetch(`${API_BASE_URL}/media/upload`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  deleteMedia: async (id) => {
    const response = await fetch(`${API_BASE_URL}/media/${id}`, {
      method: "DELETE",
    });
    return response.json();
  },
};

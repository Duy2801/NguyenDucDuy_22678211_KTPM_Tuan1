import React, { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import PostCard from '../components/PostCard';
import CommentList from '../components/CommentList';
import './PostListPage.css';

const PostListPage = ({ onEditPost, onCreatePost }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await postsAPI.getAllPosts();
      if (response.success) {
        setPosts(response.data);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      alert('Error loading posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await postsAPI.deletePost(postId);
      if (response.success) {
        loadPosts();
        setSelectedPostId(null);
      } else {
        alert('Error deleting post: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  const handleViewComments = (postId) => {
    setSelectedPostId(selectedPostId === postId ? null : postId);
  };

  if (loading) {
    return <div className="loading">Loading posts...</div>;
  }

  return (
    <div className="post-list-page">
      <div className="page-header">
        <h1>All Posts</h1>
        <button onClick={onCreatePost} className="btn-create">
          Create New Post
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="no-posts">
          <p>No posts yet. Create your first post!</p>
        </div>
      ) : (
        <div className="posts-container">
          {posts.map((post) => (
            <div key={post._id}>
              <PostCard
                post={post}
                onEdit={onEditPost}
                onDelete={handleDelete}
                onViewComments={handleViewComments}
              />
              {selectedPostId === post._id && (
                <CommentList postId={post._id} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostListPage;

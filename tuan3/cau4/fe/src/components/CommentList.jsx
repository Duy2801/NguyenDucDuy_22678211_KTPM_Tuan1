import React, { useState, useEffect } from 'react';
import { commentsAPI } from '../services/api';
import './CommentList.css';

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ author: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await commentsAPI.getCommentsByPostId(postId);
      if (response.success) {
        setComments(response.data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.author || !newComment.content) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await commentsAPI.createComment({
        postId,
        ...newComment,
      });

      if (response.success) {
        setNewComment({ author: '', content: '' });
        loadComments();
      } else {
        alert('Error creating comment: ' + response.message);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Error creating comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await commentsAPI.deleteComment(commentId);
      if (response.success) {
        loadComments();
      } else {
        alert('Error deleting comment: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment');
    }
  };

  if (loading) {
    return <div className="loading">Loading comments...</div>;
  }

  return (
    <div className="comment-list">
      <h3>Comments ({comments.length})</h3>

      <form onSubmit={handleSubmit} className="comment-form">
        <input
          type="text"
          placeholder="Your name"
          value={newComment.author}
          onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}
        />
        <textarea
          placeholder="Write a comment..."
          value={newComment.content}
          onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
          rows="3"
        />
        <button type="submit" className="btn-primary">Post Comment</button>
      </form>

      <div className="comments">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="comment">
              <div className="comment-header">
                <strong>{comment.author}</strong>
                <span className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="comment-content">{comment.content}</p>
              <button
                onClick={() => handleDelete(comment._id)}
                className="btn-delete-comment"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentList;

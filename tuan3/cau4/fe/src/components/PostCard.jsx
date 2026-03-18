import React from 'react';
import './PostCard.css';

const PostCard = ({ post, onEdit, onDelete, onViewComments }) => {
  return (
    <div className="post-card">
      {post.imageUrl && (
        <div className="post-image">
          <img src={`http://localhost:5000${post.imageUrl}`} alt={post.title} />
        </div>
      )}
      <div className="post-content">
        <h3>{post.title}</h3>
        <p className="post-author">By {post.author}</p>
        <p className="post-text">{post.content}</p>
        <div className="post-meta">
          <span className={`post-status ${post.status}`}>{post.status}</span>
          <span className="post-date">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="post-actions">
          <button onClick={() => onViewComments(post._id)} className="btn-secondary">
            View Comments
          </button>
          <button onClick={() => onEdit(post)} className="btn-primary">
            Edit
          </button>
          <button onClick={() => onDelete(post._id)} className="btn-danger">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;

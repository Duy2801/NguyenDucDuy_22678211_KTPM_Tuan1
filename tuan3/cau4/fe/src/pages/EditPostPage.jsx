import React, { useState, useEffect } from 'react';
import { postsAPI } from '../services/api';
import MediaUploader from '../components/MediaUploader';
import './PostFormPage.css';

const EditPostPage = ({ post, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    imageUrl: '',
    status: 'draft',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || '',
        content: post.content || '',
        author: post.author || '',
        imageUrl: post.imageUrl || '',
        status: post.status || 'draft',
      });
    }
  }, [post]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageSelect = (imageUrl) => {
    setFormData({ ...formData, imageUrl });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.author) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await postsAPI.updatePost(post._id, formData);
      if (response.success) {
        alert('Post updated successfully!');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        alert('Error updating post: ' + response.message);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post');
    } finally {
      setSubmitting(false);
    }
  };

  if (!post) {
    return <div>No post selected</div>;
  }

  return (
    <div className="post-form-page">
      <div className="page-header">
        <h1>Edit Post</h1>
        <button onClick={onBack} className="btn-back">
          Back to Posts
        </button>
      </div>

      <form onSubmit={handleSubmit} className="post-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">Author *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="10"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="form-group">
          <label>Featured Image</label>
          {formData.imageUrl && (
            <div className="selected-image">
              <img src={`http://localhost:5000${formData.imageUrl}`} alt="Selected" />
            </div>
          )}
          <MediaUploader onImageSelect={handleImageSelect} />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onBack} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-submit">
            {submitting ? 'Updating...' : 'Update Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPostPage;

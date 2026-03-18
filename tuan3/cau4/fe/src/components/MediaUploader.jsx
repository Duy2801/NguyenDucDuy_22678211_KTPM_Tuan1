import React, { useState, useEffect } from 'react';
import { mediaAPI } from '../services/api';
import './MediaUploader.css';

const MediaUploader = ({ onImageSelect }) => {
  const [mediaList, setMediaList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const response = await mediaAPI.getAllMedia();
      if (response.success) {
        setMediaList(response.data);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await mediaAPI.uploadMedia(file);
      if (response.success) {
        alert('Image uploaded successfully!');
        loadMedia();
      } else {
        alert('Error uploading image: ' + response.message);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectImage = (media) => {
    setSelectedImage(media);
    if (onImageSelect) {
      onImageSelect(media.url);
    }
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await mediaAPI.deleteMedia(mediaId);
      if (response.success) {
        loadMedia();
        if (selectedImage && selectedImage._id === mediaId) {
          setSelectedImage(null);
          if (onImageSelect) {
            onImageSelect(null);
          }
        }
      } else {
        alert('Error deleting image: ' + response.message);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image');
    }
  };

  return (
    <div className="media-uploader">
      <h3>Media Library</h3>

      <div className="upload-section">
        <label htmlFor="file-upload" className="upload-button">
          {uploading ? 'Uploading...' : 'Upload Image'}
        </label>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </div>

      <div className="media-grid">
        {mediaList.length === 0 ? (
          <p className="no-media">No images uploaded yet</p>
        ) : (
          mediaList.map((media) => (
            <div
              key={media._id}
              className={`media-item ${selectedImage?._id === media._id ? 'selected' : ''}`}
            >
              <img
                src={`http://localhost:5000${media.url}`}
                alt={media.originalName}
                onClick={() => handleSelectImage(media)}
              />
              <div className="media-overlay">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(media._id);
                  }}
                  className="btn-delete-media"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MediaUploader;

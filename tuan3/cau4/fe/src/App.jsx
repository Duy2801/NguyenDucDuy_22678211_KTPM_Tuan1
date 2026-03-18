import React, { useState } from 'react';
import PostListPage from './pages/PostListPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('list');
  const [selectedPost, setSelectedPost] = useState(null);

  const handleCreatePost = () => {
    setCurrentPage('create');
  };

  const handleEditPost = (post) => {
    setSelectedPost(post);
    setCurrentPage('edit');
  };

  const handleBackToList = () => {
    setCurrentPage('list');
    setSelectedPost(null);
  };

  const handleSuccess = () => {
    handleBackToList();
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">Plugin-based CMS</h1>
          <p className="app-subtitle">Content Management System with Layered Architecture</p>
        </div>
      </header>

      <main className="app-main">
        {currentPage === 'list' && (
          <PostListPage
            onCreatePost={handleCreatePost}
            onEditPost={handleEditPost}
          />
        )}

        {currentPage === 'create' && (
          <CreatePostPage
            onBack={handleBackToList}
            onSuccess={handleSuccess}
          />
        )}

        {currentPage === 'edit' && (
          <EditPostPage
            post={selectedPost}
            onBack={handleBackToList}
            onSuccess={handleSuccess}
          />
        )}
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2026 Plugin-based CMS | Layered Architecture Demo</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [description, setDescription] = useState('');

  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Movie "${title}" added successfully!`);
    setTitle('');
    setGenre('');
    setPosterUrl('');
    setDescription('');
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Admin Dashboard ⚙️</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>
          View Site as User
        </button>
      </div>

      <div className="row">
        {/* Add Movie Form */}
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm border-0 p-4">
            <h4 className="fw-bold mb-3">Add New Movie 🎬</h4>
            <form onSubmit={handleAddMovie}>
              <div className="mb-3">
                <label className="form-label">Movie Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Inception"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Genre</label>
                <input 
                  type="text" 
                  className="form-control" 
                  required 
                  value={genre} 
                  onChange={(e) => setGenre(e.target.value)}
                  placeholder="e.g. Action / Sci-Fi"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Direct Poster URL (Imgur .jpeg link)</label>
                <input 
                  type="url" 
                  className="form-control" 
                  required 
                  value={posterUrl} 
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="https://i.imgur.com/xxxxxx.jpeg"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  rows={3}
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Movie plot summary..."
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 fw-bold">
                Add Movie
              </button>
            </form>
          </div>
        </div>

        {/* Quick Stats / Overview */}
        <div className="col-md-6">
          <div className="card shadow-sm border-0 p-4 mb-4 bg-light">
            <h4 className="fw-bold mb-3">System Overview</h4>
            <p><strong>Total Movies:</strong> 3</p>
            <p><strong>Total Active Bookings:</strong> 1</p>
            <p><strong>Total Revenue:</strong> LKR 5,000</p>
          </div>
        </div>
      </div>
    </div>
  );
};
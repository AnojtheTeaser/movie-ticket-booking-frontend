import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    if (auth) {
      auth.logout();
      navigate('/'); 
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">
          🎬 Movie Booking
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            {/* shows booking only when loging */}
            {auth?.isAuthenticated && (
              <li className="nav-item">
                <Link className="nav-link" to="/my-bookings">
                  My Bookings 🎟️
                </Link>
              </li>
            )}

            {/* show admin panel for only admin */}
            {auth?.isAuthenticated && auth?.user?.role === 'ADMIN' && (
              <li className="nav-item">
                <Link className="nav-link text-warning fw-bold" to="/admin">
                  Admin Panel ⚙️
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {auth?.isAuthenticated ? (
              <>
                <span className="text-light me-2">
                  <i className="bi bi-person-circle me-1"></i>
                  {auth.user?.email}
                </span>
                <button 
                  onClick={handleLogout} 
                  className="btn btn-outline-danger btn-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-light btn-sm">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
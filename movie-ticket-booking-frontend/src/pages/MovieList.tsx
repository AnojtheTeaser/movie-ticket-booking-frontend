import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { MovieDTO } from '../types';
import { AuthContext } from '../context/AuthContext';

export const MovieList: React.FC = () => {
  const auth = useContext(AuthContext);
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    
    if (auth?.isAuthenticated) {
      const fetchMovies = async () => {
        try {
          const data = await movieService.getAllMovies();
          setMovies(data);
        } catch (err: any) {
          setError('Failed to load movies. Please check backend connection.');
        } finally {
          setLoading(false);
        }
      };

      fetchMovies();
    } else {
      setLoading(false);
    }
  }, [auth?.isAuthenticated]);

  // Fallback Image for missing posters
  const fallbackImage =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23666666'>No Poster Available</text></svg>";

  // 1. No logong show Welcome Banner 
  if (!auth?.isAuthenticated) {
    return (
      <div className="container text-center mt-5 py-5">
        <div className="p-5 mb-4 bg-light rounded-3 shadow-sm border">
          <h1 className="display-4 fw-bold mb-3">🎬 Welcome to Movie Ticket Booking System</h1>
          <p className="lead text-muted mb-4">
            Book your favorite movie tickets easily and quickly! Please Sign In or Sign Up to explore available movies and reserve your seats.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/login" className="btn btn-primary btn-lg px-4 fw-bold">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-outline-success btn-lg px-4 fw-bold">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // 3. Error State
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  // Show Movies to Logged-in User  
  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center fw-bold">Now Showing Movies</h2>

      {movies.length === 0 ? (
        <p className="text-center">No movies available right now.</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 row-cols-lg-4 g-4">
          {movies.map((movie, index) => {
            const id = movie.movieId ?? movie.id ?? index;

            return (
              <div key={id} className="col">
                <div className="card h-100 shadow-sm border-0">
                  <img
                    src={movie.posterUrl || fallbackImage}
                    className="card-img-top rounded-top"
                    alt={movie.title}
                    style={{ height: '360px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold">{movie.title}</h5>
                    <p className="card-text text-muted mb-1">
                      <small>
                        <strong>Genre:</strong> {movie.genre}
                      </small>
                    </p>
                    <p className="card-text text-muted mb-3">
                      <small>
                        <strong>Duration:</strong> {movie.durationMinutes} mins
                      </small>
                    </p>
                    <div className="mt-auto">
                      <Link to={`/movies/${id}`} className="btn btn-primary w-100 fw-bold">
                        Book Tickets
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
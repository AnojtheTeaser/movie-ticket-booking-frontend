import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { Movie } from '../services/movieService';

export const MovieList: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
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
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );
  }

  // Fallback SVG image data URL to avoid external URL reliance during errors
  const fallbackImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23666666'>No Poster Available</text></svg>";

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
                      // Prevent infinite loop by clearing onerror before updating source
                      e.currentTarget.onerror = null; 
                      e.currentTarget.src = fallbackImage;
                    }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title fw-bold">{movie.title}</h5>
                    <p className="card-text text-muted mb-1">
                      <small><strong>Genre:</strong> {movie.genre}</small>
                    </p>
                    <p className="card-text text-muted mb-3">
                      <small><strong>Duration:</strong> {movie.durationMinutes} mins</small>
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
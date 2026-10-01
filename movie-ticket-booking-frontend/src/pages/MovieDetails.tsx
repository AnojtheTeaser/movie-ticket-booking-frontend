import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { Movie } from '../services/movieService';

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      try {
        const data = await movieService.getMovieById(Number(id));
        setMovie(data);
      } catch (err: any) {
        setError('Failed to load movie details. Please check connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger text-center">
          {error || 'Movie not found.'}
        </div>
        <div className="text-center mt-3">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const fallbackImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23666666'>No Poster Available</text></svg>";

  return (
    <div className="container mt-5">
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
        &larr; Back
      </button>

      <div className="card shadow border-0 overflow-hidden">
        <div className="row g-0">
          <div className="col-md-4">
            <img 
              src={movie.posterUrl || fallbackImage} 
              alt={movie.title}
              className="img-fluid rounded-start w-100 h-100"
              style={{ objectFit: 'cover', minHeight: '400px' }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = fallbackImage;
              }}
            />
          </div>
          <div className="col-md-8">
            <div className="card-body p-4 d-flex flex-column h-100">
              <h2 className="card-title fw-bold mb-3">{movie.title}</h2>
              
              <div className="mb-3">
                <span className="badge bg-primary me-2 fs-6">{movie.genre}</span>
                <span className="badge bg-secondary me-2 fs-6">{movie.language}</span>
                <span className="badge bg-info text-dark fs-6">{movie.durationMinutes || 'N/A'} mins</span>
              </div>

              <h5 className="fw-bold mt-2">Overview</h5>
              <p className="card-text text-muted fs-5">
                {movie.description || 'No description available for this movie.'}
              </p>

              <div className="mt-auto pt-4">
                <button 
                  className="btn btn-success btn-lg px-5 fw-bold"
                   onClick={() => navigate(`/movies/${movie.id || movie.movieId}/seats`)}
                    >
                     Book Seats Now 🎟️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { MovieDTO, ShowDTO, TheatreDTO } from '../types';

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<MovieDTO | null>(null);
  const [shows, setShows] = useState<ShowDTO[]>([]);
  const [theatres, setTheatres] = useState<TheatreDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMovieDetails = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const movieId = Number(id);
        
        const [movieData, showsData, theatresData] = await Promise.all([
          movieService.getMovieById(movieId),
          movieService.getShowsByMovieId ? movieService.getShowsByMovieId(movieId).catch(() => []) : [],
          movieService.getAllTheatres ? movieService.getAllTheatres().catch(() => []) : []
        ]);

        setMovie(movieData);
        setShows(showsData);
        setTheatres(theatresData);
      } catch (err: any) {
        console.error('Error fetching details:', err);
        setError('Failed to load movie details. Please check connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  const getTheatreName = (theatreId: number) => {
    const theatre = theatres.find(t => (t.theatreId ?? t.id) === theatreId);
    return theatre ? `${theatre.name} (${theatre.location})` : `Theatre #${theatreId}`;
  };

  const fallbackImage = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'><rect width='100%' height='100%' fill='%23cccccc'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%23666666'>No Poster Available</text></svg>";

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

  return (
    <div className="container mt-5 mb-5">
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
        &larr; Back
      </button>

      {/* Movie Details Card */}
      <div className="card shadow border-0 overflow-hidden mb-5">
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
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes & Theatre Selection Section */}
      <h3 className="fw-bold mb-4">🎟️ Select Show & Theatre</h3>
      {shows.length === 0 ? (
        <div className="alert alert-warning text-center">
          No shows currently scheduled for this movie. Please check back later!
        </div>
      ) : (
        <div className="row g-3">
          {shows.map((show) => {
            const showId = show.showId ?? show.id;
            const movieId = movie.movieId ?? movie.id;

            return (
              <div key={showId} className="col-md-6 col-lg-4">
                <div className="card shadow-sm border-start border-primary border-4 p-3 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="fw-bold text-primary mb-2">
                      🏛️ {getTheatreName(show.theatreId)}
                    </h5>
                    <p className="mb-1 text-muted">📅 Date: <strong>{show.showDate}</strong></p>
                    <p className="mb-1 text-muted">⏰ Time: <strong>{show.showTime}</strong></p>
                    <p className="mb-2 text-success fw-bold fs-5">
                      LKR {show.ticketPrice} <small className="fs-6 text-muted">/ seat</small>
                    </p>
                  </div>
                  <button 
                    className="btn btn-success w-100 fw-bold mt-3"
                    onClick={() => navigate(`/movies/${movieId}/seats`, { state: { selectedShowId: showId } })}
                  >
                    Select Seats 🎟️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
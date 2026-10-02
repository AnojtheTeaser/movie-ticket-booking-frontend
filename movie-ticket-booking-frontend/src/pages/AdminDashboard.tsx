import React, { useEffect, useState } from 'react';
import { movieService } from '../services/movieService';
import { 
  MovieStatus, 
  TheatreStatus, 
  ShowStatus 
} from '../types';
import type { MovieDTO, TheatreDTO, ShowDTO } from '../types';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'movies' | 'theatres' | 'shows'>('movies');
  
  // Data States
  const [movies, setMovies] = useState<MovieDTO[]>([]);
  const [theatres, setTheatres] = useState<TheatreDTO[]>([]);
  const [shows, setShows] = useState<ShowDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Forms States
  const [newMovie, setNewMovie] = useState<MovieDTO>({
    title: '',
    genre: '',
    durationMinutes: 120,
    language: 'English',
    description: '',
    posterUrl: '',
    status: MovieStatus.NOW_SHOWING
  });

  const [newTheatre, setNewTheatre] = useState<TheatreDTO>({
    name: '',
    location: '',
    capacity: 100,
    status: TheatreStatus.ACTIVE
  });

  const [newShow, setNewShow] = useState<ShowDTO>({
    movieId: 0,
    theatreId: 0,
    showDate: '',
    showTime: '',
    ticketPrice: 0,
    status: ShowStatus.SCHEDULED
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [moviesData, theatresData, showsData] = await Promise.all([
        movieService.getAllMovies().catch(() => []),
        movieService.getAllTheatres().catch(() => []),
        movieService.getAllShows().catch(() => [])
      ]);
      setMovies(moviesData);
      setTheatres(theatresData);
      setShows(showsData);
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to fetch admin data.' });
    } finally {
      setLoading(false);
    }
  };

  // Movie Handlers
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await movieService.addMovie(newMovie);
      setMessage({ type: 'success', text: 'Movie added successfully!' });
      setNewMovie({
        title: '',
        genre: '',
        durationMinutes: 120,
        language: 'English',
        description: '',
        posterUrl: '',
        status: MovieStatus.NOW_SHOWING
      });
      loadAllData();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to add movie.' });
    }
  };

  const handleDeleteMovie = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await movieService.deleteMovie(id);
      setMessage({ type: 'success', text: 'Movie deleted successfully!' });
      loadAllData();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to delete movie.' });
    }
  };

  // Theatre Handlers
  const handleAddTheatre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await movieService.addTheatre(newTheatre);
      setMessage({ type: 'success', text: 'Theatre added successfully!' });
      setNewTheatre({
        name: '',
        location: '',
        capacity: 100,
        status: TheatreStatus.ACTIVE
      });
      loadAllData();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to add theatre.' });
    }
  };

  const handleDeleteTheatre = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this theatre?')) return;
    try {
      await movieService.deleteTheatre(id);
      setMessage({ type: 'success', text: 'Theatre deleted successfully!' });
      loadAllData();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to delete theatre.' });
    }
  };

  // Show Handlers
  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await movieService.createShow(newShow);
      setMessage({ type: 'success', text: 'Show scheduled successfully!' });
      setNewShow({
        movieId: 0,
        theatreId: 0,
        showDate: '',
        showTime: '',
        ticketPrice: 0,
        status: ShowStatus.SCHEDULED
      });
      loadAllData();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to schedule show.' });
    }
  };

  const handleDeleteShow = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this show?')) return;
    try {
      await movieService.deleteShow(id);
      setMessage({ type: 'success', text: 'Show deleted successfully!' });
      loadAllData();
    } catch (err) {
      setMessage({ type: 'danger', text: 'Failed to delete show.' });
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="fw-bold mb-4">⚙️ Admin Dashboard</h2>

      {message && (
        <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
        </div>
      )}

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'movies' ? 'active fw-bold' : ''}`} 
            onClick={() => setActiveTab('movies')}
          >
            🎬 Movies
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'theatres' ? 'active fw-bold' : ''}`} 
            onClick={() => setActiveTab('theatres')}
          >
            🏛️ Theatres
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'shows' ? 'active fw-bold' : ''}`} 
            onClick={() => setActiveTab('shows')}
          >
            🎟️ Schedule Shows
          </button>
        </li>
      </ul>

      {/* TAB 1: MOVIES */}
      {activeTab === 'movies' && (
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold mb-3">Add New Movie</h5>
              <form onSubmit={handleAddMovie}>
                <div className="mb-2">
                  <label className="form-label">Title</label>
                  <input type="text" className="form-control" value={newMovie.title} onChange={e => setNewMovie({...newMovie, title: e.target.value})} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Genre</label>
                  <input type="text" className="form-control" value={newMovie.genre} onChange={e => setNewMovie({...newMovie, genre: e.target.value})} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Duration (mins)</label>
                  <input type="number" className="form-control" value={newMovie.durationMinutes} onChange={e => setNewMovie({...newMovie, durationMinutes: Number(e.target.value)})} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Language</label>
                  <input type="text" className="form-control" value={newMovie.language} onChange={e => setNewMovie({...newMovie, language: e.target.value})} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={newMovie.status} onChange={e => setNewMovie({...newMovie, status: e.target.value as MovieStatus})}>
                    <option value={MovieStatus.NOW_SHOWING}>Now Showing</option>
                    <option value={MovieStatus.UPCOMING}>Upcoming</option>
                    <option value={MovieStatus.ENDED}>Ended</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Poster URL</label>
                  <input type="url" className="form-control" value={newMovie.posterUrl} onChange={e => setNewMovie({...newMovie, posterUrl: e.target.value})} required />
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold">Save Movie</button>
              </form>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold mb-3">Movie List</h5>
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((m) => {
                    const id = m.movieId ?? m.id;
                    return (
                      <tr key={id}>
                        <td className="fw-bold">{m.title}</td>
                        <td>{m.genre}</td>
                        <td><span className="badge bg-info">{m.status}</span></td>
                        <td>
                          {id && (
                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteMovie(id)}>
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THEATRES */}
      {activeTab === 'theatres' && (
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold mb-3">Add New Theatre</h5>
              <form onSubmit={handleAddTheatre}>
                <div className="mb-2">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={newTheatre.name} onChange={e => setNewTheatre({...newTheatre, name: e.target.value})} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Location</label>
                  <input type="text" className="form-control" value={newTheatre.location} onChange={e => setNewTheatre({...newTheatre, location: e.target.value})} required />
                </div>
                <div className="mb-2">
                  <label className="form-label">Capacity</label>
                  <input type="number" className="form-control" value={newTheatre.capacity} onChange={e => setNewTheatre({...newTheatre, capacity: Number(e.target.value)})} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={newTheatre.status} onChange={e => setNewTheatre({...newTheatre, status: e.target.value as TheatreStatus})}>
                    <option value={TheatreStatus.ACTIVE}>Active</option>
                    <option value={TheatreStatus.INACTIVE}>Inactive</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100 fw-bold">Save Theatre</button>
              </form>
            </div>
          </div>
          <div className="col-md-8">
            <div className="card p-3 shadow-sm">
              <h5 className="fw-bold mb-3">Theatre List</h5>
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {theatres.map((t, idx) => {
                    const id = t.theatreId ?? t.id;
                    return (
                      <tr key={id ?? idx}>
                        <td className="fw-bold">{t.name}</td>
                        <td>{t.location}</td>
                        <td>{t.capacity}</td>
                        <td>
                          <span className={`badge ${t.status === TheatreStatus.ACTIVE ? 'bg-success' : 'bg-secondary'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          {id && (
                            <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteTheatre(id)}>
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SHOWS (WIDE FULL-WIDTH LAYOUT) */}
      {activeTab === 'shows' && (
        <div className="row g-4">
          {/* Top Section: Form in Grid */}
          <div className="col-12">
            <div className="card p-4 shadow-sm border-0 bg-light">
              <h5 className="fw-bold mb-3 text-primary">➕ Schedule New Show</h5>
              <form onSubmit={handleAddShow}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Select Movie</label>
                    <select className="form-select" value={newShow.movieId} onChange={e => setNewShow({...newShow, movieId: Number(e.target.value)})} required>
                      <option value={0}>-- Select Movie --</option>
                      {movies.map(m => (
                        <option key={m.movieId ?? m.id} value={m.movieId ?? m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Select Theatre</label>
                    <select className="form-select" value={newShow.theatreId} onChange={e => setNewShow({...newShow, theatreId: Number(e.target.value)})} required>
                      <option value={0}>-- Select Theatre --</option>
                      {theatres.map(t => (
                        <option key={t.theatreId ?? t.id} value={t.theatreId ?? t.id}>{t.name} ({t.location})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Ticket Price ($)</label>
                    <input type="number" className="form-control" value={newShow.ticketPrice} onChange={e => setNewShow({...newShow, ticketPrice: Number(e.target.value)})} required />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Show Date</label>
                    <input type="date" className="form-control" value={newShow.showDate} onChange={e => setNewShow({...newShow, showDate: e.target.value})} required />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Show Time</label>
                    <input type="time" className="form-control" value={newShow.showTime} onChange={e => setNewShow({...newShow, showTime: e.target.value})} required />
                  </div>

                  <div className="col-md-4 d-flex align-items-end">
                    <button type="submit" className="btn btn-primary w-100 fw-bold py-2">
                      Schedule Show
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Bottom Section: Full Width Table */}
          <div className="col-12">
            <div className="card p-3 shadow-sm border-0">
              <h5 className="fw-bold mb-3">Scheduled Shows List</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-dark">
                    <tr>
                      <th>Show ID</th>
                      <th>Movie Name</th>
                      <th>Movie ID</th>
                      <th>Theatre Name</th>
                      <th>Theatre ID</th>
                      <th>Show Date</th>
                      <th>Show Time</th>
                      <th>Price</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shows.map((s, idx) => {
                      const id = s.showId ?? s.id;
                      const matchedMovie = movies.find(m => (m.movieId ?? m.id) === s.movieId);
                      const matchedTheatre = theatres.find(t => (t.theatreId ?? t.id) === s.theatreId);

                      return (
                        <tr key={id ?? idx}>
                          <td><span className="badge bg-secondary">#{id}</span></td>
                          <td className="fw-bold text-primary">{matchedMovie?.title || 'Unknown'}</td>
                          <td><code>#{s.movieId}</code></td>
                          <td className="fw-bold">{matchedTheatre ? `${matchedTheatre.name} (${matchedTheatre.location})` : 'Unknown'}</td>
                          <td><code>#{s.theatreId}</code></td>
                          <td>{s.showDate}</td>
                          <td><span className="badge bg-info text-dark">{s.showTime}</span></td>
                          <td className="fw-bold text-success">${s.ticketPrice}</td>
                          <td className="text-center">
                            {id && (
                              <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteShow(id)}>
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
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

  // Edit Modal States
  const [editingMovie, setEditingMovie] = useState<MovieDTO | null>(null);
  const [editingTheatre, setEditingTheatre] = useState<TheatreDTO | null>(null);
  const [editingShow, setEditingShow] = useState<ShowDTO | null>(null);

  // Initial States for Forms
  const initialMovieState: MovieDTO = {
    title: '',
    genre: '',
    durationMinutes: 120,
    language: 'English',
    description: '',
    posterUrl: '',
    status: MovieStatus.NOW_SHOWING
  };

  const initialTheatreState: TheatreDTO = {
    name: '',
    location: '',
    capacity: 100,
    seatMapUrl: '', // Optional seat map URL
    status: TheatreStatus.ACTIVE
  };

  const initialShowState: ShowDTO = {
    movieId: 0,
    theatreId: 0,
    showDate: '',
    showTime: '',
    ticketPrice: 0,
    status: ShowStatus.SCHEDULED
  };

  // Forms States
  const [newMovie, setNewMovie] = useState<MovieDTO>(initialMovieState);
  const [newTheatre, setNewTheatre] = useState<TheatreDTO>(initialTheatreState);
  const [newShow, setNewShow] = useState<ShowDTO>(initialShowState);

  useEffect(() => {
    loadAllData();
  }, []);

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

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
      showNotification('danger', 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  // ================= MOVIE HANDLERS =================
  const handleAddMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await movieService.addMovie(newMovie);
      showNotification('success', 'Movie added successfully!');
      setNewMovie(initialMovieState);
      loadAllData();
    } catch (err) {
      showNotification('danger', 'Failed to add movie.');
    }
  };

  const handleUpdateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMovie) return;
    const id = editingMovie.movieId ?? editingMovie.id;
    if (!id) return;

    try {
      await movieService.updateMovie(id, editingMovie);
      showNotification('success', 'Movie updated successfully!');
      setEditingMovie(null);
      loadAllData();
    } catch (err) {
      showNotification('danger', 'Failed to update movie.');
    }
  };

  const handleDeleteMovie = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this movie?')) return;
    try {
      await movieService.deleteMovie(id);
      showNotification('success', 'Movie deleted successfully!');
      loadAllData();
    } catch (err) {
      showNotification('danger', 'Failed to delete movie.');
    }
  };

  // ================= THEATRE HANDLERS =================
  const handleAddTheatre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await movieService.addTheatre(newTheatre);
      showNotification('success', 'Theatre added successfully!');
      setNewTheatre(initialTheatreState);
      loadAllData();
    } catch (err) {
      showNotification('danger', 'Failed to add theatre.');
    }
  };

  const handleUpdateTheatre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTheatre) return;
    const id = editingTheatre.theatreId ?? editingTheatre.id;
    if (!id) return;

    try {
      await movieService.updateTheatre(id, editingTheatre);
      showNotification('success', 'Theatre updated successfully!');
      setEditingTheatre(null);
      loadAllData();
    } catch (err) {
      showNotification('danger', 'Failed to update theatre.');
    }
  };

  const handleDeleteTheatre = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this theatre?')) return;
    try {
      await movieService.deleteTheatre(id);
      showNotification('success', 'Theatre deleted successfully!');
      loadAllData();
    } catch (err) {
      showNotification('danger', 'Failed to delete theatre.');
    }
  };

  // ================= SHOW HANDLERS =================
  const handleAddShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newShow.movieId === 0 || newShow.theatreId === 0) {
      showNotification('danger', 'Please select both a valid Movie and Theatre.');
      return;
    }

    try {
      await movieService.createShow(newShow);
      showNotification('success', 'Show scheduled successfully!');
      setNewShow(initialShowState);
      loadAllData();
    } catch (err) {
      showNotification('danger', 'Failed to schedule show.');
    }
  };

  const handleUpdateShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShow) return;
    const id = editingShow.showId ?? editingShow.id;
    if (!id) return;

    try {
      await movieService.updateShow(id, editingShow);
      showNotification('success', 'Show updated successfully!');
      setEditingShow(null);
      loadAllData();
    } catch (err) {
      showNotification('danger', 'Failed to update show.');
    }
  };

  const handleDeleteShow = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this show?')) return;
    try {
      await movieService.deleteShow(id);
      showNotification('success', 'Show deleted successfully!');
      loadAllData();
    } catch (err) {
      showNotification('danger', 'Failed to delete show.');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
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
            <div className="card p-3 shadow-sm border-0">
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
                  <input type="number" className="form-control" value={newMovie.durationMinutes} onChange={e => setNewMovie({...newMovie, durationMinutes: Number(e.target.value)})} required min="1" />
                </div>
                <div className="mb-2">
                  <label className="form-label">Language</label>
                  <input type="text" className="form-control" value={newMovie.language} onChange={e => setNewMovie({...newMovie, language: e.target.value})} />
                </div>
                <div className="mb-2">
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={2} value={newMovie.description} onChange={e => setNewMovie({...newMovie, description: e.target.value})} />
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
            <div className="card p-3 shadow-sm border-0">
              <h5 className="fw-bold mb-3">Movie List</h5>
              {movies.length === 0 ? (
                <p className="text-muted text-center my-3">No movies available.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Genre</th>
                        <th>Status</th>
                        <th className="text-center">Action</th>
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
                            <td className="text-center">
                              {id && (
                                <>
                                  <button className="btn btn-outline-warning btn-sm me-2" onClick={() => setEditingMovie(m)}>
                                    Edit
                                  </button>
                                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteMovie(id)}>
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THEATRES */}
      {activeTab === 'theatres' && (
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card p-3 shadow-sm border-0">
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
                  <input type="number" className="form-control" value={newTheatre.capacity} onChange={e => setNewTheatre({...newTheatre, capacity: Number(e.target.value)})} required min="1" />
                </div>
                <div className="mb-2">
                  <label className="form-label">Seat Map URL <span className="text-muted fs-7">(Optional)</span></label>
                  <input type="url" className="form-control" placeholder="https://example.com/seatmap.png" value={newTheatre.seatMapUrl || ''} onChange={e => setNewTheatre({...newTheatre, seatMapUrl: e.target.value})} />
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
            <div className="card p-3 shadow-sm border-0">
              <h5 className="fw-bold mb-3">Theatre List</h5>
              {theatres.length === 0 ? (
                <p className="text-muted text-center my-3">No theatres available.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Location</th>
                        <th>Capacity</th>
                        <th>Seat Map</th>
                        <th>Status</th>
                        <th className="text-center">Action</th>
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
                              {t.seatMapUrl ? (
                                <a href={t.seatMapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-info">View Map</a>
                              ) : (
                                <span className="text-muted fs-7">N/A</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${t.status === TheatreStatus.ACTIVE ? 'bg-success' : 'bg-secondary'}`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="text-center">
                              {id && (
                                <>
                                  <button className="btn btn-outline-warning btn-sm me-2" onClick={() => setEditingTheatre(t)}>
                                    Edit
                                  </button>
                                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteTheatre(id)}>
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SHOWS */}
      {activeTab === 'shows' && (
        <div className="row g-4">
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
                    <input type="number" className="form-control" value={newShow.ticketPrice} onChange={e => setNewShow({...newShow, ticketPrice: Number(e.target.value)})} required min="0" step="0.01" />
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

          <div className="col-12">
            <div className="card p-3 shadow-sm border-0">
              <h5 className="fw-bold mb-3">Scheduled Shows List</h5>
              {shows.length === 0 ? (
                <p className="text-muted text-center my-3">No scheduled shows found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-dark">
                      <tr>
                        <th>Show ID</th>
                        <th>Movie Name</th>
                        <th>Theatre Name</th>
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
                            <td className="fw-bold">{matchedTheatre ? `${matchedTheatre.name} (${matchedTheatre.location})` : 'Unknown'}</td>
                            <td>{s.showDate}</td>
                            <td><span className="badge bg-info text-dark">{s.showTime}</span></td>
                            <td className="fw-bold text-success">${s.ticketPrice}</td>
                            <td className="text-center">
                              {id && (
                                <>
                                  <button className="btn btn-outline-warning btn-sm me-2" onClick={() => setEditingShow(s)}>
                                    Edit
                                  </button>
                                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteShow(id)}>
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MOVIE MODAL ================= */}
      {editingMovie && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Edit Movie</h5>
                <button type="button" className="btn-close" onClick={() => setEditingMovie(null)}></button>
              </div>
              <form onSubmit={handleUpdateMovie}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Title</label>
                    <input type="text" className="form-control" value={editingMovie.title} onChange={e => setEditingMovie({...editingMovie, title: e.target.value})} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Genre</label>
                    <input type="text" className="form-control" value={editingMovie.genre} onChange={e => setEditingMovie({...editingMovie, genre: e.target.value})} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Duration (mins)</label>
                    <input type="number" className="form-control" value={editingMovie.durationMinutes} onChange={e => setEditingMovie({...editingMovie, durationMinutes: Number(e.target.value)})} required min="1" />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Language</label>
                    <input type="text" className="form-control" value={editingMovie.language} onChange={e => setEditingMovie({...editingMovie, language: e.target.value})} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows={2} value={editingMovie.description || ''} onChange={e => setEditingMovie({...editingMovie, description: e.target.value})} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={editingMovie.status} onChange={e => setEditingMovie({...editingMovie, status: e.target.value as MovieStatus})}>
                      <option value={MovieStatus.NOW_SHOWING}>Now Showing</option>
                      <option value={MovieStatus.UPCOMING}>Upcoming</option>
                      <option value={MovieStatus.ENDED}>Ended</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Poster URL</label>
                    <input type="url" className="form-control" value={editingMovie.posterUrl} onChange={e => setEditingMovie({...editingMovie, posterUrl: e.target.value})} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingMovie(null)}>Cancel</button>
                  <button type="submit" className="btn btn-warning fw-bold">Update Movie</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT THEATRE MODAL ================= */}
      {editingTheatre && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Edit Theatre</h5>
                <button type="button" className="btn-close" onClick={() => setEditingTheatre(null)}></button>
              </div>
              <form onSubmit={handleUpdateTheatre}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" value={editingTheatre.name} onChange={e => setEditingTheatre({...editingTheatre, name: e.target.value})} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Location</label>
                    <input type="text" className="form-control" value={editingTheatre.location} onChange={e => setEditingTheatre({...editingTheatre, location: e.target.value})} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Capacity</label>
                    <input type="number" className="form-control" value={editingTheatre.capacity} onChange={e => setEditingTheatre({...editingTheatre, capacity: Number(e.target.value)})} required min="1" />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Seat Map URL <span className="text-muted fs-7">(Optional)</span></label>
                    <input type="url" className="form-control" placeholder="https://example.com/seatmap.png" value={editingTheatre.seatMapUrl || ''} onChange={e => setEditingTheatre({...editingTheatre, seatMapUrl: e.target.value})} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={editingTheatre.status} onChange={e => setEditingTheatre({...editingTheatre, status: e.target.value as TheatreStatus})}>
                      <option value={TheatreStatus.ACTIVE}>Active</option>
                      <option value={TheatreStatus.INACTIVE}>Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingTheatre(null)}>Cancel</button>
                  <button type="submit" className="btn btn-warning fw-bold">Update Theatre</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT SHOW MODAL ================= */}
      {editingShow && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Edit Show</h5>
                <button type="button" className="btn-close" onClick={() => setEditingShow(null)}></button>
              </div>
              <form onSubmit={handleUpdateShow}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="form-label fw-semibold">Movie</label>
                    <select className="form-select" value={editingShow.movieId} onChange={e => setEditingShow({...editingShow, movieId: Number(e.target.value)})} required>
                      {movies.map(m => (
                        <option key={m.movieId ?? m.id} value={m.movieId ?? m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label fw-semibold">Theatre</label>
                    <select className="form-select" value={editingShow.theatreId} onChange={e => setEditingShow({...editingShow, theatreId: Number(e.target.value)})} required>
                      {theatres.map(t => (
                        <option key={t.theatreId ?? t.id} value={t.theatreId ?? t.id}>{t.name} ({t.location})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="form-label fw-semibold">Ticket Price ($)</label>
                    <input type="number" className="form-control" value={editingShow.ticketPrice} onChange={e => setEditingShow({...editingShow, ticketPrice: Number(e.target.value)})} required min="0" step="0.01" />
                  </div>
                  <div className="mb-2">
                    <label className="form-label fw-semibold">Show Date</label>
                    <input type="date" className="form-control" value={editingShow.showDate} onChange={e => setEditingShow({...editingShow, showDate: e.target.value})} required />
                  </div>
                  <div className="mb-2">
                    <label className="form-label fw-semibold">Show Time</label>
                    <input type="time" className="form-control" value={editingShow.showTime} onChange={e => setEditingShow({...editingShow, showTime: e.target.value})} required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingShow(null)}>Cancel</button>
                  <button type="submit" className="btn btn-warning fw-bold">Update Show</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
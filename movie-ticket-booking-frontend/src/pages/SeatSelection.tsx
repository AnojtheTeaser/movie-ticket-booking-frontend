import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { ShowDTO } from '../types';

export const SeatSelection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shows, setShows] = useState<ShowDTO[]>([]);
  const [selectedShow, setSelectedShow] = useState<ShowDTO | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    if (id) {
      setLoading(true);
      movieService.getShowsByMovieId(Number(id))
        .then((data) => {
          setShows(data || []);
          if (data && data.length > 0) {
            setSelectedShow(data[0]);
          }
        })
        .catch(() => {
          setError('Failed to load shows from backend.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  // Selected Show එක වෙනස් වන විට අදාළ Booked Seats ලබාගැනීම (Backend Method එක ඇත්නම් පමණක්)
  useEffect(() => {
    if (selectedShow) {
      setSelectedSeats([]); // Clear selected seats on show change
      const showId = selectedShow.showId ?? selectedShow.id;

      if (showId && movieService.getBookedSeatsByShowId) {
        movieService.getBookedSeatsByShowId(showId)
          .then((seats) => setBookedSeats(seats || []))
          .catch(() => setBookedSeats([]));
      }
    }
  }, [selectedShow]);

  const toggleSeat = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return; // Block clicking booked seats

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const ticketPrice = selectedShow ? selectedShow.ticketPrice : 0;
  const totalAmount = selectedSeats.length * ticketPrice;

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading Shows...</p>
      </div>
    );
  }

  if (error || shows.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <h4 className="text-danger">{error || 'No active shows available for this movie.'}</h4>
        <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
          &larr; Back to Details
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        &larr; Back to Details
      </button>

      <h2 className="text-center fw-bold mb-4">Select Your Seats 🎟️</h2>

      {/* Show Selection */}
      <div className="card p-3 shadow-sm mb-4 border-0 bg-light">
        <h5 className="fw-bold mb-3 text-center">Select Show Time</h5>
        <div className="d-flex justify-content-center flex-wrap gap-3">
          {shows.map((show) => {
            const currentShowId = show.showId ?? show.id;
            const selectedShowId = selectedShow?.showId ?? selectedShow?.id;
            const isSelected = selectedShowId === currentShowId;

            return (
              <button
                key={currentShowId}
                className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'} p-2 text-start`}
                onClick={() => setSelectedShow(show)}
              >
                <div className="fw-bold">{show.showTime}</div>
                <small className="d-block text-muted">LKR {show.ticketPrice}</small>
              </button>
            );
          })}
        </div>
      </div>

      {/* Screen Indicator */}
      <div className="text-center mb-5">
        <div 
          className="bg-dark text-white py-2 mx-auto rounded-3 shadow-sm mb-2" 
          style={{ width: '80%', letterSpacing: '4px', borderBottom: '4px solid #0d6efd' }}
        >
          SCREEN THIS WAY 🎬
        </div>
        <small className="text-muted">All eyes this way!</small>
      </div>

      {/* Seat Grid Layout */}
      <div className="d-flex flex-column align-items-center mb-4">
        {rows.map((row) => (
          <div key={row} className="d-flex gap-2 mb-2 align-items-center">
            <span className="fw-bold me-2 text-muted" style={{ width: '20px' }}>{row}</span>
            {cols.map((col) => {
              const seatId = `${row}${col}`;
              const isSelected = selectedSeats.includes(seatId);
              const isBooked = bookedSeats.includes(seatId);

              let btnClass = 'btn-outline-secondary';
              if (isBooked) btnClass = 'btn-secondary text-decoration-line-through';
              else if (isSelected) btnClass = 'btn-success';

              return (
                <button
                  key={seatId}
                  disabled={isBooked}
                  onClick={() => toggleSeat(seatId)}
                  className={`btn ${btnClass} btn-sm fw-bold`}
                  style={{ width: '42px', height: '42px' }}
                >
                  {col}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Seat Status Legend */}
      <div className="d-flex justify-content-center gap-4 mb-4">
        <div><span className="badge bg-outline-secondary border text-dark p-2">Available</span></div>
        <div><span className="badge bg-success p-2">Selected</span></div>
        <div><span className="badge bg-secondary p-2">Booked / Occupied</span></div>
      </div>

      {/* Booking Summary Box */}
      <div className="card shadow border-0 p-4 mx-auto" style={{ maxWidth: '500px' }}>
        <h4 className="fw-bold text-center mb-3">Booking Summary</h4>
        <p className="mb-2"><strong>Show Time:</strong> {selectedShow?.showTime || 'N/A'}</p>
        <p className="mb-2"><strong>Selected Seats:</strong> {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
        <p className="mb-2"><strong>Price per Ticket:</strong> LKR {ticketPrice}</p>
        <hr />
        <h4 className="fw-bold text-success d-flex justify-content-between">
          <span>Total:</span>
          <span>LKR {totalAmount}</span>
        </h4>

        <button 
          className="btn btn-primary btn-lg w-100 mt-3 fw-bold"
          disabled={selectedSeats.length === 0 || !selectedShow}
          onClick={() => navigate('/payment', {
            state: {
              movieId: id,
              showId: selectedShow?.showId ?? selectedShow?.id,
              selectedTime: selectedShow?.showTime,
              selectedSeats: selectedSeats,
              ticketPrice: ticketPrice,
              totalAmount: totalAmount
            }
          })}
        >
          Proceed to Pay 💳
        </button>
      </div>
    </div>
  );
};
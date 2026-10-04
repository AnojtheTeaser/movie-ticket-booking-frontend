import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { ShowDTO, TheatreDTO } from '../types';

export const SeatSelection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shows, setShows] = useState<ShowDTO[]>([]);
  const [theatresMap, setTheatresMap] = useState<Record<number, TheatreDTO>>({});
  const [selectedShow, setSelectedShow] = useState<ShowDTO | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState<boolean>(false);

  // Expired Shows filter කිරීම සඳහා Helper Function එක
  const isExpiredShow = (show: ShowDTO) => {
    if (!show.showDate || !show.showTime) return false;
    try {
      const showDateTimeStr = `${show.showDate}T${show.showTime}`;
      const showDateTime = new Date(showDateTimeStr).getTime();
      const currentDateTime = new Date().getTime();
      return showDateTime < currentDateTime;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);

      // Fetch shows for movie and theatre data concurrently
      Promise.all([
        movieService.getShowsByMovieId(Number(id)),
        movieService.getAllTheatres()
      ])
        .then(([showsData, theatresData]) => {
          console.log("Fetched Shows Data from Backend:", showsData);
          console.log("Fetched Theatres Data from Backend:", theatresData);

          const tMap: Record<number, TheatreDTO> = {};
          if (Array.isArray(theatresData)) {
            theatresData.forEach((t) => {
              const tId = t.id ?? t.theatreId;
              if (tId) tMap[tId] = t;
            });
          }
          setTheatresMap(tMap);

          // Filter out all expired shows
          const rawShows = showsData || [];
          const activeUpcomingShows = rawShows.filter((show) => !isExpiredShow(show));

          setShows(activeUpcomingShows);
          if (activeUpcomingShows.length > 0) {
            setSelectedShow(activeUpcomingShows[0]);
          }
        })
        .catch((err) => {
          console.error("Error loading shows or theatres:", err);
          setError('Failed to load shows from backend.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  // Fetch booked seats when selected show changes
  useEffect(() => {
    if (selectedShow) {
      setSelectedSeats([]);
      const showId = selectedShow.id ?? selectedShow.showId;

      if (showId && movieService.getBookedSeatsByShowId) {
        movieService.getBookedSeatsByShowId(showId)
          .then((seats) => {
            const sanitizedSeats = (seats || []).map((s) => String(s).trim());
            setBookedSeats(sanitizedSeats);
          })
          .catch(() => setBookedSeats([]));
      }
    }
  }, [selectedShow]);

  const toggleSeat = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const ticketPrice = selectedShow ? selectedShow.ticketPrice : 0;
  const totalAmount = selectedSeats.length * ticketPrice;

  // Selected Show & Theatre Mapping
  const currentTheatreId = selectedShow?.theatreId;
  const currentTheatre = currentTheatreId ? theatresMap[currentTheatreId] : null;

  // Capacity calculation with safety fallback
  const rawCapacity = selectedShow?.capacity || currentTheatre?.capacity || 100;
  const totalCapacity = Number(rawCapacity) > 0 ? Number(rawCapacity) : 100;

  // Seat Map Image URL (from Show or Theatre)
  const seatMapUrl = selectedShow?.seatMapUrl || currentTheatre?.seatMapUrl;

  // Dynamic Seat Grid Generation (20 seats per row)
  const SEATS_PER_ROW = 20;
  const totalSeatsArray = Array.from({ length: totalCapacity }, (_, i) => i + 1);

  const seatRows: number[][] = [];
  for (let i = 0; i < totalSeatsArray.length; i += SEATS_PER_ROW) {
    seatRows.push(totalSeatsArray.slice(i, i + SEATS_PER_ROW));
  }

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2 text-muted">Loading Shows & Seat Map...</p>
      </div>
    );
  }

  if (error || shows.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <h4 className="text-danger">{error || 'No active or upcoming shows available for this movie.'}</h4>
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

      <h2 className="text-center fw-bold mb-4">Select Your Seats 🎟</h2>

      {/* Show Selection Buttons */}
      <div className="card p-3 shadow-sm mb-4 border-0 bg-light">
        <h5 className="fw-bold mb-3 text-center">Select Show Date & Time</h5>
        <div className="d-flex justify-content-center flex-wrap gap-3">
          {shows.map((show, index) => {
            const currentShowId = show.id ?? show.showId ?? index;
            const selectedShowId = selectedShow?.id ?? selectedShow?.showId;
            const isSelected = selectedShowId === currentShowId;

            const showTheatre = show.theatreId ? theatresMap[show.theatreId] : null;
            const cap = show.capacity || showTheatre?.capacity || 'N/A';
            const tName = showTheatre?.name || (show.theatreId ? `Theatre ${show.theatreId}` : '');

            return (
              <button
                key={currentShowId}
                className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-primary'} p-3 text-start shadow-sm`}
                onClick={() => setSelectedShow(show)}
                style={{ minWidth: '220px' }}
              >
                <div className="fw-bold fs-6 mb-1">
                  {tName ? `🏛 ${tName}` : ''}
                </div>
                <div className="fw-semibold">
                  📅 {show.showDate ? `${show.showDate}` : ''} | ⏰ {show.showTime}
                </div>
                <small className="d-block mt-1 text-muted">
                  💵 LKR {show.ticketPrice} | 🪑 Capacity: {cap}
                </small>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seat Map View Button */}
      <div className="text-center mb-4">
        <button
          className={`btn ${seatMapUrl ? 'btn-info text-white' : 'btn-outline-secondary'} fw-bold px-4 py-2`}
          disabled={!seatMapUrl}
          onClick={() => setShowMapModal(true)}
        >
          {seatMapUrl ? '🗺️ View Theatre Seat Map Layout' : '🗺️ View Theatre Seat Map Layout (No map available)'}
        </button>
      </div>

      {/* Screen Indicator */}
      <div className="text-center mb-4">
        <div 
          className="bg-dark text-white py-2 mx-auto rounded-3 shadow-sm mb-2 fw-bold" 
          style={{ width: '90%', maxWidth: '850px', letterSpacing: '4px', borderBottom: '4px solid #0d6efd' }}
        >
          SCREEN THIS WAY 🎬
        </div>
        <small className="text-muted fw-bold">Total Theatre Capacity: {totalCapacity} Seats</small>
      </div>

      {/* Dynamic Seat Grid (20 per row) */}
      <div className="overflow-auto mb-4 pb-2">
        <div className="d-flex flex-column align-items-center" style={{ minWidth: '850px' }}>
          {seatRows.map((rowSeats, rowIndex) => (
            <div key={rowIndex} className="d-flex gap-1 mb-2 align-items-center">
              {rowSeats.map((seatNum) => {
                const seatId = String(seatNum);
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
                    className={`btn ${btnClass} btn-sm p-0 fw-bold`}
                    style={{ width: '38px', height: '38px', fontSize: '0.8rem' }}
                    title={isBooked ? `Seat ${seatId} (Booked)` : `Seat ${seatId}`}
                  >
                    {seatNum}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="d-flex justify-content-center gap-4 mb-4">
        <div><span className="badge bg-white border text-dark p-2">Available</span></div>
        <div><span className="badge bg-success p-2">Selected</span></div>
        <div><span className="badge bg-secondary p-2">Booked / Occupied</span></div>
      </div>

      {/* Summary Box */}
      <div className="card shadow border-0 p-4 mx-auto" style={{ maxWidth: '500px' }}>
        <h4 className="fw-bold text-center mb-3">Booking Summary</h4>
        <p className="mb-2"><strong>Show Date:</strong> {selectedShow?.showDate || 'N/A'}</p>
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
              showId: selectedShow?.id ?? selectedShow?.showId,
              selectedDate: selectedShow?.showDate,
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

      {/* Seat Map Modal */}
      {showMapModal && seatMapUrl && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Theatre Seat Map Layout</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowMapModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center p-3">
                <img 
                  src={seatMapUrl} 
                  alt="Theatre Seat Map Layout" 
                  className="img-fluid rounded shadow-sm"
                  style={{ maxHeight: '70vh', objectFit: 'contain' }}
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowMapModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
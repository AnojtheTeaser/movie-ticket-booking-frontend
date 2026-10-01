import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export const SeatSelection: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. Showtimes 
  const [selectedTime, setSelectedTime] = useState<string>('10:30 AM');
  
  // 2. Selected Seats Array 
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  const ticketPrice = 1000; // (LKR)

  // Seat Rows (A, B, C, D, E)  Columns (1-8)
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  // Seat  Select / Unselect  Function
  const toggleSeat = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const totalAmount = selectedSeats.length * ticketPrice;

  return (
    <div className="container mt-4 mb-5">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        &larr; Back to Details
      </button>

      <h2 className="text-center fw-bold mb-4">Select Your Seats 🎟️</h2>

      {/* Showtime Selection */}
      <div className="card p-3 shadow-sm mb-4 text-center border-0 bg-light">
        <h5 className="fw-bold mb-3">Select Show Time</h5>
        <div className="d-flex justify-content-center gap-3">
          {['10:30 AM', '02:30 PM', '06:30 PM', '09:30 PM'].map((time) => (
            <button
              key={time}
              className={`btn ${selectedTime === time ? 'btn-primary' : 'btn-outline-primary'} fw-bold`}
              onClick={() => setSelectedTime(time)}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Screen Indicator */}
      <div className="text-center mb-5">
        <div 
          className="bg-dark text-white py-2 mx-auto rounded-3 shadow-sm mb-2" 
          style={{ width: '80%', letterSpacing: '4px' }}
        >
          SCREEN THIS WAY 🎬
        </div>
        <small className="text-muted">All eyes this way!</small>
      </div>

      {/* Seat Grid Layout */}
      <div className="d-flex flex-column align-items-center mb-4">
        {rows.map((row) => (
          <div key={row} className="d-flex gap-2 mb-2 align-items-center">
            <span className="fw-bold me-2" style={{ width: '20px' }}>{row}</span>
            {cols.map((col) => {
              const seatId = `${row}${col}`;
              const isSelected = selectedSeats.includes(seatId);

              return (
                <button
                  key={seatId}
                  onClick={() => toggleSeat(seatId)}
                  className={`btn ${isSelected ? 'btn-success' : 'btn-outline-secondary'} btn-sm fw-bold`}
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
      </div>

      {/* Booking Summary Box */}
      <div className="card shadow border-0 p-4 mx-auto" style={{ maxWidth: '500px' }}>
        <h4 className="fw-bold text-center mb-3">Booking Summary</h4>
        <p><strong>Show Time:</strong> {selectedTime}</p>
        <p><strong>Selected Seats:</strong> {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}</p>
        <p><strong>Price per Ticket:</strong> LKR {ticketPrice}</p>
        <hr />
        <h4 className="fw-bold text-success d-flex justify-content-between">
          <span>Total:</span>
          <span>LKR {totalAmount}</span>
        </h4>

        <button 
           className="btn btn-primary btn-lg w-100 mt-3 fw-bold"
           disabled={selectedSeats.length === 0}
           onClick={() => navigate('/payment', {
           state: {
            movieId: id,
             selectedTime: selectedTime,
               selectedSeats: selectedSeats,
                   totalAmount: totalAmount
            }
              })}
          >
             Proceed to Pay
                </button>
      </div>
    </div>
  );
};
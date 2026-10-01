import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  movieTitle: string;
  showTime: string;
  seats: string[];
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  date: string;
}

export const MyBookings: React.FC = () => {
  const navigate = useNavigate();

  // Mock Data samples
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'BK-1001',
      movieTitle: 'Avatar: The Way of Water',
      showTime: '10:30 AM',
      seats: ['A1', 'A2', 'A3', 'A4', 'A5'],
      totalAmount: 5000,
      status: 'CONFIRMED',
      date: '2026-10-01',
    },
  ]);

  // Booking Cancel  Function 
  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        )
      );
      alert('Booking cancelled successfully!');
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">My Bookings 🎟️</h2>
        <button className="btn btn-outline-primary" onClick={() => navigate('/')}>
          + Book More Movies
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center my-5">
          <h5>No bookings found!</h5>
        </div>
      ) : (
        <div className="row g-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="col-md-6">
              <div className="card shadow-sm border-0 p-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-bold mb-0">{booking.movieTitle}</h5>
                  <span
                    className={`badge ${
                      booking.status === 'CONFIRMED' ? 'bg-success' : 'bg-danger'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <p className="mb-1 text-muted">
                  <strong>Booking ID:</strong> {booking.id}
                </p>
                <p className="mb-1">
                  <strong>Show Time:</strong> {booking.showTime} ({booking.date})
                </p>
                <p className="mb-1">
                  <strong>Seats:</strong>{' '}
                  <span className="text-primary fw-bold">
                    {booking.seats.join(', ')}
                  </span>
                </p>
                <p className="mb-3">
                  <strong>Total Paid:</strong> LKR {booking.totalAmount}
                </p>

                {booking.status === 'CONFIRMED' && (
                  <button
                    className="btn btn-outline-danger btn-sm w-100"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
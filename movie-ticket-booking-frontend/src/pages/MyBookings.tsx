import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  movieTitle: string;
  showTime: string;
  seats: string[];
  totalAmount: number;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt?: string;
  date?: string;
}

export const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);

  // when Page load get data from localStorage 
  useEffect(() => {
    const savedBookings = JSON.parse(localStorage.getItem('my_bookings') || '[]');
    
    // if no any Initial sample data show default 
    if (savedBookings.length === 0) {
      const defaultBooking: Booking[] = [
        {
          id: 'BK-1001',
          movieTitle: 'Avatar: The Way of Water',
          showTime: '10:30 AM',
          seats: ['A1', 'A2', 'A3', 'A4', 'A5'],
          totalAmount: 5000,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
        },
      ];
      setBookings(defaultBooking);
      localStorage.setItem('my_bookings', JSON.stringify(defaultBooking));
    } else {
      setBookings(savedBookings);
    }
  }, []);

  // Time-based Rule 60m Check 
  const isEligibleForCancellation = (createdAt?: string) => {
    if (!createdAt) return true; // for old sample data 
    const bookingTime = new Date(createdAt).getTime();
    const currentTime = new Date().getTime();
    const diffInMinutes = (currentTime - bookingTime) / (1000 * 60);
    return diffInMinutes <= 60; // between 60m its true
  };

  // Booking  Cancel & localStorage Update 
  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const updatedBookings = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b
      );
      setBookings(updatedBookings);
      localStorage.setItem('my_bookings', JSON.stringify(updatedBookings));
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
        <div className="text-center my-5 p-5 bg-light rounded shadow-sm">
          <h5>No bookings found in your history!</h5>
          <p className="text-muted">Book a movie ticket to see it here.</p>
        </div>
      ) : (
        <div className="row g-3">
          {bookings.map((booking) => {
            const canCancel = isEligibleForCancellation(booking.createdAt);

            return (
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
                    <strong>Show Time:</strong> {booking.showTime} {booking.date ? `(${booking.date})` : ''}
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
                    canCancel ? (
                      <button
                        className="btn btn-outline-danger btn-sm w-100"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </button>
                    ) : (
                      <button className="btn btn-secondary btn-sm w-100" disabled>
                        Cancellation Expired (Over 1 hr)
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { BookingDTO, BookingStatus } from '../types';

export const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const userId = storedUserId ? Number(storedUserId) : 1;

    setLoading(true);
    movieService.getBookingsByUserId(userId)
      .then((data) => {
        setBookings(data);
      })
      .catch(() => {
        setError('Failed to fetch bookings from backend.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const isEligibleForCancellation = (bookingTime?: string) => {
    if (!bookingTime) return true;
    const bTime = new Date(bookingTime).getTime();
    const cTime = new Date().getTime();
    const diffInMinutes = (cTime - bTime) / (1000 * 60);
    return diffInMinutes <= 60;
  };

  const handleCancelBooking = (bookingId?: number) => {
    if (!bookingId) return;
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      const updatedBookings = bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'CANCELLED' as BookingStatus } : b
      );
      setBookings(updatedBookings);
      alert('Booking cancelled successfully!');
    }
  };

  if (loading) {
    return <div className="text-center mt-5 fs-5">Loading Your Bookings...</div>;
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">My Bookings 🎟️</h2>
        <button className="btn btn-outline-primary" onClick={() => navigate('/')}>
          + Book More Movies
        </button>
      </div>

      {error && (
        <div className="alert alert-danger text-center mb-4" role="alert">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center my-5 p-5 bg-light rounded shadow-sm">
          <h5>No bookings found in your history!</h5>
          <p className="text-muted">Book a movie ticket to see it here.</p>
        </div>
      ) : (
        <div className="row g-3">
          {bookings.map((booking) => {
            const canCancel = isEligibleForCancellation(booking.bookingTime);

            return (
              <div key={booking.id} className="col-md-6">
                <div className="card shadow-sm border-0 p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="fw-bold mb-0">Booking #{booking.id}</h5>
                    <span
                      className={`badge ${
                        booking.status === 'CONFIRMED' || booking.status === 'PENDING'
                          ? 'bg-success'
                          : 'bg-danger'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <p className="mb-1 text-muted">
                    <strong>Show ID:</strong> {booking.showId}
                  </p>
                  <p className="mb-1">
                    <strong>Tickets Count:</strong> {booking.numberOfTickets}
                  </p>
                  <p className="mb-1">
                    <strong>Seats:</strong>{' '}
                    <span className="text-primary fw-bold">
                      {booking.seatNumbers ? booking.seatNumbers.join(', ') : 'N/A'}
                    </span>
                  </p>
                  <p className="mb-3">
                    <strong>Total Paid:</strong> LKR {booking.totalAmount}
                  </p>

                  {booking.status !== ('CANCELLED' as BookingStatus) && (
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
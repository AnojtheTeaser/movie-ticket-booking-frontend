import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { BookingDTO, BookingStatus, TheatreDTO, ShowDTO } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const MyBookings: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [theatresMap, setTheatresMap] = useState<Record<number, TheatreDTO>>({});
  const [showsMap, setShowsMap] = useState<Record<number, ShowDTO>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUser = localStorage.getItem('user');
    let userId = 1;

    if (storedUserId) {
      userId = Number(storedUserId);
    } else if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        userId = parsed.id || parsed.userId || 1;
      } catch {
        userId = 1;
      }
    }

    setLoading(true);

    Promise.all([
      movieService.getBookingsByUserId(userId),
      movieService.getAllShows ? movieService.getAllShows() : Promise.resolve([]),
      movieService.getAllTheatres ? movieService.getAllTheatres() : Promise.resolve([])
    ])
      .then(([bookingsData, showsData, theatresData]) => {
        setBookings(bookingsData || []);

        const sMap: Record<number, ShowDTO> = {};
        if (Array.isArray(showsData)) {
          showsData.forEach((s) => {
            const sId = s.id ?? s.showId;
            if (sId) sMap[sId] = s;
          });
        }
        setShowsMap(sMap);

        const tMap: Record<number, TheatreDTO> = {};
        if (Array.isArray(theatresData)) {
          theatresData.forEach((t) => {
            const tId = t.id ?? t.theatreId;
            if (tId) tMap[tId] = t;
          });
        }
        setTheatresMap(tMap);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setError('Failed to fetch bookings or show details from backend.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Show එකේ දිනය සහ වේලාව පසුවී (Expired වී) ඇත්දැයි බලන Function එක
  const isExpiredShow = (show?: ShowDTO | null) => {
    if (!show || !show.showDate || !show.showTime) return false;

    try {
      // YYYY-MM-DD සහ HH:mm හෝ HH:mm:ss එකතු කර Date Object එකක් සදා ගැනීම
      const showDateTimeStr = `${show.showDate}T${show.showTime}`;
      const showDateTime = new Date(showDateTimeStr).getTime();
      const currentDateTime = new Date().getTime();

      // Show Time එක දැන් වෙලාවට වඩා අඩු නම් (පසුවී ඇත්නම්) true ලබා දෙයි
      return showDateTime < currentDateTime;
    } catch {
      return false;
    }
  };

  const isEligibleForCancellation = (bookingTime?: string, status?: string) => {
    if (status === 'CONFIRMED' || status === 'CANCELLED') return false;

    if (!bookingTime) return true;
    const bTime = new Date(bookingTime).getTime();
    const cTime = new Date().getTime();
    const diffInMinutes = (cTime - bTime) / (1000 * 60);
    return diffInMinutes <= 60;
  };

  // Cancel Booking Logic using Delete API Endpoint
  const handleCancelBooking = async (bookingId?: number) => {
    if (!bookingId) return;
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await movieService.cancelBooking(bookingId);

        const updatedBookings = bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'CANCELLED' as BookingStatus } : b
        );
        setBookings(updatedBookings);
        alert('Booking cancelled successfully in Database!');
      } catch (err) {
        console.error('Error cancelling booking:', err);
        alert('Failed to cancel booking in database. Please try again.');
      }
    }
  };

  // Print Ticket Logic using PUT /api/v1/bookings/{id} Endpoint
  const handlePrintTicket = async (booking: BookingDTO) => {
    if (!booking.id) return;
    const ticketElement = document.getElementById(`ticket-print-${booking.id}`);
    if (!ticketElement) return;

    try {
      // 1. PDF එක Generate කිරීම
      const canvas = await html2canvas(ticketElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a5');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Movie_Ticket_#${booking.id}.pdf`);

      // 2. Updated Booking Object එක හදා Backend එකට PUT Request එකක් යැවීම
      const updatedBookingDTO: BookingDTO = {
        ...booking,
        status: 'CONFIRMED' as BookingStatus
      };

      await movieService.updateBooking(booking.id, updatedBookingDTO);

      // 3. Frontend UI State එක Update කිරීම
      const updatedBookings = bookings.map((b) =>
        b.id === booking.id ? { ...b, status: 'CONFIRMED' as BookingStatus } : b
      );
      setBookings(updatedBookings);

      alert('🎟️ Ticket PDF Downloaded & Booking Status set to CONFIRMED in Database!');
    } catch (err) {
      console.error('Error generating PDF or updating booking:', err);
      alert('Failed to update status in Database. Please check your backend connection.');
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted">Loading Your Bookings...</p>
      </div>
    );
  }

  // Expired නැති (ඉදිරියට පවතින) Bookings පමණක් Filter කරගැනීම
  const activeBookings = bookings.filter((booking) => {
    const currentShow = booking.showId ? showsMap[booking.showId] : null;
    return !isExpiredShow(currentShow);
  });

  return (
    <div className="container mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">My Bookings 🎟️</h2>
        <button className="btn btn-outline-primary fw-bold" onClick={() => navigate('/')}>
          + Book More Movies
        </button>
      </div>

      {error && (
        <div className="alert alert-danger text-center mb-4" role="alert">
          {error}
        </div>
      )}

      {activeBookings.length === 0 ? (
        <div className="text-center my-5 p-5 bg-light rounded shadow-sm">
          <h5>No active bookings found in your history!</h5>
          <p className="text-muted">Book a movie ticket to see it here.</p>
        </div>
      ) : (
        <div className="row g-4">
          {activeBookings.map((booking) => {
            const canCancel = isEligibleForCancellation(booking.bookingTime, booking.status);
            const currentShow = booking.showId ? showsMap[booking.showId] : null;
            const currentTheatre = currentShow?.theatreId ? theatresMap[currentShow.theatreId] : null;

            const theatreName = currentTheatre?.name || (currentShow?.theatreId ? `Theatre ${currentShow.theatreId}` : 'Main Hall');
            const showTimeStr = currentShow ? `📅 ${currentShow.showDate || ''} | ⏰ ${currentShow.showTime}` : `Show #${booking.showId}`;

            return (
              <div key={booking.id} className="col-md-6">
                <div className="card shadow-sm border-0 p-4 position-relative bg-white rounded-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0 text-dark">Booking #{booking.id}</h5>
                    <span
                      className={`badge px-3 py-2 fs-6 ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-success'
                          : booking.status === 'PENDING'
                          ? 'bg-warning text-dark'
                          : 'bg-danger'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <p className="mb-2"><strong>🏛️ Theatre Name:</strong> {theatreName}</p>
                  <p className="mb-2"><strong>⏰ Show Time:</strong> {showTimeStr}</p>
                  <p className="mb-2"><strong>🎟️ Tickets Count:</strong> {booking.numberOfTickets}</p>
                  <p className="mb-2">
                    <strong>🪑 Seats:</strong>{' '}
                    <span className="text-primary fw-bold fs-6">
                      {booking.seatNumbers ? booking.seatNumbers.join(', ') : 'N/A'}
                    </span>
                  </p>
                  <p className="mb-3 fs-5 fw-bold text-success">
                    <strong>Total Paid:</strong> LKR {booking.totalAmount}
                  </p>

                  <div className="d-flex flex-column gap-2 mt-2">
                    {/* Print Ticket Button */}
                    {booking.status !== 'CANCELLED' && (
                      <button
                        className="btn btn-primary fw-bold shadow-sm"
                        onClick={() => handlePrintTicket(booking)}
                      >
                        📄 Print Your Ticket Here (PDF)
                      </button>
                    )}

                    {/* Cancel Button Logic */}
                    {booking.status !== 'CANCELLED' && (
                      canCancel ? (
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </button>
                      ) : (
                        <button className="btn btn-light text-muted btn-sm border" disabled>
                          {booking.status === 'CONFIRMED'
                            ? '🔒 Cancellation Locked (Ticket Printed)'
                            : '⏰ Cancellation Expired (Over 1 hr)'}
                        </button>
                      )
                    )}
                  </div>

                  {/* Hidden Template for PDF Printing */}
                  <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                    <div
                      id={`ticket-print-${booking.id}`}
                      style={{
                        width: '450px',
                        padding: '25px',
                        backgroundColor: '#ffffff',
                        border: '3px dashed #0d6efd',
                        borderRadius: '12px',
                        fontFamily: 'sans-serif'
                      }}
                    >
                      <h2 style={{ textAlign: 'center', color: '#0d6efd', marginBottom: '5px' }}>🎬 MOVIE TICKET</h2>
                      <p style={{ textAlign: 'center', fontSize: '12px', color: '#6c757d', marginBottom: '20px' }}>
                        Booking ID: #{booking.id}
                      </p>
                      <hr />
                      <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
                        <p><strong>🏛️ Theatre Name:</strong> {theatreName}</p>
                        <p><strong>🎬 Show Details:</strong> {showTimeStr}</p>
                        <p><strong>🎟️ Tickets Count:</strong> {booking.numberOfTickets}</p>
                        <p><strong>🪑 Booked Seats:</strong> {booking.seatNumbers ? booking.seatNumbers.join(', ') : 'N/A'}</p>
                        <p><strong>💵 Total Paid:</strong> LKR {booking.totalAmount}</p>
                      </div>
                      <hr />
                      <p style={{ textAlign: 'center', fontSize: '11px', color: '#198754', fontWeight: 'bold' }}>
                        Status: CONFIRMED | Enjoy Your Movie! 🍿
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
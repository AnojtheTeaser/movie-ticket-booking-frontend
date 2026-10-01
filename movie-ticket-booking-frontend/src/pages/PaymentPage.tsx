import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface BookingState {
  movieId: string;
  movieTitle: string;
  selectedTime: string;
  selectedSeats: string[];
  totalAmount: number;
}

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state as BookingState;

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Seat Selection failed then back
  if (!bookingData) {
    return (
      <div className="container mt-5 text-center">
        <h4>No booking details found!</h4>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
          Go to Home
        </button>
      </div>
    );
  }

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Payment Processing Mocking 
    setTimeout(() => {
      setIsProcessing(false);

      // 1. nev Booking Object එ
      const newBooking = {
        id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        movieTitle: bookingData.movieTitle || 'Movie Ticket',
        showTime: bookingData.selectedTime,
        seats: bookingData.selectedSeats,
        totalAmount: bookingData.totalAmount,
        status: 'CONFIRMED',
        createdAt: new Date().toISOString(), // Time-based restriction
      };

      
      const existingBookings = JSON.parse(localStorage.getItem('my_bookings') || '[]');
      const updatedBookings = [newBooking, ...existingBookings];
      localStorage.setItem('my_bookings', JSON.stringify(updatedBookings));

      alert(`Payment Successful! Your tickets for ${bookingData.selectedSeats.join(', ')} are booked.`);
      navigate('/my-bookings'); 
    }, 2000);
  };

  return (
    <div className="container mt-4 mb-5">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        &larr; Back to Seats
      </button>

      <h2 className="text-center fw-bold mb-4">Payment & Confirmation 💳</h2>

      <div className="row g-4">
        {/* Booking Summary Card */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0 p-4 bg-light">
            <h4 className="fw-bold mb-3 border-bottom pb-2">Order Summary</h4>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Show Time:</span>
              <span className="fw-bold">{bookingData.selectedTime}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Seats Selected:</span>
              <span className="fw-bold text-primary">{bookingData.selectedSeats.join(', ')}</span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Number of Tickets:</span>
              <span className="fw-bold">{bookingData.selectedSeats.length}</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fs-5 fw-bold text-success">
              <span>Total Amount:</span>
              <span>LKR {bookingData.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Payment Form Card */}
        <div className="col-md-7">
          <div className="card shadow border-0 p-4">
            <h4 className="fw-bold mb-3">Enter Payment Details</h4>
            <form onSubmit={handlePayment}>
              <div className="mb-3">
                <label className="form-label">Cardholder Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="John Doe" 
                  required 
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Card Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="4532 XXXX XXXX 8900" 
                  maxLength={16}
                  required 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>

              <div className="row mb-4">
                <div className="col-6">
                  <label className="form-label">Expiry Date</label>
                  <input type="text" className="form-control" placeholder="MM/YY" required />
                </div>
                <div className="col-6">
                  <label className="form-label">CVV</label>
                  <input type="password" className="form-control" placeholder="123" maxLength={3} required />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-success btn-lg w-100 fw-bold"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing Payment...' : `Pay LKR ${bookingData.totalAmount}`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { movieService } from '../services/movieService';
import type { BookingDTO, PaymentDTO, BookingStatus, PaymentMethod, PaymentStatus } from '../types';

interface BookingState {
  movieId: string;
  showId: number;
  movieTitle?: string;
  selectedDate?: string;
  selectedTime: string;
  selectedSeats: string[];
  ticketPrice: number;
  totalAmount: number;
}

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state as BookingState;

  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!bookingData) {
    return (
      <div className="container mt-5 text-center">
        <h4 className="text-danger fw-bold">No booking details found!</h4>
        <p className="text-muted">Please select your seats first.</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>
          Go to Home
        </button>
      </div>
    );
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Get User ID safely from LocalStorage
      let userId = 1;
      const storedUserId = localStorage.getItem('userId');
      const storedUser = localStorage.getItem('user');

      if (storedUserId) {
        userId = Number(storedUserId);
      } else if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser.id || parsedUser.userId || 1;
        } catch {
          userId = 1;
        }
      }

      // 1. Create Booking in Backend
      const newBookingData: BookingDTO = {
        userId: userId,
        showId: Number(bookingData.showId),
        seatNumbers: bookingData.selectedSeats,
        numberOfTickets: bookingData.selectedSeats.length,
        totalAmount: bookingData.totalAmount,
        status: 'PENDING' as BookingStatus
      };

      console.log("Sending Booking Data:", newBookingData);
      const bookingResponse = await movieService.createBooking(newBookingData);
      console.log("Booking Response from Backend:", bookingResponse);

      // Handle both `id` and `bookingId` dynamically
      const createdBookingId = bookingResponse?.id ?? bookingResponse?.bookingId;

      if (createdBookingId) {
        // 2. Process Payment in Backend
        const paymentData: PaymentDTO = {
          bookingId: createdBookingId,
          amount: bookingData.totalAmount,
          paymentMethod: 'CARD' as PaymentMethod,
          status: 'COMPLETED' as PaymentStatus
        };

        console.log("Sending Payment Data:", paymentData);
        await movieService.processPayment(paymentData);

        alert(`🎉 Payment Successful! Your tickets for seats [${bookingData.selectedSeats.join(', ')}] have been booked.`);
        navigate('/my-bookings');
      } else {
        setErrorMessage('Failed to create booking. Invalid ID returned from backend.');
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setErrorMessage(
        err.response?.data?.message || 
        'Payment processing failed. Please check backend network connection or inputs.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <button className="btn btn-outline-secondary mb-3" onClick={() => navigate(-1)}>
        &larr; Back to Seats
      </button>

      <h2 className="text-center fw-bold mb-4">Payment & Confirmation 💳</h2>

      {errorMessage && (
        <div className="alert alert-danger text-center shadow-sm" role="alert">
          {errorMessage}
        </div>
      )}

      <div className="row g-4">
        {/* Booking Summary Card */}
        <div className="col-md-5">
          <div className="card shadow-sm border-0 p-4 bg-light">
            <h4 className="fw-bold mb-3 border-bottom pb-2">Order Summary</h4>
            {bookingData.selectedDate && (
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Show Date:</span>
                <span className="fw-bold">{bookingData.selectedDate}</span>
              </div>
            )}
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
                className="btn btn-success btn-lg w-100 fw-bold shadow"
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
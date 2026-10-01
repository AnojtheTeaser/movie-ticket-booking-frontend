import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MovieList } from './pages/MovieList';
import { MovieDetails } from './pages/MovieDetails';
import { SeatSelection } from './pages/SeatSelection';
import { PaymentPage } from './pages/PaymentPage';
import { MyBookings } from './pages/MyBookings';
import { AdminDashboard } from './pages/AdminDashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        {/* Navigation Bar */}
        <Navbar />
        
        <Routes>
          {/* Main Movie List Page */}
          <Route path="/" element={<MovieList />} />

          {/* Auth Pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Booking System Flow Pages */}
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/movies/:id/seats" element={<SeatSelection />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/my-bookings" element={<MyBookings />} />

          {/* Admin Management Page */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Redirect unknown routes to Home (Must be at the bottom) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
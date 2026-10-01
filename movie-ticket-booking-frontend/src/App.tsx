import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Simple Home Placeholder Component
const Home: React.FC = () => {
  return (
    <div className="container mt-5 text-center">
      <h2>Welcome to Movie Ticket Booking System</h2>
      <p className="lead">You are successfully logged in!</p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Default Route */}
          <Route path="/" element={<Home />} />

          {/* Redirect unknown routes to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Slots from './pages/Slots';
import Booking from './pages/Booking';
import Receipt from './pages/Receipt';
import AdminAnalytics from './pages/AdminAnalytics';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/slots" element={<Slots />} />
      <Route path="/booking/:slotId" element={<Booking />} />
      <Route path="/receipt/:bookingId" element={<Receipt />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />


      {/* ✅ ADMIN PROTECTED ROUTE */}
      <Route
        path="/admin/analytics"
        element={
          user?.role === 'admin'
            ? <AdminAnalytics />
            : <Navigate to="/" replace />
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
          <Navbar />
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

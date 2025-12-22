import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaUser,
  FaSignOutAlt,
  FaCalendarAlt,
  FaChartLine
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-lg sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <FaCalendarAlt className="text-primary-600 text-2xl animate-float" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              Cricket Turf
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Welcome */}
                <span className="flex items-center space-x-2 text-gray-700">
                  <FaUser className="text-primary-500" />
                  <span>Welcome, {user.name}</span>
                </span>

                {/* ✅ ADMIN LINK (ONLY FOR ADMIN) */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin/analytics"
                    className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    <FaChartLine />
                    <span>AI Dashboard</span>
                  </Link>
                )}

                {/* Book Slot */}
                <Link to="/slots" className="btn-primary text-sm">
                  Book Slot
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-primary-600 hover:text-primary-700">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCalendarCheck,
  FaCreditCard,
  FaReceipt,
  FaTrophy,
  FaTimes
} from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const features = [
    {
      icon: <FaCalendarCheck className="text-4xl text-primary-500" />,
      title: 'Check Available Slots',
      description: 'View real-time availability for any date'
    },
    {
      icon: <FaCreditCard className="text-4xl text-secondary-500" />,
      title: 'Easy Booking & Payment',
      description: 'Secure and quick payment processing'
    },
    {
      icon: <FaReceipt className="text-4xl text-green-500" />,
      title: 'Instant Receipt',
      description: 'Get your booking confirmation immediately'
    }
  ];

  const handleContinue = () => {
    if (!selectedDate) return;
    setShowCalendar(false);
    navigate(`/slots?date=${selectedDate}`);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Book Your Cricket Turf
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Experience seamless booking for box cricket turf. Check availability,
          book instantly, and play!
        </p>

        <button
          onClick={() => setShowCalendar(true)}
          className="btn-primary inline-flex items-center text-lg"
        >
          <FaTrophy className="mr-2" />
          Book Now
        </button>
      </motion.div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.15 }}
            whileHover={{ scale: 1.05 }}
            className="card text-center"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm relative"
            >
              <button
                onClick={() => setShowCalendar(false)}
                className="absolute top-3 right-3 text-gray-500"
              >
                <FaTimes />
              </button>

              <h3 className="text-2xl font-bold mb-4 text-center">
                Select Booking Date
              </h3>

              <input
                type="date"
                min={today}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border rounded-lg p-3 mb-4"
              />

              <button
                onClick={handleContinue}
                disabled={!selectedDate}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;

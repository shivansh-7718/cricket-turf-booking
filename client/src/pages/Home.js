import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCalendarCheck, FaCreditCard, FaReceipt, FaTrophy } from 'react-icons/fa';

const Home = () => {
  const features = [
    {
      icon: <FaCalendarCheck className="text-4xl text-primary-500" />,
      title: "Check Available Slots",
      description: "View real-time availability for today's cricket turf slots"
    },
    {
      icon: <FaCreditCard className="text-4xl text-secondary-500" />,
      title: "Easy Booking & Payment",
      description: "Secure and quick payment processing"
    },
    {
      icon: <FaReceipt className="text-4xl text-green-500" />,
      title: "Instant Receipt",
      description: "Get your booking confirmation immediately"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
          Book Your Cricket Turf
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Experience seamless booking for box cricket turf. Check availability, book instantly, and play!
        </p>
        <Link to="/slots" className="btn-primary inline-flex items-center text-lg">
          <FaTrophy className="mr-2" />
          Book Now
        </Link>
      </motion.div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="card text-center"
          >
            <div className="mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {['Sign Up', 'Check Slots', 'Make Payment', 'Get Receipt'].map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                {index + 1}
              </div>
              <h3 className="font-semibold">{step}</h3>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
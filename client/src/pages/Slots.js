import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaClock, FaRupeeSign, FaArrowRight } from 'react-icons/fa';

const Slots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await axios.get('https://cricket-turf-booking.onrender.com/api/slots/today');
      // Filter out any slots with invalid time data
      const validSlots = response.data.filter(slot => 
        slot.startTime && slot.endTime && 
        !slot.startTime.includes('0.000') && 
        !slot.startTime.includes('/hour')
      );
      setSlots(validSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = (slot) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Save slots to sessionStorage as fallback
    sessionStorage.setItem('availableSlots', JSON.stringify(slots));
    
    // Pass the ENTIRE slot object to booking page
    navigate(`/booking/${slot._id}`, {
      state: {
        slotData: slot
      }
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading available slots...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 pb-20">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center mb-8 text-gray-800"
      >
        Available Slots for Today
      </motion.h1>
      
      {slots.length > 0 ? (
        <>
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Found <span className="font-semibold text-primary-600">{slots.length}</span> available slot{slots.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot, index) => (
              <motion.div
                key={slot._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                className="bg-white rounded-xl shadow-lg p-6 relative overflow-hidden group border border-gray-200 hover:border-primary-500 transition-colors"
              >
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg font-semibold text-sm">
                  Available
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-primary-500 text-lg" />
                      <span className="text-2xl font-bold text-gray-800">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                      {slot.duration || '1 hour'}
                    </span>
                  </div>
                  
                  {/* Optional: Show 24-hour format in a subtle way */}
                  {slot.startTime24 && slot.endTime24 && (
                    <div className="mt-1 text-sm text-gray-500">
                      ({slot.startTime24} - {slot.endTime24})
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <FaRupeeSign className="text-green-600 text-lg" />
                    <span className="text-xl font-semibold text-gray-800">₹{slot.price}/hour</span>
                  </div>
                  <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded">
                    Total: ₹{slot.price}
                  </div>
                </div>
                
                <button
                  onClick={() => handleBookSlot(slot)}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center group"
                >
                  Book Now
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🏏</div>
          <h3 className="text-2xl font-semibold mb-2 text-gray-800">No slots available</h3>
          <p className="text-gray-600 mb-6">All slots for today are booked. Please check back tomorrow!</p>
          <button
            onClick={fetchSlots}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg font-medium transition-colors"
          >
            Refresh Slots
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Slots;
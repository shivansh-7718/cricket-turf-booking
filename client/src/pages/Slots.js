import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaClock, FaRupeeSign, FaArrowRight } from 'react-icons/fa';

const Slots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedDate = searchParams.get('date'); // 👈 IMPORTANT

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line
  }, [selectedDate]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const url = selectedDate
        ? `https://cricket-turf-booking-production.up.railway.app/api/slots/by-date?date=${selectedDate}`
        : `https://cricket-turf-booking-production.up.railway.app/api/slots/today`;

      const response = await axios.get(url);

      const validSlots = response.data.filter(
        slot =>
          slot.startTime &&
          slot.endTime &&
          !slot.startTime.includes('0.000') &&
          !slot.startTime.includes('/hour')
      );

      setSlots(validSlots);
    } catch (error) {
      console.error('❌ Error fetching slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = (slot) => {
    if (!user) {
      navigate('/login');
      return;
    }

    sessionStorage.setItem('availableSlots', JSON.stringify(slots));

    navigate(`/booking/${slot._id}`, {
      state: { slotData: slot }
    });
  };

  const formattedDate = selectedDate
    ? new Date(selectedDate).toDateString()
    : 'Today';

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
        Available Slots for {formattedDate}
      </motion.h1>

      {slots.length > 0 ? (
        <>
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Found{' '}
              <span className="font-semibold text-primary-600">
                {slots.length}
              </span>{' '}
              available slot{slots.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot, index) => (
              <motion.div
                key={slot._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{
                  scale: 1.03,
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                }}
                className="bg-white rounded-xl shadow-lg p-6 relative border border-gray-200 hover:border-primary-500"
              >
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg text-sm font-semibold">
                  Available
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <FaClock className="text-primary-500" />
                      <span className="text-xl font-bold">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {slot.duration || '1 hour'}
                    </span>
                  </div>

                  {slot.startTime24 && (
                    <div className="text-sm text-gray-500">
                      ({slot.startTime24} - {slot.endTime24})
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-2">
                    <FaRupeeSign className="text-green-600" />
                    <span className="text-lg font-semibold">
                      ₹{slot.price}/hour
                    </span>
                  </div>
                  <div className="bg-gray-100 text-sm px-3 py-1 rounded">
                    Total: ₹{slot.price}
                  </div>
                </div>

                <button
                  onClick={() => handleBookSlot(slot)}
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 flex justify-center items-center"
                >
                  Book Now
                  <FaArrowRight className="ml-2" />
                </button>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏏</div>
          <h3 className="text-2xl font-semibold mb-2">
            No slots available
          </h3>
          <p className="text-gray-600 mb-6">
            All slots for this date are booked.
          </p>
        </div>
      )}
    </div>
  );
};

export default Slots;

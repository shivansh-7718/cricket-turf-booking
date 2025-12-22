import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaLock, FaCheck, FaClock, FaCalendar, FaUser } from 'react-icons/fa';

const Booking = () => {
  const { slotId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [slot, setSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (location.state?.slotData) {
      setSlot(location.state.slotData);
      setLoading(false);
    } else {
      fetchSlotDetails();
    }
  }, [slotId, location.state]);

  const fetchSlotDetails = async () => {
    try {
      const response = await axios.get(`https://cricket-turf-booking.onrender.com/api/slots/${slotId}`);
      setSlot(response.data);
    } catch (error) {
      console.error('Error fetching slot details:', error);
      const savedSlots = JSON.parse(sessionStorage.getItem('availableSlots') || '[]');
      const foundSlot = savedSlots.find(s => s._id === slotId);
      if (foundSlot) {
        setSlot(foundSlot);
      } else {
        alert('Slot not found.');
        navigate('/slots');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    try {
      setProcessing(true);

      // 1. Create Razorpay order
      const { data: order } = await axios.post(
        'https://cricket-turf-booking.onrender.com/api/payments/create-order',
        { amount: slot.price }
      );

      // 2. Razorpay checkout options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Cricket Turf Booking",
        description: "Slot Booking Payment",
        order_id: order.id,

        handler: async function (response) {
          // 3. Verify payment
          const { data } = await axios.post(
            'https://cricket-turf-booking.onrender.com/api/payments/verify',
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: user.id,
              slotId: slotId
            }
          );

          localStorage.setItem('lastBooking', JSON.stringify(data.booking));

          navigate(`/receipt/${data.booking._id}`, {
            state: { booking: data.booking }
          });
        },

        prefill: {
          name: user.name,
          email: user.email
        },

        theme: {
          color: "#16a34a"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading booking details...</p>
      </div>
    );
  }

  if (!slot) return null;

  const formatBookingDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="md:flex">
          {/* Booking Summary */}
          <div className="md:w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white">
            <h2 className="text-3xl font-bold mb-6">Booking Summary</h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <FaClock className="mt-1 mr-3" />
                <div>
                  <h3 className="text-sm opacity-80">TIMING</h3>
                  <p className="text-2xl font-bold">
                    {slot.startTime} - {slot.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FaCalendar className="mt-1 mr-3" />
                <div>
                  <h3 className="text-sm opacity-80">DATE</h3>
                  <p className="text-2xl font-bold">
                    {formatBookingDate(slot.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <FaUser className="mt-1 mr-3" />
                <div>
                  <h3 className="text-sm opacity-80">BOOKED BY</h3>
                  <p className="text-xl">{user?.name}</p>
                  <p className="opacity-80">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex justify-between text-xl">
                <span>Total Amount</span>
                <span className="font-bold">₹{slot.price}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="md:w-1/2 p-8 flex flex-col justify-center">
            <div className="flex items-center justify-center mb-6">
              <FaLock className="text-green-500 text-2xl mr-2" />
              <span className="text-lg font-semibold">Secure Payment</span>
            </div>

            <motion.button
              onClick={handlePayment}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={processing}
              className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center text-lg"
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  Pay ₹{slot.price}
                  <FaCheck className="ml-2" />
                </>
              )}
            </motion.button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Payment is securely handled by Razorpay
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Booking;

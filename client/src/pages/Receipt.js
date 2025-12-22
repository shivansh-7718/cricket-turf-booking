import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  FaPrint,
  FaDownload,
  FaCheckCircle,
  FaCalendar,
  FaClock,
  FaRupeeSign,
  FaUser,
  FaReceipt
} from 'react-icons/fa';

const Receipt = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const getBookingData = () => {
      if (location.state?.booking) return location.state.booking;

      const savedBooking = localStorage.getItem('lastBooking');
      if (savedBooking) {
        const parsed = JSON.parse(savedBooking);
        if (parsed._id === bookingId || parsed.bookingId === bookingId) {
          return parsed;
        }
      }

      return null;
    };

    const bookingData = getBookingData();

    if (bookingData) {
      setBooking(bookingData);
    }
    setLoading(false);
  }, [bookingId, location.state]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    const receiptContent = `
CRICKET TURF - BOOKING RECEIPT

Booking ID: ${booking?._id || booking?.bookingId}
Date: ${booking?.date || booking?.slot?.date}
Time: ${booking?.startTime || booking?.slot?.startTime} - ${booking?.endTime || booking?.slot?.endTime}
Amount: ₹${booking?.amount || booking?.slot?.price}
Payment Status: ${booking?.paymentStatus}
Booked By: ${user?.name}
Email: ${user?.email}
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CricketTurf_Receipt_${bookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Generating your receipt...</p>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="receipt-print-wrapper container mx-auto px-4 py-12 max-w-2xl">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="receipt-card bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center text-white">
          <FaCheckCircle className="text-6xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Booking Confirmed!</h1>
          <p className="opacity-90">Your slot has been successfully booked</p>
        </div>

        {/* Details */}
        <div className="p-8 space-y-6">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
              <FaReceipt className="inline mr-2" />
              Booking ID: {booking._id || booking.bookingId}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center bg-gray-50 p-4 rounded-lg">
              <FaCalendar className="text-primary-500 mr-3 text-xl" />
              <div>
                <div className="text-sm text-gray-600">Date</div>
                <div className="font-semibold">{formatDate(booking.date || booking.slot?.date)}</div>
              </div>
            </div>

            <div className="flex items-center bg-gray-50 p-4 rounded-lg">
              <FaClock className="text-primary-500 mr-3 text-xl" />
              <div>
                <div className="text-sm text-gray-600">Time Slot</div>
                <div className="font-semibold">
                  {booking.startTime || booking.slot?.startTime} - {booking.endTime || booking.slot?.endTime}
                </div>
              </div>
            </div>

            <div className="flex items-center bg-gray-50 p-4 rounded-lg">
              <FaUser className="text-blue-500 mr-3 text-xl" />
              <div>
                <div className="text-sm text-gray-600">Booked By</div>
                <div className="font-semibold">{user?.name}</div>
                <div className="text-sm text-gray-500">{user?.email}</div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center">
                <FaRupeeSign className="text-green-500 mr-3 text-xl" />
                <div>
                  <div className="text-sm text-gray-600">Amount Paid</div>
                  <div className="font-semibold">₹{booking.amount || booking.slot?.price}</div>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                {booking.paymentStatus || 'completed'}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3 text-lg">Important Notes</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Please arrive 15 minutes before your scheduled time</li>
              <li>• Bring your ID proof for verification</li>
              <li>• Cancellation: 50% refund if cancelled 24 hours before</li>
              <li>• Keep this receipt for reference</li>
            </ul>
          </div>
        </div>

        {/* Actions (hidden in print) */}
        <div className="bg-gray-50 p-6 border-t flex gap-4">
          <button
            onClick={handlePrint}
            className="flex-1 bg-white border py-3 rounded-lg font-semibold"
          >
            <FaPrint className="inline mr-2" />
            Print
          </button>

          <button
            onClick={handleDownloadPDF}
            className="flex-1 bg-white border py-3 rounded-lg font-semibold"
          >
            <FaDownload className="inline mr-2" />
            Download
          </button>

          <Link
            to="/slots"
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold text-center"
          >
            Book Again
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Receipt;

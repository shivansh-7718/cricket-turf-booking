import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  FaChartLine,
  FaClock,
  FaFire,
  FaRupeeSign,
  FaRobot
} from 'react-icons/fa';

const AdminAnalytics = () => {
  const [peakHours, setPeakHours] = useState([]);
  const [slotUtilization, setSlotUtilization] = useState({});
  const [revenue, setRevenue] = useState({ totalRevenue: 0, avgRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [peakRes, slotRes, revenueRes] = await Promise.all([
          axios.get('https://cricket-turf-booking.onrender.com/api/admin/analytics/peak-hours'),
          axios.get('https://cricket-turf-booking.onrender.com/api/admin/analytics/slot-utilization'),
          axios.get('https://cricket-turf-booking.onrender.com/api/admin/analytics/revenue')
        ]);

        setPeakHours(peakRes.data);
        setSlotUtilization(slotRes.data);
        setRevenue(revenueRes.data);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const generateAISuggestion = () => {
    if (!peakHours.length) return 'Not enough data to generate insights yet.';

    const [topHour, count] = peakHours[0];

    if (count > 5) {
      return `High demand detected for ${topHour}. Consider increasing prices or adding extra availability.`;
    }

    return `Demand is evenly distributed. Current pricing strategy is optimal.`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-10 flex items-center"
      >
        <FaChartLine className="mr-3 text-primary-600" />
        AI Analytics Dashboard
      </motion.h1>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* Peak Hours */}
        <motion.div className="bg-white shadow-xl rounded-xl p-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <FaClock className="mr-2 text-blue-500" />
            Peak Booking Hours
          </h2>
          {peakHours.map(([hour, count]) => (
            <div key={hour} className="flex justify-between py-2 border-b">
              <span>{hour}</span>
              <span className="font-semibold">{count} bookings</span>
            </div>
          ))}
        </motion.div>

        {/* Slot Utilization */}
        <motion.div className="bg-white shadow-xl rounded-xl p-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <FaFire className="mr-2 text-red-500" />
            Slot Utilization
          </h2>
          {Object.entries(slotUtilization).map(([slot, count]) => (
            <div key={slot} className="flex justify-between py-2 border-b">
              <span>{slot}</span>
              <span className="font-semibold">{count} uses</span>
            </div>
          ))}
        </motion.div>

        {/* Revenue */}
        <motion.div className="bg-white shadow-xl rounded-xl p-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <FaRupeeSign className="mr-2 text-green-500" />
            Revenue Overview
          </h2>
          <p className="text-lg mb-2">
            <strong>Total Revenue:</strong> ₹{revenue.totalRevenue}
          </p>
          <p className="text-lg">
            <strong>Average Per Booking:</strong> ₹{Math.round(revenue.avgRevenue)}
          </p>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-xl rounded-xl p-6">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <FaRobot className="mr-2" />
            AI Insight
          </h2>
          <p className="text-lg">{generateAISuggestion()}</p>
        </motion.div>

      </div>
    </div>
  );
};

export default AdminAnalytics;

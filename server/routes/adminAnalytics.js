const express = require('express');
const Booking = require('../models/Booking');
const auth = require('../middleware/authMiddleware'); // ✅ ADD THIS
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

/* SLOT UTILIZATION */
router.get('/slot-utilization', auth, isAdmin, async (req, res) => {
  const bookings = await Booking.find();
  const slotCount = {};

  bookings.forEach(b => {
    const key = `${b.startTime}-${b.endTime}`;
    slotCount[key] = (slotCount[key] || 0) + 1;
  });

  res.json(slotCount);
});

/* PEAK HOURS */
router.get('/peak-hours', auth, isAdmin, async (req, res) => {
  const bookings = await Booking.find();
  const hourMap = {};

  bookings.forEach(b => {
    hourMap[b.startTime] = (hourMap[b.startTime] || 0) + 1;
  });

  const sorted = Object.entries(hourMap).sort((a, b) => b[1] - a[1]);
  res.json(sorted.slice(0, 3));
});

/* REVENUE */
router.get('/revenue', auth, isAdmin, async (req, res) => {
  const bookings = await Booking.find({ paymentStatus: 'completed' });

  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const avgRevenue = totalRevenue / (bookings.length || 1);

  res.json({ totalRevenue, avgRevenue });
});

module.exports = router;

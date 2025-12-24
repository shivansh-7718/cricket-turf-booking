import express from 'express';

import Booking from '../models/Booking.js';
import auth from '../middleware/authMiddleware.js';
import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

/* ============================
   SLOT UTILIZATION
============================ */
router.get('/slot-utilization', auth, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find();
    const slotCount = {};

    bookings.forEach(b => {
      const key = `${b.startTime}-${b.endTime}`;
      slotCount[key] = (slotCount[key] || 0) + 1;
    });

    res.json(slotCount);
  } catch (err) {
    console.error('❌ Slot utilization error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================
   PEAK HOURS
============================ */
router.get('/peak-hours', auth, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find();
    const hourMap = {};

    bookings.forEach(b => {
      hourMap[b.startTime] = (hourMap[b.startTime] || 0) + 1;
    });

    const sorted = Object.entries(hourMap).sort((a, b) => b[1] - a[1]);
    res.json(sorted.slice(0, 3));
  } catch (err) {
    console.error('❌ Peak hours error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ============================
   REVENUE
============================ */
router.get('/revenue', auth, isAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find({ paymentStatus: 'completed' });

    const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
    const avgRevenue = totalRevenue / (bookings.length || 1);

    res.json({ totalRevenue, avgRevenue });
  } catch (err) {
    console.error('❌ Revenue error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

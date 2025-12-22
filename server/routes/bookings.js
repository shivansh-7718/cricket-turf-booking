const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const sendEmail = require('../utils/sendEmail'); // ✅ STEP 4 ADDITION

// Create booking
router.post('/create', async (req, res) => {
  try {
    const { userId, slotId, paymentId, userData } = req.body;

    console.log(`Booking request: userId=${userId}, slotId=${slotId}`);

    // Find the slot
    const slot = await Slot.findById(slotId);
    if (!slot) {
      console.log('Slot not found:', slotId);
      return res.status(404).json({ error: 'Slot not found' });
    }

    if (slot.isBooked) {
      console.log('Slot already booked:', slotId);
      return res.status(400).json({ error: 'Slot already booked' });
    }

    // Generate unique booking ID
    const bookingId =
      'BK' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Create booking
    const booking = new Booking({
      bookingId,
      user: userId,
      slot: slotId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      amount: slot.price,
      paymentStatus: 'completed',
      paymentId: paymentId || 'demo_payment_' + Date.now()
    });

    await booking.save();

    // Update slot status
    slot.isBooked = true;
    slot.bookedBy = userId;
    slot.bookingId = bookingId;
    await slot.save();

    console.log(`✅ Booking created: ${bookingId}`);

    /* =======================
       📧 STEP 4: SEND EMAIL
       ======================= */
    if (userData?.email) {
      await sendEmail({
        to: userData.email,
        subject: '✅ Cricket Turf Booking Confirmed',
        html: `
          <h2>Booking Confirmed 🏏</h2>
          <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
          <p><strong>Date:</strong> ${new Date(slot.date).toDateString()}</p>
          <p><strong>Time:</strong> ${slot.startTime} - ${slot.endTime}</p>
          <p><strong>Amount Paid:</strong> ₹${booking.amount}</p>
          <br/>
          <p>Please arrive 15 minutes before your slot.</p>
          <p>Thank you for booking with us!</p>
        `
      });
    }

    // Return data in the format expected by frontend
    res.json({
      _id: booking._id,
      bookingId: booking.bookingId,
      user: userData || {
        name: 'User',
        email: 'user@example.com'
      },
      slot: {
        startTime: slot.startTime,
        endTime: slot.endTime,
        date: slot.date,
        price: slot.price,
        duration: slot.duration || '1 hour',
        startTime24: slot.startTime24,
        endTime24: slot.endTime24
      },
      amount: booking.amount,
      paymentStatus: booking.paymentStatus,
      paymentId: booking.paymentId,
      createdAt: booking.createdAt || new Date(),
      date: booking.date
    });
  } catch (err) {
    console.error('❌ Booking error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get user bookings
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.params.userId })
      .populate('slot', 'startTime endTime date')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Bookings API is working!' });
});

module.exports = router;

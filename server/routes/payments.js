const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const User = require('../models/User'); // ✅ ADD
const sendEmail = require('../utils/sendEmail'); // ✅ ADD

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
router.post('/create-order', async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // in paise
    currency: 'INR',
    receipt: 'rcpt_' + Date.now()
  };

  const order = await razorpay.orders.create(options);
  res.json(order);
});

// Verify payment and create booking
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      slotId
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const slot = await Slot.findById(slotId);
    if (!slot || slot.isBooked) {
      return res.status(400).json({ error: 'Slot unavailable' });
    }

    const bookingId = 'BK' + Date.now();

    const booking = new Booking({
      bookingId,
      user: userId,
      slot: slotId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      amount: slot.price,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      paymentStatus: 'completed'
    });

    await booking.save();

    slot.isBooked = true;
    slot.bookingId = bookingId;
    await slot.save();

    /* ============================
       📧 EMAIL CONFIRMATION (NEW)
       ============================ */
    const user = await User.findById(userId);

    if (user?.email) {
      await sendEmail({
        to: user.email,
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

      console.log('📧 Confirmation email sent to:', user.email);
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error('❌ Payment verification error:', err);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

module.exports = router;

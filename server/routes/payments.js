
import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';
import Slot from '../models/Slot.js';
import User from '../models/User.js';
import sendEmail from '../utils/sendEmail.js';

const router = express.Router();

let razorpay = null;

const getRazorpayClient = () => {
  if (!razorpay) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('RAZORPAY keys missing');
    }

    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });
  }

  return razorpay;
};

/* =======================
   CREATE ORDER
   ======================= */
router.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    const razorpayClient = getRazorpayClient();

    const order = await razorpayClient.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: 'rcpt_' + Date.now()
    });

    res.json(order);
  } catch (err) {
    console.error('❌ Create order error:', err.message);
    res.status(500).json({ error: 'Order creation failed' });
  }
});

/* =======================
   VERIFY PAYMENT
======================= */
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      slotId
    } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
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

    const booking = await Booking.create({
      bookingId,
      user: userId,
      slot: slotId,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      amount: slot.price,
      paymentStatus: 'completed',
      paymentId: razorpay_payment_id
    });

    slot.isBooked = true;
    slot.bookingId = bookingId;
    await slot.save();

    /* ✅ SEND RESPONSE IMMEDIATELY */
    res.json({ success: true, booking });

    /* ==========================
       🔥 BACKGROUND TASKS
       ========================== */
    setImmediate(async () => {
      try {
        const user = await User.findById(userId);
        if (!user?.email) return;

        await sendEmail({
          to: user.email,
          subject: '✅ Cricket Turf Booking Confirmed',
          html: `
            <h2>Booking Confirmed 🏏</h2>
            <p><strong>Booking ID:</strong> ${booking.bookingId}</p>
            <p><strong>Date:</strong> ${new Date(slot.date).toDateString()}</p>
            <p><strong>Time:</strong> ${slot.startTime} - ${slot.endTime}</p>
            <p><strong>Amount Paid:</strong> ₹${booking.amount}</p>
          `
        });
      } catch (err) {
        console.error('❌ Background email error:', err.message);
      }
    });

  } catch (err) {
    console.error('❌ Verify error:', err.message);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

  
export default router;
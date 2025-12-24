import dotenv from 'dotenv';

// Load env variables
dotenv.config();


import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Mongoose 9+)
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️ Running in demo mode without database');
  });

// Routes (ESM imports)
import authRoutes from './routes/auth.js';
import slotRoutes from './routes/slots.js';
import bookingRoutes from './routes/bookings.js';
import paymentRoutes from './routes/payments.js';
import adminAnalyticsRoutes from './routes/adminAnalytics.js';

app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});


console.log("RESEND KEY:", process.env.RESEND_API_KEY);

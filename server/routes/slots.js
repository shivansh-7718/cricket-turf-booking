import express from 'express';
import Slot from '../models/Slot.js';

const router = express.Router();

/* ---------------- HELPER FUNCTIONS ---------------- */

// Convert 24-hour to 12-hour format
const formatTo12Hour = (time24) => {
  if (!time24 || time24 === '00:00') return '12:00 AM';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Check & refresh old slots
const shouldRefreshSlots = async (date) => {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);

  const oldSlots = await Slot.find({
    date: { $lt: yesterday },
    isBooked: true,
  });

  if (oldSlots.length > 0) {
    await Slot.updateMany(
      { date: { $lt: yesterday }, isBooked: true },
      {
        $set: {
          isBooked: false,
          bookedBy: null,
          bookingId: null,
        },
      }
    );
    console.log(`♻️ Reset ${oldSlots.length} old booked slots`);
  }

  const weekAgo = new Date(date);
  weekAgo.setDate(weekAgo.getDate() - 7);
  await Slot.deleteMany({ date: { $lt: weekAgo } });
};

/* ---------------- ROUTES ---------------- */

router.get('/by-date', async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const selectedDate = new Date(date);
    if (isNaN(selectedDate)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    selectedDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = selectedDate.getTime() === today.getTime();

    if (isToday) {
      await shouldRefreshSlots(selectedDate);
    }

    let slots = await Slot.find({
      date: { $gte: selectedDate, $lt: nextDay }
    });

    if (slots.length === 0) {
      const newSlots = [];

      for (let hour = 8; hour < 22; hour++) {
        const startTime24 = `${hour.toString().padStart(2, '0')}:00`;
        const endTime24 = `${(hour + 1).toString().padStart(2, '0')}:00`;

        let price = 800;
        if (hour >= 12 && hour < 16) price = 1000;
        if (hour >= 16 && hour < 20) price = 1200;
        if (hour >= 20) price = 1500;

        newSlots.push({
          date: new Date(selectedDate),
          startTime: formatTo12Hour(startTime24),
          endTime: formatTo12Hour(endTime24),
          startTime24,
          endTime24,
          price,
          isBooked: false
        });
      }

      slots = await Slot.insertMany(newSlots);
    }

    const availableSlots = slots
      .filter(s => !s.isBooked)
      .map(s => ({
        _id: s._id,
        date: s.date,
        startTime: s.startTime,
        endTime: s.endTime,
        startTime24: s.startTime24,
        endTime24: s.endTime24,
        price: s.price,
        duration: '1 hour'
      }))
      .sort((a, b) => a.startTime24.localeCompare(b.startTime24));

    res.json(availableSlots);

  } catch (err) {
    console.error('❌ by-date error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Get today's available slots
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await shouldRefreshSlots(today);

    let slots = await Slot.find({
      date: { $gte: today, $lt: tomorrow },
    });

    if (slots.length === 0) {
      console.log('🆕 Creating fresh 1-hour slots');

      const newSlots = [];
      for (let hour = 8; hour < 22; hour++) {
        const startTime24 = `${hour.toString().padStart(2, '0')}:00`;
        const endTime24 = `${(hour + 1).toString().padStart(2, '0')}:00`;

        const startTime12 = formatTo12Hour(startTime24);
        const endTime12 = formatTo12Hour(endTime24);

        let price = 800;
        if (hour >= 12 && hour < 16) price = 1000;
        if (hour >= 16 && hour < 20) price = 1200;
        if (hour >= 20) price = 1500;

        newSlots.push({
          date: new Date(today),
          startTime: startTime12,
          endTime: endTime12,
          startTime24,
          endTime24,
          price,
          isBooked: false,
        });
      }

      slots = await Slot.insertMany(newSlots);
    }

    const availableSlots = slots
      .filter((slot) => !slot.isBooked)
      .map((slot) => ({
        _id: slot._id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        startTime24: slot.startTime24,
        endTime24: slot.endTime24,
        price: slot.price,
        isBooked: slot.isBooked,
        duration: '1 hour',
      }))
      .sort((a, b) => a.startTime24.localeCompare(b.startTime24));

    res.json(availableSlots);
  } catch (err) {
    console.error('❌ Error fetching slots:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reset & recreate slots
router.post('/reset-and-recreate', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Slot.deleteMany({ date: { $gte: today, $lt: tomorrow } });

    const newSlots = [];
    for (let hour = 8; hour < 22; hour++) {
      const startTime24 = `${hour.toString().padStart(2, '0')}:00`;
      const endTime24 = `${(hour + 1).toString().padStart(2, '0')}:00`;

      newSlots.push({
        date: new Date(today),
        startTime: formatTo12Hour(startTime24),
        endTime: formatTo12Hour(endTime24),
        startTime24,
        endTime24,
        price: 800,
        isBooked: false,
      });
    }

    await Slot.insertMany(newSlots);

    res.json({ message: 'Slots recreated successfully', count: newSlots.length });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all slots (admin)
router.get('/all', async (req, res) => {
  const slots = await Slot.find().sort({ date: -1, startTime24: 1 });
  res.json(slots);
});

// Delete all slots
router.delete('/delete-all', async (req, res) => {
  const result = await Slot.deleteMany({});
  res.json({ deleted: result.deletedCount });
});

// Get slot by ID
router.get('/:id', async (req, res) => {
  const slot = await Slot.findById(req.params.id);
  if (!slot) return res.status(404).json({ error: 'Slot not found' });
  res.json(slot);
});

export default router;

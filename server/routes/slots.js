const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');

// Helper function to convert 24-hour to 12-hour format
const formatTo12Hour = (time24) => {
    if (!time24 || time24 === '00:00') return '12:00 AM';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
};

// Helper function to check if slots need refresh (older than 24 hours)
const shouldRefreshSlots = async (date) => {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const oldSlots = await Slot.find({ 
        date: { $lt: yesterday },
        isBooked: true 
    });
    
    if (oldSlots.length > 0) {
        // Reset old booked slots to available
        await Slot.updateMany(
            { date: { $lt: yesterday }, isBooked: true },
            { 
                $set: { 
                    isBooked: false,
                    bookedBy: null,
                    bookingId: null 
                } 
            }
        );
        console.log(`♻️ Reset ${oldSlots.length} old booked slots to available`);
    }
    
    // Delete slots older than 7 days to keep database clean
    const weekAgo = new Date(date);
    weekAgo.setDate(weekAgo.getDate() - 7);
    await Slot.deleteMany({ date: { $lt: weekAgo } });
};

// Get today's available slots
router.get('/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check and refresh old slots
        await shouldRefreshSlots(today);

        // Check if slots exist for today
        let slots = await Slot.find({
            date: { $gte: today, $lt: tomorrow }
        });

        console.log(`📅 Found ${slots.length} slots for ${today.toDateString()}`);

        // If no slots exist, create FRESH 1-HOUR SLOTS
        if (slots.length === 0) {
            console.log('🆕 Creating FRESH 1-hour slots for today...');
            
            // Create slots from 8 AM to 10 PM, 1-hour slots
            const startHour = 8;
            const endHour = 22; // 10 PM
            const slotDuration = 1; // 1-hour slots
            const newSlots = [];

            for (let hour = startHour; hour < endHour; hour += slotDuration) {
                const startTime24 = `${hour.toString().padStart(2, '0')}:00`;
                const endTime24 = `${(hour + slotDuration).toString().padStart(2, '0')}:00`;
                
                // Convert to 12-hour format for display
                const startTime12 = formatTo12Hour(startTime24);
                const endTime12 = formatTo12Hour(endTime24);
                
                // Different pricing based on time
                let price = 800; // Default per hour
                if (hour >= 12 && hour < 16) price = 1000; // Afternoon (12-4 PM)
                if (hour >= 16 && hour < 20) price = 1200; // Evening (4-8 PM)
                if (hour >= 20) price = 1500; // Night (8-10 PM)

                newSlots.push({
                    date: new Date(today),
                    startTime: startTime12,    // Store in 12-hour format
                    endTime: endTime12,        // Store in 12-hour format
                    startTime24: startTime24,  // Keep 24-hour for calculations
                    endTime24: endTime24,      // Keep 24-hour for calculations
                    price,
                    isBooked: false
                });
            }

            slots = await Slot.insertMany(newSlots);
            console.log(`✅ Created ${slots.length} FRESH 1-hour slots (${startHour}:00 to ${endHour}:00)`);
        } else {
            // If slots exist, check if they're 2-hour slots (old data)
            const sampleSlot = slots[0];
            const startHour = parseInt(sampleSlot.startTime24?.split(':')[0] || '8');
            const endHour = parseInt(sampleSlot.endTime24?.split(':')[0] || '10');
            
            // If slots are 2-hour duration (old data), delete and recreate
            if (endHour - startHour === 2) {
                console.log('⚠️ Found OLD 2-hour slots, deleting and creating fresh 1-hour slots...');
                await Slot.deleteMany({ date: { $gte: today, $lt: tomorrow } });
                
                // Recreate 1-hour slots
                const startHour = 8;
                const endHour = 22;
                const slotDuration = 1;
                const newSlots = [];

                for (let hour = startHour; hour < endHour; hour += slotDuration) {
                    const startTime24 = `${hour.toString().padStart(2, '0')}:00`;
                    const endTime24 = `${(hour + slotDuration).toString().padStart(2, '0')}:00`;
                    
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
                        startTime24: startTime24,
                        endTime24: endTime24,
                        price,
                        isBooked: false
                    });
                }

                slots = await Slot.insertMany(newSlots);
                console.log(`✅ Replaced with ${slots.length} fresh 1-hour slots`);
            }
        }

        // Filter out booked slots and format response
        const availableSlots = slots
            .filter(slot => !slot.isBooked)
            .map(slot => ({
                _id: slot._id,
                date: slot.date,
                startTime: slot.startTime,
                endTime: slot.endTime,
                startTime24: slot.startTime24,
                endTime24: slot.endTime24,
                price: slot.price,
                isBooked: slot.isBooked,
                duration: '1 hour'
            }))
            .sort((a, b) => {
                if (!a.startTime24 || !b.startTime24) return 0;
                return a.startTime24.localeCompare(b.startTime24);
            });

        console.log(`🟢 Sending ${availableSlots.length} available slots (1-hour each)`);
        res.json(availableSlots);
        
    } catch (err) {
        console.error('❌ Error fetching slots:', err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// Force reset and recreate all slots (for testing)
router.post('/reset-and-recreate', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Delete all today's slots
        await Slot.deleteMany({ date: { $gte: today, $lt: tomorrow } });
        
        // Create fresh 1-hour slots
        const startHour = 8;
        const endHour = 22;
        const slotDuration = 1;
        const newSlots = [];

        for (let hour = startHour; hour < endHour; hour += slotDuration) {
            const startTime24 = `${hour.toString().padStart(2, '0')}:00`;
            const endTime24 = `${(hour + slotDuration).toString().padStart(2, '0')}:00`;
            
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
                startTime24: startTime24,
                endTime24: endTime24,
                price,
                isBooked: false
            });
        }

        await Slot.insertMany(newSlots);
        
        res.json({ 
            message: 'Reset and recreated fresh 1-hour slots!',
            slotsCreated: newSlots.length,
            timeRange: '8:00 AM to 10:00 PM',
            duration: '1 hour each'
        });
    } catch (err) {
        console.error('Error resetting slots:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all slots (admin view)
router.get('/all', async (req, res) => {
    try {
        const slots = await Slot.find().sort({ date: -1, startTime24: 1 });
        res.json(slots);
    } catch (err) {
        console.error('Error fetching all slots:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete all slots (clean start)
router.delete('/delete-all', async (req, res) => {
    try {
        const result = await Slot.deleteMany({});
        console.log(`🗑️ Deleted ${result.deletedCount} slots`);
        res.json({ message: `Deleted ${result.deletedCount} slots` });
    } catch (err) {
        console.error('Error deleting slots:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get slot by ID
router.get('/:id', async (req, res) => {
    try {
      const slot = await Slot.findById(req.params.id);
      
      if (!slot) {
        return res.status(404).json({ error: 'Slot not found' });
      }
      
      res.json(slot);
    } catch (err) {
      console.error('Error fetching slot:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

module.exports = router;
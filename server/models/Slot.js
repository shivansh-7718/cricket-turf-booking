import mongoose from 'mongoose';

const SlotSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        index: true // Add index for faster queries
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    startTime24: {
        type: String,
        required: true
    },
    endTime24: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 800
    },
    isBooked: {
        type: Boolean,
        default: false,
        index: true // Add index for faster filtering
    },
    bookedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    bookingId: {
        type: String
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

// Add compound index for better performance
SlotSchema.index({ date: 1, isBooked: 1 });


export default mongoose.model('Slot', SlotSchema);
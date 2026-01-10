import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { motion } from 'framer-motion';

const CalendarModal = ({ onClose, onConfirm }) => {
  const [date, setDate] = useState(new Date());

  const handleConfirm = () => {
    const formattedDate = date.toISOString().split('T')[0];
    onConfirm(formattedDate);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl p-6 w-[90%] max-w-sm shadow-xl"
      >
        <h2 className="text-xl font-bold mb-4 text-center">
          Select Booking Date
        </h2>

        <div className="flex justify-center mb-6">
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            minDate={new Date()}
            inline
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="w-1/2 py-2 rounded-lg border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="w-1/2 py-2 rounded-lg bg-primary-600 text-white font-semibold"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarModal;

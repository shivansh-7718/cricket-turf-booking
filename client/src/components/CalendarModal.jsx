import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CalendarModal = ({ open, onClose, onSelect }) => {
  const [date, setDate] = useState(new Date());

  if (!open) return null; // ✅ CRITICAL LINE

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[320px] text-center">
        <h2 className="text-xl font-bold mb-4">Select Booking Date</h2>

        <DatePicker
          selected={date}
          onChange={setDate}
          inline
          minDate={new Date()}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}              // ✅ Cancel works
            className="w-1/2 border rounded-lg py-2"
          >
            Cancel
          </button>

          <button
            onClick={() =>
              onSelect(date.toISOString().split('T')[0])
            }                               // ✅ Continue works
            className="w-1/2 bg-primary-600 text-white rounded-lg py-2"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;

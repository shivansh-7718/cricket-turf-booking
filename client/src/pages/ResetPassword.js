import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(
      `https://cricket-turf-booking.onrender.com/api/auth/reset-password/${token}`,
      { password }
    );
    alert('Password updated successfully');
    navigate('/login');
  };

  return (
    <div className="container mx-auto max-w-md py-20">
      <h2 className="text-2xl font-bold mb-6">Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          className="w-full p-3 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn-primary w-full">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;

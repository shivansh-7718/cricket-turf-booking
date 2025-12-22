import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
    setSent(true);
  };

  return (
    <div className="container mx-auto max-w-md py-20">
      <h2 className="text-2xl font-bold mb-6">Forgot Password</h2>

      {sent ? (
        <p className="text-green-600">
          If an account exists, a reset link has been sent.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 border rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button className="btn-primary w-full">Send Reset Link</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;

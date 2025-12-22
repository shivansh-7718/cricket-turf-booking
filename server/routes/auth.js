const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const generateResetToken = require('../utils/generateResetToken');


// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ error: 'User already exists' });

        user = new User({
            name,
            email,
            password: await bcrypt.hash(password, 10),
            phone
        });

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user._id, name, email, phone } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, phone: user.phone , role: user.role} });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) {
        return res.json({ success: true }); // security: don’t reveal
      }
  
      const { resetToken, hashedToken } = generateResetToken();
  
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
  
      await user.save();
  
      const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
  
      await sendEmail({
        to: user.email,
        subject: '🔐 Password Reset Request',
        html: `
          <h2>Password Reset</h2>
          <p>You requested a password reset.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>This link expires in 15 minutes.</p>
        `
      });
  
      res.json({ success: true });
    } catch (err) {
      console.error('❌ Forgot password error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Reset Password
router.post('/reset-password/:token', async (req, res) => {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
  
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
      });
  
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }
  
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save();
  
      res.json({ success: true });
    } catch (err) {
      console.error('❌ Reset password error:', err);
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  

module.exports = router;
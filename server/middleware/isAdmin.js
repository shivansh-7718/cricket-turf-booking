module.exports = (req, res, next) => {
    // req.user comes from authMiddleware
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin only' });
    }
    next();
  };
  
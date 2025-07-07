const express = require('express');
const router = express.Router();
const { verifyToken, ensureUserExists } = require('../middleware/authMiddleware');

// Verify token and get user info
router.post('/verify', verifyToken, ensureUserExists, (req, res) => {
  res.json({
    uid: req.user.uid,
    email: req.user.email,
    isAdmin: req.dbUser && req.dbUser.role === 'admin'
  });
});

module.exports = router; 
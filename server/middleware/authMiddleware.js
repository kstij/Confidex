const admin = require('firebase-admin');
const User = require('../models/User');
const Workspace = require('../models/Workspace');

// Verify Firebase token and get user info
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email.split('@')[0]
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Ensure user exists in database
const ensureUserExists = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.user.email });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        email: req.user.email,
        uid: req.user.uid,
        name: req.user.name,
        formsSubmitted: []
      });
      await user.save();
      console.log('New user created:', req.user.email);
    }

    // Always check for 'My Workspace' for this user
    await Workspace.findOneAndUpdate(
      { owner: req.user.uid, name: 'My Workspace' },
      { $setOnInsert: { members: [req.user.uid], forms: [] } },
      { upsert: true, new: true }
    );

    req.dbUser = user;
    next();
  } catch (error) {
    console.error('User creation/verification error:', error);
    res.status(500).json({ error: 'User verification failed' });
  }
};

module.exports = {
  verifyToken,
  ensureUserExists
}; 
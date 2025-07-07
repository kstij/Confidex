var express = require('express');
var router = express.Router();
const { verifyToken, ensureUserExists } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const Form = require('../models/Form');
const Response = require('../models/Response');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// GET /users/me/notifications - get notifications for logged-in user
router.get('/me/notifications', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ notifications: user.notifications || [] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /users/me/notifications/read - mark all notifications as read
router.post('/me/notifications/read', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.notifications.forEach(n => { n.read = true; });
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// POST /workspaces - create a new workspace
router.post('/workspaces', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Workspace name required' });
    const workspace = new Workspace({
      name,
      owner: req.user.uid,
      members: [req.user.uid],
      forms: []
    });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// GET /workspaces - list workspaces for user
router.get('/workspaces', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user.uid },
        { members: req.user.uid }
      ]
    });
    res.json({ workspaces });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// DELETE /users/me - delete user account and all associated data
router.delete('/me', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Delete all forms created by the user
    await Form.deleteMany({ creatorUid: userId });
    
    // Delete all responses to forms created by the user
    const userForms = await Form.find({ creatorUid: userId });
    const formIds = userForms.map(form => form._id);
    await Response.deleteMany({ formId: { $in: formIds } });
    
    // Delete all workspaces owned by the user
    await Workspace.deleteMany({ owner: userId });
    
    // Remove user from workspaces where they are a member but not owner
    await Workspace.updateMany(
      { members: userId, owner: { $ne: userId } },
      { $pull: { members: userId } }
    );
    
    // Delete the user document
    await User.deleteOne({ uid: userId });
    
    res.json({ success: true, message: 'Account and all associated data deleted successfully' });
  } catch (err) {
    console.error('Error deleting user account:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;

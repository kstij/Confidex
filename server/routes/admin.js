const express = require('express');
const router = express.Router();
const { verifyToken, ensureUserExists } = require('../middleware/authMiddleware');
const Form = require('../models/Form');
const Response = require('../models/Response');
const User = require('../models/User');

// Get all forms (admin only)
router.get('/forms', verifyToken, ensureUserExists, async (req, res) => {
  try {
    // Check if user is admin
    const adminEmails = ['admin@example.com', 'hr@company.com', 'kshitijvarma21@gmail.com'];
    const isAdmin = adminEmails.includes(req.user.email);
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const forms = await Form.find().sort({ createdAt: -1 });
    const formsWithCounts = await Promise.all(
      forms.map(async (form) => {
        const responseCount = await Response.countDocuments({ formId: form._id });
        return {
          ...form.toObject(),
          responseCount
        };
      })
    );
    
    res.json(formsWithCounts);
  } catch (error) {
    console.error('Admin forms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get form responses (admin or form creator)
router.get('/forms/:formId/responses', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Check if user is admin or form creator
    const adminEmails = ['admin@example.com', 'hr@company.com', 'kshitijvarma21@gmail.com'];
    const isAdmin = adminEmails.includes(req.user.email);
    const isCreator = form.creatorEmail === req.user.email;
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const responses = await Response.find({ formId: req.params.formId })
      .sort({ submittedAt: -1 });
    
    res.json(responses);
  } catch (error) {
    console.error('Form responses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get form analytics (admin or form creator)
router.get('/forms/:formId/analytics', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Check if user is admin or form creator
    const adminEmails = ['admin@example.com', 'hr@company.com', 'kshitijvarma21@gmail.com'];
    const isAdmin = adminEmails.includes(req.user.email);
    const isCreator = form.creatorEmail === req.user.email;
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const responses = await Response.find({ formId: req.params.formId });
    
    // Calculate analytics
    const totalResponses = responses.length;
    const questionAnalytics = {};
    
    form.questions.forEach(question => {
      const answers = responses.map(response => response.answers.get(question.id));
      
      if (question.type === 'rating') {
        const validAnswers = answers.filter(a => a !== undefined && a !== null);
        const average = validAnswers.length > 0 
          ? validAnswers.reduce((sum, val) => sum + Number(val), 0) / validAnswers.length 
          : 0;
        
        questionAnalytics[question.id] = {
          type: 'rating',
          average: Math.round(average * 10) / 10,
          total: validAnswers.length
        };
      } else if (question.type === 'checkbox' || question.type === 'dropdown') {
        const optionCounts = {};
        answers.forEach(answer => {
          if (Array.isArray(answer)) {
            answer.forEach(option => {
              optionCounts[option] = (optionCounts[option] || 0) + 1;
            });
          } else if (answer) {
            optionCounts[answer] = (optionCounts[answer] || 0) + 1;
          }
        });
        
        questionAnalytics[question.id] = {
          type: question.type,
          options: optionCounts
        };
      } else {
        questionAnalytics[question.id] = {
          type: 'text',
          total: answers.filter(a => a && a.trim()).length
        };
      }
    });
    
    res.json({
      formId: req.params.formId,
      totalResponses,
      questionAnalytics
    });
  } catch (error) {
    console.error('Form analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', verifyToken, ensureUserExists, async (req, res) => {
  try {
    // Check if user is admin
    const adminEmails = ['admin@example.com', 'hr@company.com', 'kshitijvarma21@gmail.com'];
    const isAdmin = adminEmails.includes(req.user.email);
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Users fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get platform statistics (admin only)
router.get('/stats', verifyToken, ensureUserExists, async (req, res) => {
  try {
    // Check if user is admin
    const adminEmails = ['admin@example.com', 'hr@company.com', 'kshitijvarma21@gmail.com'];
    const isAdmin = adminEmails.includes(req.user.email);
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const totalUsers = await User.countDocuments();
    const totalForms = await Form.countDocuments();
    const totalResponses = await Response.countDocuments();
    
    // Get recent activity
    const recentForms = await Form.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    const recentResponses = await Response.find()
      .sort({ submittedAt: -1 })
      .limit(10);
    
    res.json({
      totalUsers,
      totalForms,
      totalResponses,
      recentForms,
      recentResponses
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
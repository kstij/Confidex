const express = require('express');
const router = express.Router();
const { verifyToken, ensureUserExists } = require('../middleware/authMiddleware');
const Form = require('../models/Form');
const Response = require('../models/Response');
const crypto = require('crypto');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

// In-memory store for invite tokens (for MVP; use DB/Redis for production)
const inviteTokens = {};

// POST /form/:formId/invite-link - generate a collaboration link
router.post('/:formId/invite-link', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    if (!form.collaborators.includes(req.user.email)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    // Generate a random token
    const token = crypto.randomBytes(24).toString('hex');
    inviteTokens[token] = { formId: form._id.toString(), createdAt: Date.now() };
    // Return the link
    const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/collaborate/${form._id}/${token}`;
    res.json({ link });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate invite link' });
  }
});

// POST /form/:formId/accept-invite/:token - accept a collaboration invite
router.post('/:formId/accept-invite/:token', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const { formId, token } = req.params;
    const invite = inviteTokens[token];
    if (!invite || invite.formId !== formId) {
      return res.status(400).json({ error: 'Invalid or expired invite link' });
    }
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    // Add user as collaborator if not already
    if (!form.collaborators.includes(req.user.email)) {
      form.collaborators.push(req.user.email);
      await form.save();
    }
    // Optionally, delete the token after use (for one-time use)
    // delete inviteTokens[token];
    res.json({ success: true, formId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept invite' });
  }
});

// Create a new form - All authenticated users can create forms
router.post('/create', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const { title, description, questions, domainRestrictions, isActive, workspaceId } = req.body;
    
    const form = new Form({
      title,
      description,
      questions,
      domainRestrictions: domainRestrictions || [],
      isActive: isActive !== false,
      creatorEmail: req.user.email,
      creatorUid: req.user.uid
    });
    
    await form.save();
    
    // If workspaceId is provided, add form to workspace
    if (workspaceId) {
      const updatedWs = await Workspace.findByIdAndUpdate(
        workspaceId,
        { $push: { forms: form._id } },
        { new: true }
      );
      console.log(`Form ${form._id} added to workspace ${workspaceId}. Workspace now has forms:`, updatedWs?.forms?.length);
    }
    
    res.status(201).json(form);
  } catch (error) {
    console.error('Form creation error:', error);
    res.status(500).json({ error: 'Failed to create form' });
  }
});

// Get responders for a form (for Responder tab)
router.get('/:formId/responders', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    // Only allow creator to see responders
    if (form.creatorEmail !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ responders: form.responders });
  } catch (error) {
    console.error('Get responders error:', error);
    res.status(500).json({ error: 'Failed to fetch responders' });
  }
});

// Get insights for a form
router.get('/:formId/insights', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    const views = form.views.length;
    const starts = form.starts.length;
    const submissions = form.responders.length;
    const completionRate = views > 0 ? Math.round((submissions / views) * 100) : 0;
    const avgTime = form.completionTimes.length > 0 ? Math.round(form.completionTimes.reduce((a, b) => a + b, 0) / form.completionTimes.length / 1000) : null; // in seconds
    res.json({
      views,
      starts,
      submissions,
      completionRate,
      avgTime // seconds
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// Get form details for submission (public access)
router.get('/:formId', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    if (!form.isActive) {
      return res.status(400).json({ error: 'Form is not active' });
    }
    
    // Check domain restrictions
    if (form.domainRestrictions && form.domainRestrictions.length > 0) {
      const userDomain = req.user.email.split('@')[1];
      if (!form.domainRestrictions.includes(userDomain)) {
        return res.status(403).json({ error: 'Access denied for this domain' });
      }
    }
    
    // Check if user has already submitted
    const existingResponse = await Response.findOne({
      formId: form._id,
      submitterEmail: req.user.email
    });
    
    if (existingResponse) {
      return res.status(400).json({ error: 'You have already submitted this form' });
    }
    
    res.json(form);
  } catch (error) {
    console.error('Form fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
});

// Get form details for editing (creator only)
router.get('/:formId/edit', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Check if user is the creator
    if (form.creatorEmail !== req.user.email) {
      return res.status(403).json({ error: 'Access denied. Only form creator can edit.' });
    }
    
    res.json(form);
  } catch (error) {
    console.error('Form edit fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch form for editing' });
  }
});

// Update form (creator only)
router.put('/:formId', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const { title, description, questions, domainRestrictions, isActive } = req.body;
    
    const form = await Form.findById(req.params.formId);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Check if user is the creator
    if (form.creatorEmail !== req.user.email) {
      return res.status(403).json({ error: 'Access denied. Only form creator can edit.' });
    }
    
    // Update form fields
    form.title = title;
    form.description = description;
    form.questions = questions;
    form.domainRestrictions = domainRestrictions || [];
    form.isActive = isActive !== false;
    form.updatedAt = new Date();
    
    await form.save();
    
    res.json(form);
  } catch (error) {
    console.error('Form update error:', error);
    res.status(500).json({ error: 'Failed to update form' });
  }
});

// Submit form response
router.post('/:formId/submit', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const { answers } = req.body;
    const formId = req.params.formId;

    const form = await Form.findById(formId);

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    if (!form.isActive) {
      return res.status(400).json({ error: 'Form is not active' });
    }

    // Check domain restrictions
    if (form.domainRestrictions && form.domainRestrictions.length > 0) {
      const userDomain = req.user.email.split('@')[1];
      if (!form.domainRestrictions.includes(userDomain)) {
        return res.status(403).json({ error: 'Access denied for this domain' });
      }
    }

    // Check if user has already submitted
    if (form.responders.includes(req.user.email)) {
      return res.status(400).json({ error: 'You have already submitted this form' });
    }

    // Validate required questions
    for (const question of form.questions) {
      if (question.required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          return res.status(400).json({
            error: `Question "${question.label}" is required`
          });
        }
      }
    }

    // Store response anonymously
    const response = new Response({
      formId: formId,
      answers: new Map(Object.entries(answers)),
      submittedAt: new Date()
    });
    await response.save();

    // Add responder to form's responders array
    if (!form.responders.includes(req.user.email)) {
      form.responders.push(req.user.email);
      // Shuffle the responders array to break order and ensure anonymity
      for (let i = form.responders.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [form.responders[i], form.responders[j]] = [form.responders[j], form.responders[i]];
      }
    }
    await form.save();

    // Notify form owner
    if (form.creatorEmail) {
      await User.findOneAndUpdate(
        { email: form.creatorEmail },
        { $push: { notifications: {
          type: 'submission',
          message: `Your form "${form.title}" received a new response.`,
          formId: form._id,
          from: req.user.email,
          createdAt: new Date(),
          read: false
        } } }
      );
    }

    res.status(201).json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Form submission error:', error);
    res.status(500).json({ error: 'Failed to submit form' });
  }
});

// Get user's own forms (for form creators)
router.get('/user/forms', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const forms = await Form.find({ collaborators: userEmail });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user forms' });
  }
});

// Get form responses (creator only)
router.get('/:formId/responses', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Check if user is the creator
    if (form.creatorEmail !== req.user.email) {
      return res.status(403).json({ error: 'Access denied. Only form creator can view responses.' });
    }
    
    const responses = await Response.find({ formId: req.params.formId })
      .sort({ submittedAt: -1 });
    
    // Convert Map objects to plain objects for JSON serialization
    const responsesWithPlainAnswers = responses.map(response => {
      const responseObj = response.toObject();
      // Convert Map to plain object
      if (responseObj.answers instanceof Map) {
        responseObj.answers = Object.fromEntries(responseObj.answers);
      }
      return responseObj;
    });
    
    res.json(responsesWithPlainAnswers);
  } catch (error) {
    console.error('Form responses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get form analytics (creator only)
router.get('/:formId/analytics', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Check if user is the creator
    if (form.creatorEmail !== req.user.email) {
      return res.status(403).json({ error: 'Access denied. Only form creator can view analytics.' });
    }
    
    const responses = await Response.find({ formId: req.params.formId });
    
    // Calculate analytics
    const totalResponses = responses.length;
    const questionAnalytics = {};
    
    form.questions.forEach(question => {
      const answers = responses.map(response => {
        // Handle both Map and plain object cases
        if (response.answers instanceof Map) {
          return response.answers.get(question.id);
        } else {
          return response.answers[question.id];
        }
      });
      
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

// Delete form (creator only)
router.delete('/:formId', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    // Check if user is the creator
    if (form.creatorEmail !== req.user.email) {
      return res.status(403).json({ error: 'Access denied. Only form creator can delete.' });
    }
    
    // Delete all responses first
    await Response.deleteMany({ formId: req.params.formId });
    
    // Delete the form
    await Form.findByIdAndDelete(req.params.formId);
    
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Form deletion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /form/:formId/rename
router.patch('/:formId/rename', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const form = await Form.findByIdAndUpdate(req.params.formId, { title }, { new: true });
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: 'Failed to rename form' });
  }
});

// PATCH /form/:formId/status
router.patch('/:formId/status', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') return res.status(400).json({ error: 'isActive status must be boolean' });
    const form = await Form.findByIdAndUpdate(req.params.formId, { isActive }, { new: true });
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update form status' });
  }
});

// Add/Remove/List Collaborators

// GET /form/:formId/collaborators
router.get('/:formId/collaborators', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json({ collaborators: form.collaborators });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get collaborators' });
  }
});

// POST /form/:formId/collaborators (add one or more)
router.post('/:formId/collaborators', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const { emails } = req.body; // array of emails or single email
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'Emails array required' });
    }
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    // Only allow if user is a collaborator
    if (!form.collaborators.includes(req.user.email)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    // Add unique emails
    form.collaborators = Array.from(new Set([...form.collaborators, ...emails]));
    await form.save();
    res.json({ collaborators: form.collaborators });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add collaborators' });
  }
});

// DELETE /form/:formId/collaborators (remove one)
router.delete('/:formId/collaborators', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const form = await Form.findById(req.params.formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    // Only allow if user is a collaborator
    if (!form.collaborators.includes(req.user.email)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    // Don't allow removing the last collaborator
    if (form.collaborators.length === 1) {
      return res.status(400).json({ error: 'At least one collaborator required' });
    }
    form.collaborators = form.collaborators.filter(e => e !== email);
    await form.save();
    res.json({ collaborators: form.collaborators });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

// GET /form/workspace/:workspaceId - get all forms for a workspace
router.get('/workspace/:workspaceId', verifyToken, ensureUserExists, async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.workspaceId).populate('forms');
    if (!workspace) return res.status(404).json({ error: 'Workspace not found' });
    res.json(workspace.forms || []);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch workspace forms' });
  }
});

module.exports = router; 
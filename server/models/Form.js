const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['short-answer', 'long-answer', 'rating', 'checkbox', 'dropdown'],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  required: {
    type: Boolean,
    default: false
  },
  options: [String], // For checkbox and dropdown questions
  minRating: {
    type: Number,
    default: 1
  },
  maxRating: {
    type: Number,
    default: 5
  }
});

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  questions: [questionSchema],
  domainRestrictions: [String], // Array of allowed domains (e.g., ['company.com'])
  isActive: {
    type: Boolean,
    default: true
  },
  creatorEmail: {
    type: String,
    required: true
  },
  creatorUid: {
    type: String,
    required: true
  },
  collaborators: {
    type: [String], // Array of emails
    default: function() { return [this.creatorEmail]; }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  responders: {
    type: [String], // Array of emails or UIDs
    default: []
  },
  views: {
    type: [String], // Array of emails who viewed but didn't submit
    default: []
  },
  starts: {
    type: [String], // Array of emails who started but didn't submit
    default: []
  },
  completionTimes: {
    type: [Number], // Array of completion times in ms
    default: []
  }
});

// Update the updatedAt field before saving
formSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Form', formSchema); 
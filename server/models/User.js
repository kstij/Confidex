const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  formsSubmitted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form'
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['invite', 'joined', 'edit', 'submission'],
      required: true
    },
    message: { type: String, required: true },
    formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
    from: { type: String }, // email or name
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema); 
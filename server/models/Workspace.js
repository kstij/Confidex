const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: String, required: true }, // user uid or email
  members: [{ type: String }], // user uids or emails
  forms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Form' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workspace', workspaceSchema); 
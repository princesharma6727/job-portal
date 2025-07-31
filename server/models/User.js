const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  linkedinUrl: {
    type: String,
    default: ''
  },
  skills: [{
    type: String,
    trim: true
  }],
  walletAddress: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    default: 'entry'
  },
  isEmployer: {
    type: Boolean,
    default: false
  },
  company: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  socialLinks: {
    twitter: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  preferences: {
    jobAlerts: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: true }
  },
  stats: {
    jobsPosted: { type: Number, default: 0 },
    jobsApplied: { type: Number, default: 0 },
    connections: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search functionality
userSchema.index({ 
  name: 'text', 
  bio: 'text', 
  skills: 'text',
  location: 'text',
  company: 'text'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.email;
  delete userObject.preferences;
  return userObject;
};

// Method to update last active
userSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  const fields = ['name', 'bio', 'skills', 'location', 'linkedinUrl'];
  const completed = fields.filter(field => this[field] && this[field].length > 0).length;
  return Math.round((completed / fields.length) * 100);
});

module.exports = mongoose.model('User', userSchema); 
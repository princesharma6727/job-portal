const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  remote: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'],
    required: true
  },
  experience: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive'],
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  budget: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'INR', 'ETH', 'MATIC'],
      default: 'USD'
    }
  },
  benefits: [{
    type: String,
    trim: true
  }],
  requirements: {
    type: String,
    maxlength: 1000
  },
  responsibilities: {
    type: String,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'draft'],
    default: 'active'
  },
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    coverLetter: {
      type: String,
      maxlength: 1000
    },
    resume: {
      type: String
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search functionality
jobSchema.index({ 
  title: 'text', 
  description: 'text', 
  skills: 'text',
  location: 'text',
  company: 'text',
  tags: 'text'
});

// Index for filtering
jobSchema.index({ 
  status: 1, 
  type: 1, 
  experience: 1, 
  remote: 1,
  'budget.currency': 1,
  createdAt: -1
});

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
  return this.applications.length;
});

// Virtual for days until expiry
jobSchema.virtual('daysUntilExpiry').get(function() {
  const now = new Date();
  const expiry = this.expiresAt;
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// Virtual for budget range
jobSchema.virtual('budgetRange').get(function() {
  const { min, max, currency } = this.budget;
  if (min === max) {
    return `${currency} ${min}`;
  }
  return `${currency} ${min} - ${max}`;
});

// Method to increment views
jobSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to add application
jobSchema.methods.addApplication = function(applicantId, coverLetter, resume, matchScore = 0) {
  const application = {
    applicant: applicantId,
    coverLetter,
    resume,
    matchScore,
    appliedAt: new Date()
  };
  
  this.applications.push(application);
  this.applicationsCount = this.applications.length;
  return this.save();
};

// Method to update application status
jobSchema.methods.updateApplicationStatus = function(applicationId, status) {
  const application = this.applications.id(applicationId);
  if (application) {
    application.status = status;
    return this.save();
  }
  throw new Error('Application not found');
};

// Static method to get active jobs
jobSchema.statics.getActiveJobs = function() {
  return this.find({ 
    status: 'active',
    expiresAt: { $gt: new Date() }
  }).populate('employer', 'name company profileImage');
};

// Static method to search jobs
jobSchema.statics.searchJobs = function(query, filters = {}) {
  const searchQuery = {
    status: 'active',
    expiresAt: { $gt: new Date() },
    ...filters
  };

  if (query) {
    // Use regex search instead of text search to avoid index issues
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { company: { $regex: query, $options: 'i' } },
      { location: { $regex: query, $options: 'i' } },
      { skills: { $regex: query, $options: 'i' } }
    ];
  }

  return this.find(searchQuery)
    .populate('employer', 'name company profileImage')
    .sort({ createdAt: -1 });
};



module.exports = mongoose.model('Job', jobSchema); 
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['update', 'career', 'advice', 'general'],
    default: 'update'
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for search functionality
postSchema.index({ 
  content: 'text',
  tags: 'text'
});

// Index for filtering and sorting
postSchema.index({ 
  type: 1, 
  createdAt: -1,
  author: 1
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for engagement score
postSchema.virtual('engagementScore').get(function() {
  const likeCount = this.likes ? this.likes.length : 0;
  return (likeCount * 2) + (this.shares * 3) + (this.comments * 1);
});

// Method to add like
postSchema.methods.addLike = function(userId) {
  if (!this.likes) {
    this.likes = [];
  }
  const existingLike = this.likes.find(like => like.user.toString() === userId);
  if (!existingLike) {
    this.likes.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove like
postSchema.methods.removeLike = function(userId) {
  if (!this.likes) {
    this.likes = [];
  }
  this.likes = this.likes.filter(like => like.user.toString() !== userId);
  return this.save();
};

// Method to increment shares
postSchema.methods.incrementShares = function() {
  this.shares = (this.shares || 0) + 1;
  return this.save();
};

// Method to increment views
postSchema.methods.incrementViews = function() {
  this.views = (this.views || 0) + 1;
  return this.save();
};

// Static method to get trending posts
postSchema.statics.getTrending = function(limit = 10) {
  return this.aggregate([
    {
      $addFields: {
        engagementScore: {
          $add: [
            { $multiply: [{ $size: { $ifNull: ['$likes', []] } }, 2] },
            { $multiply: ['$shares', 3] },
            { $multiply: ['$comments', 1] }
          ]
        }
      }
    },
    { $sort: { engagementScore: -1, createdAt: -1 } },
    { $limit: limit }
  ]);
};

// Static method to get posts by user
postSchema.statics.getByUser = function(userId, limit = 20) {
  return this.find({ author: userId })
    .populate('author', 'name company profileImage')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to search posts
postSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    ...filters
  };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  return this.find(searchQuery)
    .populate('author', 'name company profileImage')
    .sort({ createdAt: -1 });
};

// Pre-save middleware to ensure proper data structure
postSchema.pre('save', function(next) {
  // Ensure likes is always an array
  if (!this.likes) {
    this.likes = [];
  }
  
  // Ensure numeric fields have default values
  if (typeof this.shares !== 'number') {
    this.shares = 0;
  }
  if (typeof this.comments !== 'number') {
    this.comments = 0;
  }
  if (typeof this.views !== 'number') {
    this.views = 0;
  }
  
  next();
});

module.exports = mongoose.model('Post', postSchema); 
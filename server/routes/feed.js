const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all posts with optional filtering
router.get('/', auth, async (req, res) => {
  try {
    const { filter = 'all', page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Apply filters
    if (filter !== 'all') {
      query.type = filter;
    }
    
    const skip = (page - 1) * limit;
    
    const posts = await Post.find(query)
      .populate('author', 'name company profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Convert to plain objects
    
    // Ensure all posts have required fields
    const processedPosts = posts.map(post => ({
      _id: post._id,
      content: post.content || '',
      type: post.type || 'update',
      author: post.author || { name: 'Anonymous' },
      likes: post.likes ? post.likes.length : 0,
      shares: post.shares || 0,
      comments: post.comments || 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));
    
    const total = await Post.countDocuments(query);
    
    res.json({
      posts: processedPosts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + posts.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Create a new post
router.post('/', auth, async (req, res) => {
  try {
    const { content, type = 'update' } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Post content is required' });
    }
    
    if (content.length > 500) {
      return res.status(400).json({ error: 'Post content must be less than 500 characters' });
    }
    
    const post = new Post({
      content: content.trim(),
      type,
      author: req.user.userId
    });
    
    await post.save();
    
    // Populate author info and convert to plain object
    await post.populate('author', 'name company profileImage');
    const postData = post.toObject();
    
    // Ensure proper structure
    const processedPost = {
      _id: postData._id,
      content: postData.content,
      type: postData.type,
      author: postData.author || { name: 'Anonymous' },
      likes: 0,
      shares: 0,
      comments: 0,
      createdAt: postData.createdAt,
      updatedAt: postData.updatedAt
    };
    
    res.status(201).json({ post: processedPost });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Like a post
router.post('/:postId/like', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user already liked the post
    const existingLike = post.likes.find(like => like.user.toString() === req.user.userId);
    
    if (existingLike) {
      // Unlike the post
      post.likes = post.likes.filter(like => like.user.toString() !== req.user.userId);
    } else {
      // Like the post
      post.likes.push({ user: req.user.userId });
    }
    
    await post.save();
    
    res.json({ 
      likes: post.likes.length,
      isLiked: !existingLike
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
});

// Share a post
router.post('/:postId/share', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Increment share count
    post.shares += 1;
    await post.save();
    
    res.json({ shares: post.shares });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ error: 'Failed to share post' });
  }
});

// Get post by ID
router.get('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId)
      .populate('author', 'name company profileImage')
      .lean();
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Ensure proper structure
    const processedPost = {
      _id: post._id,
      content: post.content,
      type: post.type,
      author: post.author || { name: 'Anonymous' },
      likes: post.likes ? post.likes.length : 0,
      shares: post.shares || 0,
      comments: post.comments || 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    };
    
    res.json({ post: processedPost });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Delete a post (author only)
router.delete('/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user is the author
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }
    
    await Post.findByIdAndDelete(postId);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get trending posts
router.get('/trending', auth, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const trendingPosts = await Post.aggregate([
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: [{ $size: '$likes' }, 2] },
              { $multiply: ['$shares', 3] },
              { $multiply: ['$comments', 1] }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $limit: parseInt(limit) }
    ]);
    
    // Populate author info
    const posts = await Post.populate(trendingPosts, {
      path: 'author',
      select: 'name company profileImage'
    });
    
    // Ensure proper structure
    const processedPosts = posts.map(post => ({
      _id: post._id,
      content: post.content || '',
      type: post.type || 'update',
      author: post.author || { name: 'Anonymous' },
      likes: post.likes ? post.likes.length : 0,
      shares: post.shares || 0,
      comments: post.comments || 0,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt
    }));
    
    res.json({ posts: processedPosts });
  } catch (error) {
    console.error('Get trending posts error:', error);
    res.status(500).json({ error: 'Failed to fetch trending posts' });
  }
});

module.exports = router; 
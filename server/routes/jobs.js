const express = require('express');
const Job = require('../models/Job');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { calculateMatchScore } = require('../utils/ai');
const router = express.Router();

// Get all active jobs with filters
router.get('/', async (req, res) => {
  try {
    console.log('🔍 GET /api/jobs - Request received');
    console.log('🔍 Query parameters:', req.query);
    
    const {
      search,
      location,
      type,
      experience,
      remote,
      skills
    } = req.query;

    const filters = {};
    
    if (location) filters.location = new RegExp(location, 'i');
    if (type) filters.type = type;
    if (experience) filters.experience = experience;
    if (remote !== undefined) filters.remote = remote === 'true';
    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      filters.skills = { $in: skillArray };
    }

    const searchQuery = {
      status: 'active',
      ...filters
    };

    if (search) {
      searchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('🔍 Final search query:', JSON.stringify(searchQuery, null, 2));
    
    const jobs = await Job.find(searchQuery)
      .populate('employer', 'name company profileImage')
      .sort({ createdAt: -1 });

    console.log('✅ Jobs found:', jobs.length);
    console.log('📋 Job titles:', jobs.map(j => j.title));
    console.log('📋 Job IDs:', jobs.map(j => j._id));

    res.json({
      jobs,
      total: jobs.length
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employer', 'name company profileImage linkedinUrl')
      .populate('applications.applicant', 'name email profileImage skills');

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment views
    await job.incrementViews();

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Create new job
router.post('/', auth, async (req, res) => {
  try {
    console.log('🔍 Received job creation request');
    console.log('🔍 Request body:', req.body);
    console.log('🔍 User ID:', req.user.userId);
    
    const {
      title,
      description,
      company,
      location,
      remote,
      type,
      experience,
      skills,
      budget,
      benefits,
      requirements,
      responsibilities,
      tags
    } = req.body;

    // Check if user is employer
    const user = await User.findById(req.user.userId);
    console.log('🔍 User found:', user ? 'Yes' : 'No');
    console.log('🔍 User isEmployer:', user?.isEmployer);
    console.log('🔍 User walletAddress:', user?.walletAddress);
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.isEmployer) {
      console.log('❌ User is not an employer');
      return res.status(403).json({ error: 'Only employers can post jobs' });
    }

    // Temporarily disable wallet requirement for testing
    // Check if user has connected wallet
    // if (!user.walletAddress) {
    //   console.log('❌ User has no wallet address');
    //   return res.status(400).json({ error: 'Please connect your wallet first' });
    // }

    // Convert type and experience to valid enum values
    let jobType = 'full-time';
    if (type) {
      const typeLower = type.toLowerCase();
      if (typeLower.includes('part')) jobType = 'part-time';
      else if (typeLower.includes('contract')) jobType = 'contract';
      else if (typeLower.includes('intern')) jobType = 'internship';
      else if (typeLower.includes('freelance')) jobType = 'freelance';
      else jobType = 'full-time';
    }

    let jobExperience = 'entry';
    if (experience) {
      const expLower = experience.toLowerCase();
      if (expLower.includes('senior')) jobExperience = 'senior';
      else if (expLower.includes('mid') || expLower.includes('middle')) jobExperience = 'mid';
      else if (expLower.includes('executive')) jobExperience = 'executive';
      else jobExperience = 'entry';
    }

    // Validate and process data
    const processedData = {
      title,
      description,
      employer: req.user.userId,
      company,
      location,
      remote: remote || false,
      type: jobType,
      experience: jobExperience,
      skills: Array.isArray(skills) ? skills.filter(s => s.trim()) : [],
      budget: {
        min: budget?.min ? parseInt(budget.min) : 0,
        max: budget?.max ? parseInt(budget.max) : 0,
        currency: budget?.currency || 'USD'
      },
      benefits: Array.isArray(benefits) ? benefits.filter(b => b.trim()) : [],
      requirements: Array.isArray(requirements) ? requirements.join('\n') : (requirements || ''),
      responsibilities: Array.isArray(responsibilities) ? responsibilities.join('\n') : (responsibilities || ''),
      tags: Array.isArray(tags) ? tags.filter(t => t.trim()) : [],
      status: 'active'
    };

    console.log('🔍 Processed data:', processedData);

    // Create job with active status
    const job = new Job({
      ...processedData,
      status: 'active'
    });

    console.log('🔍 Attempting to save job...');
    await job.save();
    console.log('✅ Job saved successfully');

    // Update user stats immediately
    user.stats.jobsPosted += 1;
    await user.save();
    console.log('✅ User stats updated');

    res.status(201).json({
      message: 'Job posted successfully!',
      job
    });
  } catch (error) {
    console.error('❌ Create job error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    // Log validation errors if they exist
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      console.error('❌ Validation errors:', validationErrors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    // Log other types of errors
    if (error.code) {
      console.error('❌ MongoDB error code:', error.code);
    }
    
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Apply for a job
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const { coverLetter, resume } = req.body;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'active') {
      return res.status(400).json({ error: 'Job is not active' });
    }

    // Check if already applied
    const alreadyApplied = job.applications.some(
      app => app.applicant.toString() === req.user.userId
    );

    if (alreadyApplied) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    // Get user for match score calculation
    const user = await User.findById(req.user.userId);
    
    // Calculate match score using AI
    const matchScore = await calculateMatchScore(job, user);

    // Add application
    await job.addApplication(req.user.userId, coverLetter, resume, matchScore);

    // Update user stats
    user.stats.jobsApplied += 1;
    await user.save();

    res.json({
      message: 'Application submitted successfully',
      matchScore
    });
  } catch (error) {
    console.error('Apply job error:', error);
    res.status(500).json({ error: 'Failed to apply for job' });
  }
});

// Get user's posted jobs
router.get('/my/posted', auth, async (req, res) => {
  try {
    const jobs = await Job.find({ employer: req.user.userId })
      .populate('applications.applicant', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error('Get posted jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch posted jobs' });
  }
});

// Get user's applied jobs
router.get('/my/applied', auth, async (req, res) => {
  try {
    const jobs = await Job.find({
      'applications.applicant': req.user.userId
    })
    .populate('employer', 'name company profileImage')
    .sort({ 'applications.appliedAt': -1 });

    res.json({ jobs });
  } catch (error) {
    console.error('Get applied jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch applied jobs' });
  }
});

// Update job status (employer only)
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const jobId = req.params.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user is the employer
    if (job.employer.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    job.status = status;
    await job.save();

    res.json({
      message: 'Job status updated successfully',
      job
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.status(500).json({ error: 'Failed to update job status' });
  }
});

// Update application status (employer only)
router.put('/:id/applications/:applicationId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const { id: jobId, applicationId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if user is the employer
    if (job.employer.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await job.updateApplicationStatus(applicationId, status);

    res.json({
      message: 'Application status updated successfully'
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Search jobs with AI recommendations
router.get('/search/recommended', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const { limit = 5 } = req.query;

    // Get user's skills for recommendation
    const userSkills = user.skills || [];
    
    // Find jobs that match user's skills
    const recommendedJobs = await Job.find({
      status: 'active',
      expiresAt: { $gt: new Date() },
      skills: { $in: userSkills }
    })
    .populate('employer', 'name company profileImage')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

    res.json({ jobs: recommendedJobs });
  } catch (error) {
    console.error('Get recommended jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch recommended jobs' });
  }
});

// Get job statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ 
      status: 'active'
    });
    const totalApplications = await Job.aggregate([
      { $match: { 
        status: 'active'
      }},
      { $group: { _id: null, total: { $sum: '$applicationsCount' } } }
    ]);

    const recentJobs = await Job.find({ 
      status: 'active'
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employer', 'name company');

    res.json({
      totalJobs,
      totalApplications: totalApplications[0]?.total || 0,
      recentJobs
    });
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({ error: 'Failed to fetch job statistics' });
  }
});

// Get employer job statistics
router.get('/stats/employer', auth, async (req, res) => {
  try {
    const employerId = req.user.userId;
    
    // Count jobs by status
    const totalJobs = await Job.countDocuments({ employer: employerId });
    const activeJobs = await Job.countDocuments({ 
      employer: employerId,
      status: 'active'
    });
    const pendingJobs = await Job.countDocuments({ 
      employer: employerId,
      status: 'draft'
    });
    const totalApplications = await Job.aggregate([
      { $match: { employer: employerId } },
      { $group: { _id: null, total: { $sum: '$applicationsCount' } } }
    ]);

    res.json({
      totalJobs,
      activeJobs,
      pendingJobs,
      totalApplications: totalApplications[0]?.total || 0
    });
  } catch (error) {
    console.error('Get employer job stats error:', error);
    res.status(500).json({ error: 'Failed to fetch employer job statistics' });
  }
});

// Debug route to check all jobs in database
router.get('/debug/all', async (req, res) => {
  try {
    console.log('🔍 DEBUG: Getting ALL jobs from database...');
    
    // Get all jobs without any filtering
    const allJobs = await Job.find({});
    console.log('🔍 DEBUG: Total jobs in database:', allJobs.length);
    
    // Get active jobs
    const activeJobs = await Job.find({ status: 'active' });
    console.log('🔍 DEBUG: Active jobs in database:', activeJobs.length);
    

    
    // Get jobs that match our search criteria
    const searchJobs = await Job.find({ 
      status: 'active'
    });
    console.log('🔍 DEBUG: Jobs matching search criteria:', searchJobs.length);
    
    res.json({
      totalJobs: allJobs.length,
      activeJobs: activeJobs.length,
      completedJobs: completedJobs.length,
      searchJobs: searchJobs.length,
      sampleJobs: allJobs.slice(0, 5).map(j => ({ 
        id: j._id, 
        title: j.title, 
        status: j.status, 
        createdAt: j.createdAt
      }))
    });
  } catch (error) {
    console.error('DEBUG route error:', error);
    res.status(500).json({ error: 'Debug route failed' });
  }
});

module.exports = router; 
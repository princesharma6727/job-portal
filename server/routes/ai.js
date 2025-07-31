const express = require('express');
const natural = require('natural');
const nlp = require('compromise');
const multer = require('multer');
const User = require('../models/User');
const Job = require('../models/Job');
const auth = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
    }
  }
});

// Initialize tokenizer
const tokenizer = new natural.WordTokenizer();

// Extract skills from text using NLP
router.post('/extract-skills', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Common tech skills dictionary
    const techSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
      'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'C++', 'C#', 'Swift',
      'Kotlin', 'Dart', 'Flutter', 'React Native', 'MongoDB', 'PostgreSQL',
      'MySQL', 'Redis', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
      'Git', 'GitHub', 'CI/CD', 'REST API', 'GraphQL', 'Microservices',
      'Machine Learning', 'AI', 'Data Science', 'Blockchain', 'Web3',
      'Solidity', 'Smart Contracts', 'Ethereum', 'Bitcoin', 'NFT',
      'UI/UX', 'Figma', 'Adobe XD', 'Sketch', 'HTML', 'CSS', 'SASS',
      'Bootstrap', 'Tailwind CSS', 'WordPress', 'Shopify', 'SEO', 'SEM',
      'Google Analytics', 'Tableau', 'Power BI', 'Excel', 'SQL',
      'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Slack',
      'Zoom', 'Microsoft Teams', 'Salesforce', 'HubSpot', 'Zapier'
    ];

    // Process text with compromise
    const doc = nlp(text);
    
    // Extract nouns and proper nouns (likely skills)
    const nouns = doc.nouns().out('array');
    const properNouns = doc.match('#ProperNoun').out('array');
    
    // Combine and filter
    let extractedSkills = [...nouns, ...properNouns];
    
    // Filter for tech skills
    const matchedSkills = techSkills.filter(skill => 
      extractedSkills.some(extracted => 
        extracted.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(extracted.toLowerCase())
      )
    );

    // Add any skills that appear in the text
    const textLower = text.toLowerCase();
    const additionalSkills = techSkills.filter(skill => 
      textLower.includes(skill.toLowerCase())
    );

    // Combine and remove duplicates
    const allSkills = [...new Set([...matchedSkills, ...additionalSkills])];

    res.json({
      skills: allSkills.slice(0, 10), // Limit to top 10
      confidence: allSkills.length > 0 ? 0.8 : 0.3
    });
  } catch (error) {
    console.error('Extract skills error:', error);
    res.status(500).json({ error: 'Failed to extract skills' });
  }
});

// Extract skills from uploaded resume
router.post('/extract-skills-resume', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    // Common tech skills dictionary
    const techSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
      'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'C++', 'C#', 'Swift',
      'Kotlin', 'Dart', 'Flutter', 'React Native', 'MongoDB', 'PostgreSQL',
      'MySQL', 'Redis', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
      'Git', 'GitHub', 'CI/CD', 'REST API', 'GraphQL', 'Microservices',
      'Machine Learning', 'AI', 'Data Science', 'Blockchain', 'Web3',
      'Solidity', 'Smart Contracts', 'Ethereum', 'Bitcoin', 'NFT',
      'UI/UX', 'Figma', 'Adobe XD', 'Sketch', 'HTML', 'CSS', 'SASS',
      'Bootstrap', 'Tailwind CSS', 'WordPress', 'Shopify', 'SEO', 'SEM',
      'Google Analytics', 'Tableau', 'Power BI', 'Excel', 'SQL',
      'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Slack',
      'Zoom', 'Microsoft Teams', 'Salesforce', 'HubSpot', 'Zapier'
    ];

    // Convert file buffer to text (simplified - in production you'd use a proper PDF/DOC parser)
    let text = '';
    
    if (req.file.mimetype === 'application/pdf') {
      // For PDF files, we'll extract text from the buffer
      // In a real implementation, you'd use a library like pdf-parse
      text = req.file.buffer.toString('utf8');
    } else {
      // For DOC/DOCX files, convert buffer to text
      text = req.file.buffer.toString('utf8');
    }

    // Process text with compromise
    const doc = nlp(text);
    
    // Extract nouns and proper nouns (likely skills)
    const nouns = doc.nouns().out('array');
    const properNouns = doc.match('#ProperNoun').out('array');
    
    // Combine and filter
    let extractedSkills = [...nouns, ...properNouns];
    
    // Filter for tech skills
    const matchedSkills = techSkills.filter(skill => 
      extractedSkills.some(extracted => 
        extracted.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(extracted.toLowerCase())
      )
    );

    // Add any skills that appear in the text
    const textLower = text.toLowerCase();
    const additionalSkills = techSkills.filter(skill => 
      textLower.includes(skill.toLowerCase())
    );

    // Combine and remove duplicates
    const allSkills = [...new Set([...matchedSkills, ...additionalSkills])];

    res.json({
      skills: allSkills.slice(0, 10), // Limit to top 10
      confidence: allSkills.length > 0 ? 0.8 : 0.3,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Extract skills from resume error:', error);
    res.status(500).json({ error: 'Failed to extract skills from resume' });
  }
});

// Calculate job-candidate match score
router.post('/match-score', auth, async (req, res) => {
  try {
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    const user = await User.findById(req.user.userId);

    if (!job || !user) {
      return res.status(404).json({ error: 'Job or user not found' });
    }

    const matchScore = await calculateMatchScore(job, user);

    res.json({
      matchScore,
      breakdown: {
        skillsMatch: Math.round((job.skills || []).filter(skill => (user.skills || []).includes(skill)).length / (job.skills || []).length * 100),
        experienceMatch: calculateExperienceMatch(job.experience, user.experience),
        locationMatch: calculateLocationMatch(job, user),
        overallScore: matchScore
      }
    });
  } catch (error) {
    console.error('Calculate match score error:', error);
    res.status(500).json({ error: 'Failed to calculate match score' });
  }
});

// Get personalized job recommendations
router.get('/recommendations', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const { limit = 10 } = req.query;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userSkills = user.skills || [];
    const userExperience = user.experience;
    const userLocation = user.location;

    // Find jobs that match user's profile
    let query = {
      status: 'active',
      expiresAt: { $gt: new Date() }
    };

    // Add skill-based filtering
    if (userSkills.length > 0) {
      query.skills = { $in: userSkills };
    }

    // Add experience-based filtering
    if (userExperience) {
      const experienceLevels = ['entry', 'mid', 'senior', 'executive'];
      const userLevelIndex = experienceLevels.indexOf(userExperience);
      const suitableLevels = experienceLevels.slice(0, userLevelIndex + 1);
      query.experience = { $in: suitableLevels };
    }

    // Add location-based filtering
    if (userLocation) {
      query.$or = [
        { location: new RegExp(userLocation, 'i') },
        { remote: true }
      ];
    }

    const recommendedJobs = await Job.find(query)
      .populate('employer', 'name company profileImage')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Calculate match scores for each job
    const jobsWithScores = await Promise.all(
      recommendedJobs.map(async (job) => {
        const matchScore = await calculateMatchScore(job, user);
        return {
          ...job.toObject(),
          matchScore: matchScore
        };
      })
    );

    // Sort by match score
    jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      recommendations: jobsWithScores,
      userProfile: {
        skills: userSkills,
        experience: userExperience,
        location: userLocation
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get skill suggestions based on user input
router.post('/skill-suggestions', auth, async (req, res) => {
  try {
    const { partialSkill } = req.body;

    if (!partialSkill) {
      return res.status(400).json({ error: 'Partial skill is required' });
    }

    // Common tech skills
    const allSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
      'TypeScript', 'PHP', 'Ruby', 'Go', 'Rust', 'C++', 'C#', 'Swift',
      'Kotlin', 'Dart', 'Flutter', 'React Native', 'MongoDB', 'PostgreSQL',
      'MySQL', 'Redis', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
      'Git', 'GitHub', 'CI/CD', 'REST API', 'GraphQL', 'Microservices',
      'Machine Learning', 'AI', 'Data Science', 'Blockchain', 'Web3',
      'Solidity', 'Smart Contracts', 'Ethereum', 'Bitcoin', 'NFT',
      'UI/UX', 'Figma', 'Adobe XD', 'Sketch', 'HTML', 'CSS', 'SASS',
      'Bootstrap', 'Tailwind CSS', 'WordPress', 'Shopify', 'SEO', 'SEM',
      'Google Analytics', 'Tableau', 'Power BI', 'Excel', 'SQL',
      'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence', 'Slack',
      'Zoom', 'Microsoft Teams', 'Salesforce', 'HubSpot', 'Zapier'
    ];

    // Filter skills that match the partial input
    const suggestions = allSkills.filter(skill =>
      skill.toLowerCase().includes(partialSkill.toLowerCase())
    );

    res.json({
      suggestions: suggestions.slice(0, 10) // Limit to 10 suggestions
    });
  } catch (error) {
    console.error('Get skill suggestions error:', error);
    res.status(500).json({ error: 'Failed to get skill suggestions' });
  }
});

// Analyze job market trends
router.get('/market-trends', async (req, res) => {
  try {
    // Get popular skills from active jobs
    const activeJobs = await Job.find({ status: 'active' });
    
    const skillCounts = {};
    activeJobs.forEach(job => {
      job.skills.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    // Sort by frequency
    const popularSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Get job type distribution
    const jobTypeCounts = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get experience level distribution
    const experienceCounts = await Job.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$experience', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      popularSkills,
      jobTypeDistribution: jobTypeCounts,
      experienceDistribution: experienceCounts,
      totalActiveJobs: activeJobs.length
    });
  } catch (error) {
    console.error('Get market trends error:', error);
    res.status(500).json({ error: 'Failed to get market trends' });
  }
});

// Helper functions for match score calculation
function calculateExperienceMatch(jobExperience, userExperience) {
  const experienceLevels = ['entry', 'mid', 'senior', 'executive'];
  const jobLevelIndex = experienceLevels.indexOf(jobExperience);
  const userLevelIndex = experienceLevels.indexOf(userExperience);
  
  if (userLevelIndex >= jobLevelIndex) {
    return 100;
  } else if (userLevelIndex === jobLevelIndex - 1) {
    return 75;
  } else if (userLevelIndex === jobLevelIndex - 2) {
    return 50;
  } else {
    return 25;
  }
}

function calculateLocationMatch(job, user) {
  if (job.remote) {
    return 100;
  } else if (user.location && job.location) {
    const userLocationLower = user.location.toLowerCase();
    const jobLocationLower = job.location.toLowerCase();
    
    if (userLocationLower.includes(jobLocationLower) || 
        jobLocationLower.includes(userLocationLower)) {
      return 100;
    } else if (userLocationLower.includes('remote') || 
               jobLocationLower.includes('remote')) {
      return 80;
    }
  }
  return 0;
}

// Helper function to calculate match score
async function calculateMatchScore(job, user) {
  try {
    const jobSkills = job.skills || [];
    const userSkills = user.skills || [];
    
    // Calculate skills match
    const commonSkills = jobSkills.filter(skill => 
      userSkills.includes(skill)
    );
    const skillsMatch = jobSkills.length > 0 
      ? (commonSkills.length / jobSkills.length) * 100 
      : 0;

    // Calculate experience match
    const experienceLevels = ['entry', 'mid', 'senior', 'executive'];
    const jobLevelIndex = experienceLevels.indexOf(job.experience);
    const userLevelIndex = experienceLevels.indexOf(user.experience);
    
    let experienceMatch = 0;
    if (userLevelIndex >= jobLevelIndex) {
      experienceMatch = 100;
    } else if (userLevelIndex === jobLevelIndex - 1) {
      experienceMatch = 75;
    } else if (userLevelIndex === jobLevelIndex - 2) {
      experienceMatch = 50;
    } else {
      experienceMatch = 25;
    }

    // Calculate location match
    let locationMatch = 0;
    if (job.remote) {
      locationMatch = 100;
    } else if (user.location && job.location) {
      const userLocationLower = user.location.toLowerCase();
      const jobLocationLower = job.location.toLowerCase();
      
      if (userLocationLower.includes(jobLocationLower) || 
          jobLocationLower.includes(userLocationLower)) {
        locationMatch = 100;
      } else if (userLocationLower.includes('remote') || 
                 jobLocationLower.includes('remote')) {
        locationMatch = 80;
      }
    }

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      (skillsMatch * 0.5) + (experienceMatch * 0.3) + (locationMatch * 0.2)
    );

    return Math.max(0, Math.min(100, overallScore));
  } catch (error) {
    console.error('Calculate match score error:', error);
    return 0;
  }
}

module.exports = router; 
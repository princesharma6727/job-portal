const natural = require('natural');
const nlp = require('compromise');

// Calculate match score between job and candidate
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

// Extract skills from text using NLP
function extractSkillsFromText(text) {
  try {
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

    return {
      skills: allSkills.slice(0, 10), // Limit to top 10
      confidence: allSkills.length > 0 ? 0.8 : 0.3
    };
  } catch (error) {
    console.error('Extract skills error:', error);
    return {
      skills: [],
      confidence: 0
    };
  }
}

// Get skill suggestions based on partial input
function getSkillSuggestions(partialSkill) {
  try {
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

    return suggestions.slice(0, 10); // Limit to 10 suggestions
  } catch (error) {
    console.error('Get skill suggestions error:', error);
    return [];
  }
}

// Analyze job description for key insights
function analyzeJobDescription(description) {
  try {
    const doc = nlp(description);
    
    // Extract key phrases
    const keyPhrases = doc.match('#Noun+').out('array');
    
    // Extract requirements (sentences with "must", "should", "require")
    const requirements = doc.match('(must|should|require|need) #Verb+').out('array');
    
    // Extract benefits (sentences with "benefits", "perks", "offer")
    const benefits = doc.match('(benefits|perks|offer|provide) #Noun+').out('array');
    
    // Calculate complexity score based on text length and technical terms
    const technicalTerms = ['API', 'database', 'framework', 'library', 'algorithm', 'architecture'];
    const technicalTermCount = technicalTerms.filter(term => 
      description.toLowerCase().includes(term.toLowerCase())
    ).length;
    
    const complexityScore = Math.min(100, (technicalTermCount / 5) * 100);
    
    return {
      keyPhrases: keyPhrases.slice(0, 10),
      requirements: requirements.slice(0, 5),
      benefits: benefits.slice(0, 5),
      complexityScore: Math.round(complexityScore),
      wordCount: description.split(' ').length
    };
  } catch (error) {
    console.error('Analyze job description error:', error);
    return {
      keyPhrases: [],
      requirements: [],
      benefits: [],
      complexityScore: 0,
      wordCount: 0
    };
  }
}

module.exports = {
  calculateMatchScore,
  extractSkillsFromText,
  getSkillSuggestions,
  analyzeJobDescription
}; 
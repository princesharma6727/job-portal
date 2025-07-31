import React, { useState, useEffect } from 'react';
import { User, Save, Edit, Upload, Brain, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import axios from 'axios';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, getCurrentUser } = useAuth();
  const { connectWallet, isConnected, account, isMetaMaskInstalled, getBalance } = useWeb3();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    skills: [],
    experience: '',
    company: '',
    website: '',
    linkedinUrl: '',
    github: '',
    twitter: ''
  });
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [errors, setErrors] = useState({});
  const [walletBalance, setWalletBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  
  // AI features state
  const [resumeFile, setResumeFile] = useState(null);
  const [extractingSkills, setExtractingSkills] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  // Refresh user data on component mount
  useEffect(() => {
    const refreshUserData = async () => {
      if (user) {
        await getCurrentUser();
      }
    };
    refreshUserData();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        skills: user.skills || [],
        experience: user.experience || '',
        company: user.company || '',
        website: user.website || '',
        linkedinUrl: user.linkedinUrl || '',
        github: user.socialLinks?.github || '',
        twitter: user.socialLinks?.twitter || ''
      });
    }
  }, [user]);

  // Reset form data when user data changes (after save)
  useEffect(() => {
    if (user && !editing) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        skills: user.skills || [],
        experience: user.experience || '',
        company: user.company || '',
        website: user.website || '',
        linkedinUrl: user.linkedinUrl || '',
        github: user.socialLinks?.github || '',
        twitter: user.socialLinks?.twitter || ''
      });
    }
  }, [user, editing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Real-time profile completion calculation
  const realTimeProfileCompletion = () => {
    const fields = ['name', 'bio', 'skills', 'location', 'linkedinUrl'];
    const completed = fields.filter(field => {
      if (field === 'skills') return formData.skills.length > 0;
      return formData[field] && formData[field].trim();
    }).length;
    return Math.round((completed / fields.length) * 100);
  };

  // Calculate completion based on saved user data (for consistency with dashboard)
  const savedProfileCompletion = () => {
    const fields = ['name', 'bio', 'skills', 'location', 'linkedinUrl'];
    const completed = fields.filter(field => {
      if (field === 'skills') return user?.skills?.length > 0;
      return user?.[field] && user[field].trim();
    }).length;
    
    console.log('Profile completion calculation:', {
      fields,
      userData: {
        name: user?.name,
        bio: user?.bio,
        skills: user?.skills,
        location: user?.location,
        linkedinUrl: user?.linkedinUrl
      },
      completed,
      percentage: Math.round((completed / fields.length) * 100)
    });
    
    return Math.round((completed / fields.length) * 100);
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  // AI Skill Extraction Functions
  const extractSkillsFromBio = async () => {
    if (!formData.bio.trim()) {
      toast.error('Please add a bio first to extract skills');
      return;
    }

    setExtractingSkills(true);
    try {
      const response = await axios.post('/api/ai/extract-skills', {
        text: formData.bio
      });

      const extractedSkills = response.data.skills.filter(
        skill => !formData.skills.includes(skill)
      );

      if (extractedSkills.length > 0) {
        setAiSuggestions(extractedSkills);
        setShowAiSuggestions(true);
        toast.success(`Found ${extractedSkills.length} skills from your bio!`);
      } else {
        toast.info('No new skills found in your bio');
      }
    } catch (error) {
      console.error('Error extracting skills:', error);
      toast.error('Failed to extract skills from bio');
    } finally {
      setExtractingSkills(false);
    }
  };

  const extractSkillsFromResume = async () => {
    if (!resumeFile) {
      toast.error('Please upload a resume first');
      return;
    }

    setExtractingSkills(true);
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await axios.post('/api/ai/extract-skills-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const extractedSkills = response.data.skills.filter(
        skill => !(formData.skills || []).includes(skill)
      );

      if (extractedSkills.length > 0) {
        setAiSuggestions(extractedSkills);
        setShowAiSuggestions(true);
        toast.success(`Found ${extractedSkills.length} skills from your resume!`);
      } else {
        toast.info('No new skills found in your resume');
      }
    } catch (error) {
      console.error('Error extracting skills from resume:', error);
      toast.error('Failed to extract skills from resume');
    } finally {
      setExtractingSkills(false);
    }
  };

  const addAiSuggestion = (skill) => {
    if (!(formData.skills || []).includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skill]
      }));
      setAiSuggestions(prev => prev.filter(s => s !== skill));
    }
  };

  const addAllAiSuggestions = () => {
    const newSkills = aiSuggestions.filter(skill => !(formData.skills || []).includes(skill));
    setFormData(prev => ({
      ...prev,
      skills: [...(prev.skills || []), ...newSkills]
    }));
    setAiSuggestions([]);
    setShowAiSuggestions(false);
    toast.success(`Added ${newSkills.length} skills to your profile!`);
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Resume file size must be less than 5MB');
        return;
      }
      setResumeFile(file);
      toast.success('Resume uploaded successfully!');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      // Map form data to backend expectations
      const profileData = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        skills: formData.skills,
        experience: formData.experience,
        company: formData.company,
        website: formData.website,
        linkedinUrl: formData.linkedinUrl,
        socialLinks: {
          github: formData.github,
          twitter: formData.twitter
        }
      };

      console.log('Sending profile data:', profileData);
      const result = await updateProfile(profileData);
      console.log('Profile update result:', result);
      
      if (result.success) {
        setEditing(false);
        // Force refresh user data to ensure consistency
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
      toast.success('Wallet connected successfully!');
    } catch (error) {
      toast.error('Failed to connect wallet');
    }
  };

  const addTestWallet = async () => {
    try {
      const testAddress = '0x739C1E478FE21cBFA35fB9E06702ee56F42f52Ca';
      await axios.put('/api/auth/wallet', { walletAddress: testAddress });
      toast.success('Wallet address added successfully!');
      // Refresh the page to show the new wallet address
      window.location.reload();
    } catch (error) {
      console.error('Error adding wallet:', error);
      toast.error('Failed to add wallet address');
    }
  };

  const fetchWalletBalance = async () => {
    if (!isConnected || !account) return;
    
    setLoadingBalance(true);
    try {
      const balance = await getBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch wallet balance');
    } finally {
      setLoadingBalance(false);
    }
  };

  // Fetch balance when wallet connects
  useEffect(() => {
    if (isConnected && account) {
      fetchWalletBalance();
    }
  }, [isConnected, account]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-primary-600" />
              <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              {editing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              {editing ? 'Save' : 'Edit Profile'}
            </button>
          </div>
          
          {/* Profile Completion */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Profile Completion</span>
              <span className="text-sm font-medium text-gray-900">
                {editing ? realTimeProfileCompletion() : savedProfileCompletion()}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${editing ? realTimeProfileCompletion() : savedProfileCompletion()}%` }}
              ></div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } ${!editing ? 'bg-gray-50' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } ${!editing ? 'bg-gray-50' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent border-gray-300 ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                  placeholder="e.g., New York, NY"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent border-gray-300 ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                >
                  <option value="">Select experience level</option>
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!editing}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent border-gray-300 ${
                  !editing ? 'bg-gray-50' : ''
                }`}
                placeholder="Tell us about yourself, your experience, and what you're looking for..."
              />
            </div>
          </div>

          {/* Skills with AI Enhancement */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
              {editing && (
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={extractSkillsFromBio}
                    disabled={extractingSkills || !formData.bio.trim()}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    {extractingSkills ? 'Extracting...' : 'Extract from Bio'}
                  </button>
                  <button
                    type="button"
                    onClick={extractSkillsFromResume}
                    disabled={extractingSkills || !resumeFile}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {extractingSkills ? 'Extracting...' : 'Extract from Resume'}
                  </button>
                </div>
              )}
            </div>
            
            {/* AI Suggestions */}
            {showAiSuggestions && aiSuggestions.length > 0 && editing && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      AI Suggested Skills
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addAllAiSuggestions}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Add All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.map((skill, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addAiSuggestion(skill)}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    {skill}
                    {editing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
            
            {editing && (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Add a skill"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          {/* Resume Upload */}
          {editing && (
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume Upload</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="text-sm text-gray-600 mb-4">
                  <p>Upload your resume to extract skills automatically</p>
                  <p className="text-xs text-gray-500 mt-1">Supports PDF, DOC, DOCX (max 5MB)</p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {resumeFile ? resumeFile.name : 'Choose Resume'}
                </label>
                {resumeFile && (
                  <p className="text-sm text-green-600 mt-2">
                    ✓ {resumeFile.name} uploaded
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Professional Information */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent border-gray-300 ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                  placeholder="Enter your current company"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent border-gray-300 ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Links</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent border-gray-300 ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GitHub
                </label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent border-gray-300 ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                  placeholder="https://github.com/username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent border-gray-300 ${
                    !editing ? 'bg-gray-50' : ''
                  }`}
                  placeholder="https://twitter.com/username"
                />
              </div>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Wallet Connection</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">MetaMask Wallet</p>
                  <p className="text-sm text-gray-600">
                    {isConnected ? `Connected: ${account?.slice(0, 6)}...${account?.slice(-4)}` : 'Not connected'}
                  </p>
                </div>
                
                {!isMetaMaskInstalled() ? (
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-md text-sm font-medium bg-orange-600 text-white hover:bg-orange-700"
                  >
                    Install MetaMask
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={handleWalletConnect}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                      isConnected 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {isConnected ? 'Connected' : 'Connect Wallet'}
                  </button>
                )}
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Test Wallet Address</p>
                    <p className="text-sm text-gray-600">
                      {user?.walletAddress ? `Added: ${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'No wallet address added'}
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={addTestWallet}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-orange-600 text-white hover:bg-orange-700"
                  >
                    Add Test Wallet
                  </button>
                </div>
              </div>

              {/* Wallet Balance Section */}
              {isConnected && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Wallet Balance</p>
                      <p className="text-sm text-gray-600">
                        {loadingBalance ? 'Loading...' : walletBalance ? `${walletBalance} ETH` : 'Not available'}
                      </p>
                    </div>
                    
                    <button
                      type="button"
                      onClick={fetchWalletBalance}
                      disabled={loadingBalance}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loadingBalance ? 'Loading...' : 'Refresh Balance'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          {editing && (
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import toast from 'react-hot-toast';
import axios from 'axios';

const PostJob = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected } = useWeb3();
  
  // Check if user is logged in and is an employer
  useEffect(() => {
    if (!user) {
      toast.error('Please log in to post a job');
      navigate('/login');
      return;
    }
    
    if (!user.isEmployer) {
      toast.error('Only employers can post jobs. Please update your profile.');
      navigate('/profile');
      return;
    }
    
    // Temporarily disable wallet requirement for testing
    // if (!isConnected) {
    //   toast.error('Please connect your wallet to post a job');
    //   navigate('/dashboard');
    //   return;
    // }
  }, [user, isConnected, navigate]);
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    experience: 'Entry',
    description: '',
    requirements: [''],
    responsibilities: [''],
    benefits: [''],
    skills: [''],
    budget: {
      min: '',
      max: '',
      currency: 'USD'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBudgetChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        [field]: value
      }
    }));
  };

  const handleArrayFieldChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    console.log('🔍 Starting form validation');
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
      console.log('❌ Title validation failed');
    }
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
      console.log('❌ Company validation failed');
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
      console.log('❌ Location validation failed');
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required';
      console.log('❌ Description validation failed');
    }
    
    // Validate skills array
    const validSkills = formData.skills.filter(skill => skill.trim());
    if (validSkills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }
    
    // Validate requirements array
    const validRequirements = formData.requirements.filter(req => req.trim());
    if (validRequirements.length === 0) {
      newErrors.requirements = 'At least one requirement is required';
    }
    
    // Validate responsibilities array
    const validResponsibilities = formData.responsibilities.filter(resp => resp.trim());
    if (validResponsibilities.length === 0) {
      newErrors.responsibilities = 'At least one responsibility is required';
    }
    
    if (formData.budget.min && formData.budget.max) {
      if (parseInt(formData.budget.min) > parseInt(formData.budget.max)) {
        newErrors.budget = 'Minimum salary cannot be greater than maximum salary';
      }
    }
    
    console.log('🔍 Validation complete. Errors found:', Object.keys(newErrors).length);
    console.log('🔍 Validation errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const errorCount = Object.keys(errors).length;
      toast.error(`Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} in the form`);
      return;
    }

    setLoading(true);
    try {
      const jobData = {
        ...formData,
        requirements: formData.requirements.filter(req => req.trim()),
        responsibilities: formData.responsibilities.filter(resp => resp.trim()),
        benefits: formData.benefits.filter(benefit => benefit.trim()),
        skills: formData.skills.filter(skill => skill.trim())
      };
      
      const response = await axios.post('/api/jobs', jobData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Job posted successfully:', response.data);

      toast.success('Job posted successfully! Redirecting to payment...');
      
      // Redirect to payment page with the job ID
      navigate(`/payment/${response.data.job._id}`);
    } catch (error) {
      console.error('❌ Error creating job:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        toast.error('Please log in to post a job');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('Only employers can post jobs. Please update your profile.');
        navigate('/profile');
      } else if (error.response?.status === 400) {
        const errorData = error.response?.data;
        console.error('❌ 400 Error details:', errorData);
        
        if (errorData?.details && Array.isArray(errorData.details)) {
          // Show validation errors
          const errorMessages = errorData.details.map(detail => detail.message).join(', ');
          toast.error(`Validation errors: ${errorMessages}`);
        } else {
          const errorMessage = errorData?.error || 'Please check your form data';
          toast.error(errorMessage);
        }
      } else {
        toast.error('Failed to create job. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Briefcase className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Post a New Job</h1>
          </div>
          <p className="text-gray-600">
            Create a compelling job listing to attract the best candidates for your position.
          </p>

        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Senior React Developer"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.company ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., RizeOS Technologies"
                />
                {errors.company && (
                  <p className="mt-2 text-sm text-red-600">{errors.company}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.location ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., New York, NY or Remote"
                />
                {errors.location && (
                  <p className="mt-2 text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Entry">Entry Level</option>
                  <option value="Mid">Mid Level</option>
                  <option value="Senior">Senior Level</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Description</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Provide a detailed description of the role, responsibilities, and what makes this position exciting..."
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
            
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleArrayFieldChange('requirements', index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., 3+ years of React experience"
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('requirements', index)}
                    className="p-3 text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addArrayField('requirements')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Requirement
            </button>
            
            {errors.requirements && (
              <p className="mt-2 text-sm text-red-600">{errors.requirements}</p>
            )}
          </div>

          {/* Responsibilities */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Responsibilities</h2>
            
            {formData.responsibilities.map((resp, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => handleArrayFieldChange('responsibilities', index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Develop and maintain React applications"
                />
                {formData.responsibilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('responsibilities', index)}
                    className="p-3 text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addArrayField('responsibilities')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Responsibility
            </button>
            
            {errors.responsibilities && (
              <p className="mt-2 text-sm text-red-600">{errors.responsibilities}</p>
            )}
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Benefits</h2>
            
            {formData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleArrayFieldChange('benefits', index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Health insurance, flexible work hours"
                />
                {formData.benefits.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('benefits', index)}
                    className="p-3 text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addArrayField('benefits')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Benefit
            </button>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Required Skills</h2>
            
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleArrayFieldChange('skills', index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., React, JavaScript, TypeScript"
                />
                {formData.skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('skills', index)}
                    className="p-3 text-red-600 hover:text-red-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addArrayField('skills')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </button>
            
            {errors.skills && (
              <p className="mt-2 text-sm text-red-600">{errors.skills}</p>
            )}
          </div>

          {/* Salary Range */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Salary Range (Optional)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  value={formData.budget.min}
                  onChange={(e) => handleBudgetChange('min', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  value={formData.budget.max}
                  onChange={(e) => handleBudgetChange('max', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="80000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={formData.budget.currency}
                  onChange={(e) => handleBudgetChange('currency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>
            
            {errors.budget && (
              <p className="mt-2 text-sm text-red-600">{errors.budget}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Posting Job...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostJob; 
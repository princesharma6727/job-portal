import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Building, CheckCircle, AlertCircle, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import MatchScore from '../components/MatchScore';
import axios from 'axios';
import toast from 'react-hot-toast';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connectWallet, isConnected } = useWeb3();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [matchScore, setMatchScore] = useState(null);
  const [matchBreakdown, setMatchBreakdown] = useState(null);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`);
      setJob(response.data.job);
      
      // Check if user has already applied
      if (user && response.data.job.applications) {
        const userApplication = response.data.job.applications.find(
          app => app.applicant._id === user._id
        );
        setHasApplied(!!userApplication);
      }

      // Fetch match score if user is logged in
      if (user) {
        try {
          console.log('Fetching match score for job:', id);
          const scoreResponse = await axios.post('/api/ai/match-score', {
            jobId: id
          }, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          console.log('Match score response:', scoreResponse.data);
          setMatchScore(scoreResponse.data.matchScore);
          setMatchBreakdown(scoreResponse.data.breakdown);
        } catch (error) {
          console.error('Error fetching match score:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply for jobs');
      navigate('/login');
      return;
    }

    if (!isConnected) {
      toast.error('Please connect your wallet to apply');
      connectWallet();
      return;
    }

    setApplying(true);
    try {
      await axios.post(`/api/jobs/${id}/apply`, {
        coverLetter: 'I am interested in this position and believe my skills align well with your requirements.',
        expectedSalary: job.budget ? (job.budget.min + job.budget.max) / 2 : 0
      });

      toast.success('Application submitted successfully!');
      setHasApplied(true);
      fetchJobDetails(); // Refresh job data
    } catch (error) {
      console.error('Error applying for job:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Job not found</h3>
          <p className="text-gray-600">The job you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  job.type === 'Full-time' ? 'bg-green-100 text-green-800' :
                  job.type === 'Part-time' ? 'bg-blue-100 text-blue-800' :
                  job.type === 'Contract' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {job.type}
                </span>
              </div>
              
              {/* AI Match Score Display */}
              {user && matchScore !== null && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">AI Match Analysis</h3>
                      <MatchScore 
                        score={matchScore} 
                        showBreakdown={true} 
                        breakdown={matchBreakdown}
                      />
                    </div>
                    <Target className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-6 text-gray-600 mb-6">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span className="font-medium">{job.company}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>{job.experience} Level</span>
                </div>
                {job.budget && (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>${job.budget.min} - ${job.budget.max}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Payment button for pending payment jobs */}
                {job.status === 'pending_payment' && user?.isEmployer && job.employer === user._id && (
                  <button
                    onClick={() => navigate(`/payment/${job._id}`)}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    Pay Now
                  </button>
                )}
                
                {hasApplied ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Already Applied</span>
                  </div>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {applying ? 'Applying...' : 'Apply Now'}
                  </button>
                )}
                
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back to Jobs
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-6">{job.description}</p>
                
                {job.requirements && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {typeof job.requirements === 'string' 
                        ? job.requirements.split('\n').filter(req => req.trim()).map((req, index) => (
                            <li key={index}>{req}</li>
                          ))
                        : Array.isArray(job.requirements)
                        ? job.requirements.map((req, index) => (
                            <li key={index}>{req}</li>
                          ))
                        : []
                      }
                    </ul>
                  </div>
                )}
                
                {job.responsibilities && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Responsibilities</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {typeof job.responsibilities === 'string'
                        ? job.responsibilities.split('\n').filter(resp => resp.trim()).map((resp, index) => (
                            <li key={index}>{resp}</li>
                          ))
                        : Array.isArray(job.responsibilities)
                        ? job.responsibilities.map((resp, index) => (
                            <li key={index}>{resp}</li>
                          ))
                        : []
                      }
                    </ul>
                  </div>
                )}
                
                {job.benefits && job.benefits.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {job.benefits.map((benefit, index) => (
                        <li key={index}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Company</p>
                  <p className="text-gray-900">{job.company}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-gray-900">{job.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Job Type</p>
                  <p className="text-gray-900">{job.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Experience Level</p>
                  <p className="text-gray-900">{job.experience}</p>
                </div>
                {job.budget && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Salary Range</p>
                    <p className="text-gray-900">${job.budget.min} - ${job.budget.max}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Application Stats */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-medium">{job.applications?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{job.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-medium">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail; 
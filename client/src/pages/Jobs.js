import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, DollarSign, Briefcase, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import MatchScore from '../components/MatchScore';
import axios from 'axios';

const Jobs = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    experience: '',
    location: ''
  });
  const [matchScores, setMatchScores] = useState({});

  useEffect(() => {
    fetchJobs();
  }, []);

  // Refresh jobs when user changes (after job posting)
  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async (retryCount = 0) => {
    try {
      console.log('🔍 Fetching jobs...');
      const response = await axios.get('/api/jobs');
      const jobsData = response.data.jobs || [];
      console.log('✅ Jobs fetched:', jobsData.length, 'jobs');
      console.log('📋 All job titles:', jobsData.map(j => j.title));
      console.log('📋 All job IDs:', jobsData.map(j => j._id));
      setJobs(jobsData);
      
      // Temporarily disable match score calculation to reduce API calls
      // if (user) {
      //   const scores = {};
      //   for (const job of jobsData) {
      //     try {
      //       console.log('Calculating match score for job:', job._id);
      //       const scoreResponse = await axios.post('/api/ai/match-score', {
      //         jobId: job._id
      //       }, {
      //         headers: {
      //           'Authorization': `Bearer ${localStorage.getItem('token')}`
      //         }
      //       });
      //       console.log('Match score response:', scoreResponse.data);
      //       scores[job._id] = scoreResponse.data.matchScore;
      //     } catch (error) {
      //       console.error('Error calculating match score for job:', job._id, error);
      //       scores[job._id] = 0;
      //     }
      //   }
      //   setMatchScores(scores);
      // }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      
      // Handle rate limiting errors with retry logic
      if (error.response?.status === 429 && retryCount < 3) {
        console.error('Rate limit exceeded. Retrying in 2 seconds...');
        setTimeout(() => {
          fetchJobs(retryCount + 1);
        }, 2000);
        return;
      }
      
      if (error.response?.status === 429) {
        console.error('Rate limit exceeded after retries. Please wait a moment and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !filters.type || job.type === filters.type;
    const matchesExperience = !filters.experience || job.experience === filters.experience;
    const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
    
    return matchesSearch && matchesType && matchesExperience && matchesLocation;
  });

  // Debug logging
  console.log('🔍 Total jobs from API:', jobs.length);
  console.log('🔍 Filtered jobs:', filteredJobs.length);
  console.log('🔍 Search term:', searchTerm);
  console.log('🔍 Filters:', filters);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Your Dream Job
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover opportunities that match your skills and career goals
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Search Jobs</h2>
            <button
              onClick={fetchJobs}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Job Type Filter */}
            <div>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <select
                value={filters.experience}
                onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Experience</option>
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          <Link to={`/jobs/${job._id}`} className="hover:text-primary-600">
                            {job.title}
                          </Link>
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          job.type === 'Full-time' ? 'bg-green-100 text-green-800' :
                          job.type === 'Part-time' ? 'bg-blue-100 text-blue-800' :
                          job.type === 'Contract' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {job.type}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{job.company}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{job.experience} Level</span>
                        </div>
                        {job.budget && (
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${job.budget.min} - ${job.budget.max}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-700 line-clamp-2">{job.description}</p>
                      
                      {/* Match Score Display */}
                      {user && matchScores[job._id] !== undefined && (
                        <div className="mt-3">
                          <MatchScore score={matchScores[job._id]} />
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-6">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs; 
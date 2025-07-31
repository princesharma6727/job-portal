import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3 } from '../contexts/Web3Context';
import { 
  Briefcase, 
  User, 
  TrendingUp, 
  Wallet,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Download,
  MapPin,
  DollarSign
} from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const { isConnected, account, isMetaMaskInstalled } = useWeb3();
  
  const [postedJobs, setPostedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Calculate profile completion
  const profileCompletion = () => {
    const fields = ['name', 'bio', 'skills', 'location', 'linkedinUrl'];
    const completed = fields.filter(field => {
      if (field === 'skills') return user?.skills?.length > 0;
      return user?.[field] && user[field].trim();
    }).length;
    return Math.round((completed / fields.length) * 100);
  };

  // Fetch jobs for dashboard
  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      if (user?.isEmployer) {
        // For employers: get job statistics
        try {
          const statsResponse = await axios.get('/api/jobs/stats/employer', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const stats = statsResponse.data;
          console.log('Employer job stats:', stats);
          
          // Use active jobs count for the dashboard
          setPostedJobs(Array(stats.activeJobs).fill({})); // Create array with correct length
        } catch (error) {
          console.error('Error fetching employer stats:', error);
          // Fallback to posted jobs method
          const postedResponse = await axios.get('/api/jobs/my/posted', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const allPostedJobs = postedResponse.data.jobs || [];
          
          // Filter to only count active jobs with completed payments
          const activeCompletedJobs = allPostedJobs.filter(job => 
            job.status === 'active' && job.paymentStatus === 'completed'
          );
          
          setPostedJobs(activeCompletedJobs);
          console.log('All posted jobs count:', allPostedJobs.length);
          console.log('Active completed jobs count:', activeCompletedJobs.length);
        }
      } else {
        // For job seekers: fetch their applied jobs
        try {
          const appliedResponse = await axios.get('/api/jobs/my/applied', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const appliedJobsList = appliedResponse.data.jobs || [];
          setAppliedJobs(appliedJobsList);
          console.log('Applied jobs count:', appliedJobsList.length);
        } catch (error) {
          console.error('Error fetching applied jobs:', error);
          // Fallback to user stats if API fails
          setAppliedJobs([]);
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Set empty arrays on error to prevent undefined values
      if (user?.isEmployer) {
        setPostedJobs([]);
      } else {
        setAppliedJobs([]);
      }
    } finally {
      setLoadingJobs(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [fetchJobs, user]);

  const stats = [
    {
      name: 'Profile Completion',
      value: `${profileCompletion()}%`,
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: user?.isEmployer ? 'Jobs Posted' : 'Jobs Applied',
      value: user?.isEmployer 
        ? (loadingJobs ? '...' : postedJobs.length)
        : (loadingJobs ? '...' : (appliedJobs.length || user?.stats?.jobsApplied || 0)),
      icon: Briefcase,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Jobs Applied',
      value: user?.stats?.jobsApplied || 0,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      name: 'Connections',
      value: user?.stats?.connections || 0,
      icon: User,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  // Debug logging
  useEffect(() => {
    if (user?.isEmployer) {
      console.log('Dashboard - User is employer');
      console.log('Dashboard - Posted jobs count:', postedJobs.length);
      console.log('Dashboard - User stats jobsPosted:', user?.stats?.jobsPosted);
    } else {
      console.log('Dashboard - User is job seeker');
      console.log('Dashboard - Applied jobs count:', appliedJobs.length);
      console.log('Dashboard - User stats jobsApplied:', user?.stats?.jobsApplied);
    }
  }, [user, postedJobs.length, appliedJobs.length]);

  const quickActions = [
    {
      name: 'Post a Job',
      description: 'Create a new job listing',
      icon: Plus,
      href: '/post-job',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Browse Jobs',
      description: 'Find your next opportunity',
      icon: Search,
      href: '/jobs',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Update Profile',
      description: 'Keep your profile current',
      icon: User,
      href: '/profile',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Connect Wallet',
      description: 'Link your Web3 wallet',
      icon: Wallet,
      href: '#',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: 'connect-wallet'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              {user?.isEmployer ? 'Ready to find the perfect candidate?' : 'Ready to find your next opportunity?'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Wallet className="h-4 w-4" />
                <span>{account?.slice(0, 6)}...{account?.slice(-4)}</span>
              </div>
            ) : !isMetaMaskInstalled() ? (
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-600 bg-orange-50 hover:bg-orange-100"
              >
                <Download className="h-4 w-4 mr-2" />
                Install MetaMask
              </a>
            ) : (
              <button className="btn-primary">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              // Handle Connect Wallet action specially
              if (action.action === 'connect-wallet') {
                if (!isMetaMaskInstalled()) {
                  return (
                    <a
                      key={action.name}
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div>
                        <span className="rounded-lg inline-flex p-3 bg-orange-50 text-orange-600">
                          <Download className="h-6 w-6" />
                        </span>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-medium">
                          <span className="absolute inset-0" aria-hidden="true" />
                          Install MetaMask
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">Install MetaMask to connect your wallet</p>
                      </div>
                    </a>
                  );
                }
                return (
                  <button
                    key={action.name}
                    onClick={() => {/* Handle connect wallet */}}
                    className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors w-full text-left"
                  >
                    <div>
                      <span className={`rounded-lg inline-flex p-3 ${action.bgColor} ${action.color}`}>
                        <action.icon className="h-6 w-6" />
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-lg font-medium">
                        <span className="absolute inset-0" aria-hidden="true" />
                        {action.name}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">{action.description}</p>
                    </div>
                  </button>
                );
              }
              
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className={`relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors`}
                >
                  <div>
                    <span className={`rounded-lg inline-flex p-3 ${action.bgColor} ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {action.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">{action.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Profile updated <span className="font-medium text-gray-900">2 hours ago</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <Briefcase className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Applied to <span className="font-medium text-gray-900">Senior React Developer</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                        <Clock className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Joined RizeOS <span className="font-medium text-gray-900">1 week ago</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      {!user?.isEmployer && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">AI Recommendations</h3>
            <p className="text-sm text-gray-500 mt-1">
              Based on your profile and preferences
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Frontend Developer</h4>
                    <p className="text-sm text-gray-500">TechCorp Inc.</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      95% Match
                    </span>
                    <button className="btn-primary btn-sm">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Full Stack Engineer</h4>
                    <p className="text-sm text-gray-500">StartupXYZ</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      87% Match
                    </span>
                    <button className="btn-primary btn-sm">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Briefcase, 
  Users, 
  Zap, 
  Shield, 
  Globe, 
  TrendingUp,
  ArrowRight,
  MessageSquare,
  Target,
  Brain,
  Wallet
} from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: Briefcase,
      title: 'Smart Job Matching',
      description: 'AI-powered job recommendations based on your skills and experience.'
    },
    {
      icon: Users,
      title: 'Professional Network',
      description: 'Connect with industry professionals and build meaningful relationships.'
    },
    {
      icon: Zap,
      title: 'Web3 Integration',
      description: 'Blockchain wallet integration for secure connections.'
    },
    {
      icon: Shield,
      title: 'Verified Profiles',
      description: 'Trusted platform with verified employers and job seekers.'
    },
    {
      icon: Globe,
      title: 'Global Opportunities',
      description: 'Access remote and international job opportunities worldwide.'
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Track your progress and discover new career opportunities.'
    }
  ];

  const stats = [
    { label: 'Active Jobs', value: '1,234' },
    { label: 'Companies', value: '567' },
    { label: 'Job Seekers', value: '8,901' },
    { label: 'Success Rate', value: '94%' }
  ];

  const newFeatures = [
    {
      icon: MessageSquare,
      title: 'Professional Feed',
      description: 'Share career updates, advice, and connect with professionals in your field.',
      link: '/feed',
      color: 'bg-blue-500'
    },
    {
      icon: Brain,
      title: 'AI Skill Extraction',
      description: 'Automatically extract skills from your bio and resume using advanced AI.',
      link: '/profile',
      color: 'bg-purple-500'
    },
    {
      icon: Target,
      title: 'GTM Strategy',
      description: 'Comprehensive go-to-market strategy with detailed user personas and revenue streams.',
      link: '/gtm-strategy',
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              The Future of
              <span className="block text-yellow-300">Job Matching</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              AI-powered job platform with Web3 integration and professional networking
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <>
                  <Link
                    to="/jobs"
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50"
                  >
                    Browse Jobs
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/feed"
                    className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-700"
                  >
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Join Feed
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-primary-700"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">New Features</h2>
            <p className="text-lg text-gray-600">Discover the latest enhancements to RizeOS</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newFeatures.map((feature, index) => (
              <Link
                key={index}
                to={feature.link}
                className="group block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${feature.color} text-white mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose RizeOS?</h2>
            <p className="text-lg text-gray-600">The most advanced job platform with AI and Web3 integration</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 text-primary-600 mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Platform Statistics</h2>
            <p className="text-primary-100">Join thousands of professionals and companies</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-primary-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join the future of job matching with AI-powered recommendations and Web3 integration
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/gtm-strategy"
                  className="inline-flex items-center px-8 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-600 hover:bg-primary-50"
                >
                  <Target className="mr-2 h-5 w-5" />
                  View Strategy
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-3 border border-primary-600 text-base font-medium rounded-md text-primary-600 hover:bg-primary-50"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 
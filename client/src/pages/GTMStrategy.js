import React, { useState } from 'react';
import { 
  Target, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  BarChart3,
  Globe,
  Smartphone,
  Briefcase,
  GraduationCap,
  Building,
  Zap
} from 'lucide-react';

const GTMStrategy = () => {
  const [activeTab, setActiveTab] = useState('personas');

  const userPersonas = [
    {
      name: "Sarah Chen",
      role: "Senior Software Engineer",
      age: 28,
      company: "Tech Startup",
      goals: ["Career growth", "Skill development", "Networking"],
      painPoints: ["Limited job visibility", "Skill gap identification", "Work-life balance"],
      techStack: ["React", "Node.js", "Python", "AWS"],
      income: "₹15-25 LPA",
      location: "Bangalore/Mumbai",
      avatar: "👩‍💻"
    },
    {
      name: "Rajesh Kumar",
      role: "HR Manager",
      age: 35,
      company: "Mid-size Company",
      goals: ["Talent acquisition", "Cost-effective hiring", "Quality candidates"],
      painPoints: ["High recruitment costs", "Time-consuming hiring", "Skill verification"],
      techStack: ["HRIS", "ATS", "LinkedIn Recruiter"],
      income: "₹8-12 LPA",
      location: "Delhi/Pune",
      avatar: "👨‍💼"
    },
    {
      name: "Priya Sharma",
      role: "Junior Developer",
      age: 23,
      company: "Freelancer",
      goals: ["First full-time job", "Skill building", "Portfolio development"],
      painPoints: ["Limited experience", "No professional network", "Entry barriers"],
      techStack: ["JavaScript", "HTML/CSS", "React", "Git"],
      income: "₹3-6 LPA",
      location: "Remote/Anywhere",
      avatar: "👩‍🎓"
    }
  ];

  const roadmap = [
    {
      month: "Month 1",
      title: "Foundation & Launch",
      goals: [
        "Launch MVP with core features",
        "Onboard 100 beta users",
        "Establish brand presence",
        "Set up analytics tracking"
      ],
      metrics: ["100 users", "50 job postings", "200 profile views"],
      budget: "₹2,000"
    },
    {
      month: "Month 2",
      title: "Growth & Optimization",
      goals: [
        "Implement AI features",
        "Launch referral program",
        "Content marketing campaign",
        "Partnership development"
      ],
      metrics: ["1,000 users", "200 job postings", "5,000 profile views"],
      budget: "₹2,000"
    },
    {
      month: "Month 3",
      title: "Scale & Monetize",
      goals: [
        "Launch premium features",
        "Expand to new cities",
        "Corporate partnerships",
        "Revenue optimization"
      ],
      metrics: ["10,000 users", "1,000 job postings", "50,000 profile views"],
      budget: "₹1,000"
    }
  ];

  const marketingPlan = [
    {
      channel: "Content Marketing",
      budget: "₹1,500",
      activities: [
        "Career advice blog posts",
        "Tech industry insights",
        "Success story case studies",
        "LinkedIn thought leadership"
      ],
      expectedReach: "50,000+ professionals"
    },
    {
      channel: "Social Media",
      budget: "₹1,000",
      activities: [
        "LinkedIn sponsored posts",
        "Twitter tech community engagement",
        "Instagram career tips",
        "YouTube tutorial videos"
      ],
      expectedReach: "25,000+ followers"
    },
    {
      channel: "Partnerships",
      budget: "₹1,000",
      activities: [
        "Coding bootcamp partnerships",
        "Tech conference sponsorships",
        "University career fairs",
        "Industry association memberships"
      ],
      expectedReach: "10,000+ direct connections"
    },
    {
      channel: "Referral Program",
      budget: "₹500",
      activities: [
        "User referral incentives",
        "Employer referral bonuses",
        "Social sharing rewards",
        "Community challenges"
      ],
      expectedReach: "5,000+ organic users"
    }
  ];

  const revenueStreams = [
    {
      name: "Premium Subscriptions",
      model: "₹150/month",
      features: [
        "Advanced AI matching",
        "Priority job applications",
        "Resume builder premium",
        "Direct messaging",
        "Analytics dashboard"
      ],
      targetUsers: "5,000 subscribers",
      projectedRevenue: "₹9,00,000/year"
    },
    {
      name: "Job Posting Fees",
      model: "₹500-2000 per post",
      features: [
        "Featured job listings",
        "AI-powered candidate matching",
        "Analytics and insights",
        "Priority placement",
        "Multi-city posting"
      ],
      targetUsers: "2,000 employers",
      projectedRevenue: "₹15,00,000/year"
    },
    {
      name: "Token Boosts",
      model: "₹50-200 per boost",
      features: [
        "Profile visibility boost",
        "Application priority",
        "Skill verification badges",
        "Endorsement tokens",
        "Premium networking"
      ],
      targetUsers: "10,000 users",
      projectedRevenue: "₹5,00,000/year"
    },
    {
      name: "Commission Model",
      model: "5-10% of placement",
      features: [
        "Successful hire commission",
        "Training program referrals",
        "Certification partnerships",
        "Recruitment services",
        "Consulting fees"
      ],
      targetUsers: "500 placements",
      projectedRevenue: "₹10,00,000/year"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Target className="h-8 w-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Go-To-Market Strategy</h1>
          </div>
          <p className="text-gray-600">
            Comprehensive strategy to reach 10,000 users in 3 months with ₹5,000 budget
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex space-x-1">
            {[
              { id: 'personas', label: 'Target Personas', icon: Users },
              { id: 'roadmap', label: '3-Month Roadmap', icon: Calendar },
              { id: 'marketing', label: 'Marketing Plan', icon: TrendingUp },
              { id: 'revenue', label: 'Revenue Streams', icon: DollarSign }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        {activeTab === 'personas' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Target User Personas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {userPersonas.map((persona, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-3xl">{persona.avatar}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{persona.name}</h3>
                        <p className="text-sm text-gray-600">{persona.role}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Goals</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {persona.goals.map((goal, i) => (
                            <li key={i} className="flex items-center">
                              <Zap className="h-3 w-3 text-green-500 mr-2" />
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Pain Points</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {persona.painPoints.map((point, i) => (
                            <li key={i} className="flex items-center">
                              <Target className="h-3 w-3 text-red-500 mr-2" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-3 border-t">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-medium">Income:</span> {persona.income}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {persona.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">3-Month Roadmap to 10,000 Users</h2>
              <div className="space-y-6">
                {roadmap.map((phase, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{phase.month}</h3>
                        <p className="text-lg text-primary-600">{phase.title}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Budget</p>
                        <p className="text-lg font-semibold text-green-600">{phase.budget}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Key Goals</h4>
                        <ul className="space-y-2">
                          {phase.goals.map((goal, i) => (
                            <li key={i} className="flex items-start">
                              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-sm text-gray-600">{goal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Success Metrics</h4>
                        <ul className="space-y-2">
                          {phase.metrics.map((metric, i) => (
                            <li key={i} className="flex items-center">
                              <BarChart3 className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-sm text-gray-600">{metric}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'marketing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Marketing Plan (₹5,000 Budget)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marketingPlan.map((channel, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{channel.channel}</h3>
                      <span className="text-lg font-semibold text-green-600">{channel.budget}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Activities</h4>
                        <ul className="space-y-1">
                          {channel.activities.map((activity, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Expected Reach:</span> {channel.expectedReach}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Revenue Streams (Minimum 2)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {revenueStreams.map((stream, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{stream.name}</h3>
                      <span className="text-lg font-semibold text-primary-600">{stream.model}</span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Features</h4>
                        <ul className="space-y-1">
                          {stream.features.map((feature, i) => (
                            <li key={i} className="text-sm text-gray-600 flex items-center">
                              <DollarSign className="h-3 w-3 text-green-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                        <div>
                          <p className="text-xs text-gray-500">Target Users</p>
                          <p className="text-sm font-medium">{stream.targetUsers}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Projected Revenue</p>
                          <p className="text-sm font-medium text-green-600">{stream.projectedRevenue}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Total Projected Revenue</h3>
                <p className="text-2xl font-bold text-green-600">₹39,00,000/year</p>
                <p className="text-sm text-green-700 mt-1">
                  From 4 diversified revenue streams with sustainable growth potential
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GTMStrategy; 
import React from 'react';
import { Target, TrendingUp } from 'lucide-react';

const MatchScore = ({ score, showBreakdown = false, breakdown = null }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
        <Target className="h-3 w-3" />
        <span>{score}% Match</span>
      </div>
      
      {showBreakdown && breakdown && (
        <div className="text-xs text-gray-500">
          <div className="flex items-center space-x-2">
            <span>Skills: {breakdown.skillsMatch}%</span>
            <span>Experience: {breakdown.experienceMatch}%</span>
            <span>Location: {breakdown.locationMatch}%</span>
          </div>
        </div>
      )}
      
      <span className="text-xs text-gray-500">{getScoreLabel(score)}</span>
    </div>
  );
};

export default MatchScore; 
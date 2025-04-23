import React from 'react';
import { motion } from 'framer-motion';
import { FaLightbulb, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';

const AIInsights = ({ insights }) => {
  // Helper function to get the appropriate icon based on impact
  const getImpactIcon = (impact) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return <FaExclamationTriangle className="text-red-400" />;
      case 'medium':
        return <FaChartLine className="text-yellow-400" />;
      case 'low':
        return <FaLightbulb className="text-green-400" />;
      default:
        return <FaLightbulb className="text-blue-400" />;
    }
  };

  // Helper function to get the appropriate color based on impact
  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'high':
        return 'border-red-400';
      case 'medium':
        return 'border-yellow-400';
      case 'low':
        return 'border-green-400';
      default:
        return 'border-blue-400';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <div className="flex items-center mb-4">
        <FaLightbulb className="text-accent-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">AI Market Insights</h3>
      </div>
      
      <div className="space-y-4">
        {insights && insights.length > 0 ? (
          insights.map((insight, index) => (
            <motion.div
              key={insight.insight_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border-l-4 ${getImpactColor(insight.impact)} pl-4 bg-gray-700 rounded-r-lg p-4`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-white font-medium">{insight.title}</h4>
                  <p className="text-gray-300 text-sm mt-1">{insight.description}</p>
                </div>
                <div className="flex items-center">
                  {getImpactIcon(insight.impact)}
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Source:</span>
                  <span className="text-white">{insight.source}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-2">Confidence:</span>
                  <span className="text-white">{Math.round(insight.confidence * 100)}%</span>
                </div>
                <div className="text-gray-400">
                  {insight.timestamp}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-gray-400 text-center py-4">
            No AI insights available at the moment.
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights; 
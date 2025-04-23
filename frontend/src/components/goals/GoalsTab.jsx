import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import userPreferencesStore from '../../store/userPreferences';

const GoalsTab = () => {
  console.log('GoalsTab rendering');
  const [selectedGoal, setSelectedGoal] = useState('maximize_roi');
  const [goalSaved, setGoalSaved] = useState(false);

  // Predefined goals with their descriptions
  const goals = [
    {
      id: 'maximize_roi',
      name: 'Maximize ROI',
      description: 'Focus on strategies that provide the highest return on investment',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'reduce_vacancies',
      name: 'Reduce Vacancies',
      description: 'Prioritize keeping your properties occupied, even at competitive rates',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'longterm_value',
      name: 'Increase Long-term Value',
      description: 'Focus on appreciation and property improvements for future value',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    }
  ];

  // Load saved goal from preferences store on component mount
  useEffect(() => {
    console.log('GoalsTab - useEffect running');
    const savedGoal = userPreferencesStore.getInvestmentGoal();
    console.log('Saved goal from store:', savedGoal);
    if (savedGoal) {
      setSelectedGoal(savedGoal);
    }
  }, []);

  // Handle goal selection and save to preferences store
  const handleGoalSelect = (goalId) => {
    setSelectedGoal(goalId);
    userPreferencesStore.setInvestmentGoal(goalId);
    setGoalSaved(true);

    // Reset saved message after delay
    setTimeout(() => {
      setGoalSaved(false);
    }, 3000);
  };

  // Get the currently selected goal object
  const currentGoal = goals.find(goal => goal.id === selectedGoal);

  return (
    <div className="p-6 space-y-8">
      {/* Goal Selection Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Goal-Based Personalization</h2>
          {goalSaved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg"
            >
              Goal saved successfully
            </motion.div>
          )}
        </div>
        <p className="text-slate-400 max-w-3xl">
          Select your primary investment objective, and our AI agent will tailor all recommendations and insights
          to help you achieve this goal. As your priorities change, you can update your goal at any time.
        </p>
      </motion.div>

      {/* Goal Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-lg cursor-pointer border-2 transition-colors ${
              selectedGoal === goal.id
                ? 'bg-primary-500/10 border-primary-500'
                : 'bg-slate-800 border-slate-700/50 hover:bg-slate-700/50'
            }`}
            onClick={() => handleGoalSelect(goal.id)}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`${
                selectedGoal === goal.id ? 'text-primary-400' : 'text-slate-400'
              }`}>
                {goal.icon}
              </div>
              <h3 className="text-xl font-medium text-white">{goal.name}</h3>
            </div>
            <p className="text-slate-400">{goal.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Current Strategy Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-slate-800 rounded-lg p-6 border border-slate-700/50"
      >
        <h3 className="text-xl font-medium text-white mb-4">How This Affects Your Experience</h3>
        <div className="space-y-6">
          {/* Current Strategy Info */}
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <div className="text-primary-400">
                {currentGoal?.icon}
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-white">{currentGoal?.name}</h4>
              <p className="text-slate-400">{currentGoal?.description}</p>
            </div>
          </div>

          {/* AI Behavior Changes */}
          <div className="space-y-4 mt-6">
            <h4 className="text-lg font-medium text-white">How Our AI Adapts To Your Goal</h4>

            {selectedGoal === 'maximize_roi' && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-accent-400 mt-2 mr-2 flex-shrink-0"></div>
                    <p className="text-slate-300">Opportunity recommendations will prioritize high-yield investments, even if they carry more risk</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-accent-400 mt-2 mr-2 flex-shrink-0"></div>
                    <p className="text-slate-300">Analytics will focus on cap rates, cash-on-cash returns, and yield metrics</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-accent-400 mt-2 mr-2 flex-shrink-0"></div>
                    <p className="text-slate-300">You'll see more suggestions for optimizing existing properties to increase rental income</p>
                  </li>
                </ul>
              </div>
            )}

            {selectedGoal === 'reduce_vacancies' && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-accent-400 mt-2 mr-2 flex-shrink-0"></div>
                    <p className="text-slate-300">Property management recommendations will focus on tenant retention strategies</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-accent-400 mt-2 mr-2 flex-shrink-0"></div>
                    <p className="text-slate-300">Pricing suggestions may lean toward competitive rates to attract tenants quickly</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-accent-400 mt-2 mr-2 flex-shrink-0"></div>
                    <p className="text-slate-300">You'll receive more insights about tenant preferences and market demand factors</p>
                  </li>
                </ul>
              </div>
            )}

            {selectedGoal === 'longterm_value' && (
              <div className="bg-slate-700/50 rounded-lg p-4">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-accent-400 mt-2 mr-2 flex-shrink-0"></div>
                    <p className="text-slate-300">Investment recommendations will favor properties in developing neighborhoods with growth potential</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-accent-400 mt-2 mr-2 flex-shrink-0"></div>
                    <p className="text-slate-300">You'll see more suggestions for property improvements that increase capital appreciation</p>
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 rounded-full bg-accent-400 mt-2 mr-2 flex-shrink-0"></div>
                    <p className="text-slate-300">Market analysis will focus on long-term demographic shifts and infrastructure development</p>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default GoalsTab;

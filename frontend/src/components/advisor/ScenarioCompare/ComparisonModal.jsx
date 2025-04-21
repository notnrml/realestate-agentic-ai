import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ComparisonModal = ({ isOpen, onClose, unit, strategies }) => {
  const [insights, setInsights] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Simulate AI analysis
      const timer = setTimeout(() => {
        setIsAnalyzing(false);
        setInsights([
          {
            id: 1,
            type: 'significant',
            message: 'Furnish Unit strategy shows highest ROI potential with low risk',
            metrics: ['roi', 'risk_level']
          },
          {
            id: 2,
            type: 'warning',
            message: 'Raise Rent strategy has medium risk but quick implementation',
            metrics: ['risk_level', 'timeframe']
          },
          {
            id: 3,
            type: 'opportunity',
            message: 'Combining Furnish Unit with Smart Features could maximize returns',
            metrics: ['roi', 'cost_to_act']
          }
        ]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const chartData = {
    labels: strategies.map(s => s.strategy),
    datasets: [
      {
        label: 'ROI (%)',
        data: strategies.map(s => s.roi),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Risk Level',
        data: strategies.map(s => {
          switch(s.risk_level.toLowerCase()) {
            case 'low': return 1;
            case 'medium': return 2;
            case 'high': return 3;
            default: return 1;
          }
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#94a3b8'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      x: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          color: '#94a3b8'
        }
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">
                Compare Strategies for {unit.location}
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart Section */}
              <div className="bg-slate-700/30 rounded-lg p-4">
                <h4 className="text-lg font-medium text-white mb-4">Performance Metrics</h4>
                <div className="h-64">
                  <Line data={chartData} options={chartOptions} />
                </div>
              </div>

              {/* AI Insights Section */}
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="text-lg font-medium text-white">AI Insights</h4>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.7, 1]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="w-2 h-2 rounded-full bg-accent-400"
                  />
                </div>

                <AnimatePresence>
                  {isAnalyzing ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center h-40"
                    >
                      <div className="text-center">
                        <motion.div
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="w-8 h-8 rounded-full border-2 border-accent-400 border-t-transparent mx-auto mb-2"
                        />
                        <p className="text-slate-400">Analyzing strategies...</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {insights.map((insight) => (
                        <motion.div
                          key={insight.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: insight.id * 0.1 }}
                          className={`p-4 rounded-lg ${
                            insight.type === 'significant' 
                              ? 'bg-emerald-500/10 border border-emerald-500/20'
                              : insight.type === 'warning'
                              ? 'bg-amber-500/10 border border-amber-500/20'
                              : 'bg-blue-500/10 border border-blue-500/20'
                          }`}
                        >
                          <p className="text-white">{insight.message}</p>
                          <div className="flex gap-2 mt-2">
                            {insight.metrics.map((metric) => (
                              <span
                                key={metric}
                                className="px-2 py-1 rounded-full text-xs bg-slate-700/50 text-slate-300"
                              >
                                {metric.replace('_', ' ')}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="mt-6 bg-slate-700/30 rounded-lg p-4">
              <h4 className="text-lg font-medium text-white mb-4">Detailed Comparison</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="pb-2">Strategy</th>
                      <th className="pb-2">ROI</th>
                      <th className="pb-2">Cost</th>
                      <th className="pb-2">Risk</th>
                      <th className="pb-2">Timeframe</th>
                      <th className="pb-2">Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {strategies.map((strategy) => (
                      <tr key={strategy.strategy} className="text-slate-300">
                        <td className="py-3">{strategy.strategy}</td>
                        <td className="py-3">{strategy.roi}%</td>
                        <td className="py-3">
                          {strategy.cost_to_act > 0 
                            ? `AED ${strategy.cost_to_act.toLocaleString()}`
                            : 'No Cost'
                          }
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            strategy.risk_level.toLowerCase() === 'low'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : strategy.risk_level.toLowerCase() === 'medium'
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'bg-red-500/10 text-red-400'
                          }`}>
                            {strategy.risk_level}
                          </span>
                        </td>
                        <td className="py-3">{strategy.timeframe}</td>
                        <td className="py-3">{strategy.impact}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComparisonModal; 
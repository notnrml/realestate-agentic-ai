import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";

const MiniChart = ({ data, height = 40 }) => {
  const chartData = {
    labels: Array.from({ length: 12 }, (_, i) => `M${i + 1}`),
    datasets: [{
      data: data,
      borderColor: 'rgb(34, 197, 94)', // green-500
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 2,
      pointBackgroundColor: 'rgb(34, 197, 94)',
      pointBorderColor: 'rgb(34, 197, 94)',
      pointHoverRadius: 4,
      pointHoverBackgroundColor: 'rgb(34, 197, 94)',
      pointHoverBorderColor: 'white',
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        padding: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `ROI: ${context.raw.toFixed(1)}%`,
          title: (items) => `Month ${items[0].dataIndex + 1}`
        }
      }
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        min: (context) => Math.min(...context.chart.data.datasets[0].data) * 0.95,
        max: (context) => Math.max(...context.chart.data.datasets[0].data) * 1.05,
      }
    },
    elements: {
      line: {
        borderWidth: 1.5,
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
};
import userPreferencesStore from '../../../store/userPreferences';

const StrategyCard = ({ strategy, onDecision, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [status, setStatus] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isPreferred, setIsPreferred] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Ensure unit_id is available
  useEffect(() => {
    if (strategy && !strategy.unit_id && onDecision) {
      console.warn("Strategy card missing unit_id");
    }
  }, [strategy]);

  // Check if this strategy matches user preferences
  useEffect(() => {
    const preferredStrategies = userPreferencesStore.getPreferredStrategies();
    const riskPreference = userPreferencesStore.getRiskPreference();
    const costPreference = userPreferencesStore.getCostPreference();

    // Check if strategy matches preferences
    const matchesRisk = strategy.risk_level.toLowerCase() === riskPreference;
    const strategyCostLevel = strategy.cost < 100000 ? 'low' : 
                             strategy.cost < 500000 ? 'medium' : 'high';
    const matchesCost = strategyCostLevel === costPreference;
    const isPreferredStrategy = preferredStrategies.includes(strategy.strategy);

    setIsPreferred(matchesRisk && matchesCost && isPreferredStrategy);
  }, [strategy]);

  const handleAccept = async () => {
    setStatus('accepted');
    setShowMessage(true);
    setIsExiting(true);
    
    // Store the decision
    userPreferencesStore.addDecision(strategy.unit_id, strategy.strategy, 'accept');

    try {
      fetch('/api/advisor/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unit_id: strategy.unit_id || 'unknown',
          strategy: strategy.strategy,
          decision: 'accept'
        })
      }).catch(err => {
        console.warn("API call failed, but continuing UI flow:", err);
      });

      setTimeout(() => {
        setIsVisible(false);
        if (onDecision) {
          onDecision('accept');
        }
      }, 1500);
    } catch (error) {
      console.error('Error in accept handler:', error);
      setTimeout(() => {
        setIsVisible(false);
        if (onDecision) {
          onDecision('accept');
        }
      }, 1500);
    }
  };

  const handleReject = async () => {
    setStatus('rejected');
    setShowMessage(true);
    setIsExiting(true);
    
    // Store the decision
    userPreferencesStore.addDecision(strategy.unit_id, strategy.strategy, 'reject');

    try {
      fetch('/api/advisor/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unit_id: strategy.unit_id || 'unknown',
          strategy: strategy.strategy,
          decision: 'reject'
        })
      }).catch(err => {
        console.warn("API call failed, but continuing UI flow:", err);
      });

      setTimeout(() => {
        setIsVisible(false);
        if (onDecision) {
          onDecision('reject');
        }
      }, 1500);
    } catch (error) {
      console.error('Error in reject handler:', error);
      setTimeout(() => {
        setIsVisible(false);
        if (onDecision) {
          onDecision('reject');
        }
      }, 1500);
    }
  };

  // Safely access strategy properties with fallbacks
  const strategyData = {
    strategy: strategy?.strategy || 'Unnamed Strategy',
    description: strategy?.description || 'No description available',
    roi: strategy?.roi || 0,
    cost: strategy?.cost || 0,
    risk_level: strategy?.risk_level || 'Medium',
    timeframe: strategy?.timeframe || 'N/A'
  };

  // Generate 12 months of ROI data with monthly growth
  const generateMonthlyROIData = (baseROI) => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthlyGrowth = baseROI * 0.015; // 1.5% monthly growth
      const variation = (Math.random() - 0.5) * 0.2; // Small random variation
      return +(baseROI + (monthlyGrowth * i) + variation).toFixed(1);
    });
  };

  const monthlyROIData = generateMonthlyROIData(strategy.roi);
  const finalProjectedROI = monthlyROIData[monthlyROIData.length - 1];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: status ? 0.95 : 1,
            backgroundColor: status === 'accepted' ? 'rgba(16, 185, 129, 0.1)' :
                           status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(30, 41, 59, 0.5)'
          }}
          exit={{
            opacity: 0,
            scale: 0.8,
            x: status === 'rejected' ? [0, 20, -20, 40, -40, 60, -60, 80, -80, 100] : 0,
            y: status === 'rejected' ? [0, -20, 20, -40, 40, -60, 60, -80, 80, -100] : 0,
            filter: "blur(8px)",
            transition: {
              duration: 1.5,
              ease: [0.4, 0, 0.2, 1],
              times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
            }
          }}
          transition={{
            duration: 0.5,
            delay: delay,
            type: "spring",
            stiffness: 200,
            damping: 15,
            mass: 0.5
          }}
          className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 relative overflow-hidden"
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.3 }
          }}
        >
          {/* Subtle background animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-slate-700/20 to-slate-800/20"
            animate={{
              opacity: [0.3, 0.5, 0.3],
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Preferred strategy indicator */}
          {isPreferred && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1]
                }
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
                transition: {
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1]
                }
              }}
              className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20"
            />
          )}
          {status === 'accepted' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.5,
                  ease: [0.4, 0, 0.2, 1]
                }
              }}
              exit={{
                opacity: 0,
                scale: 0.8,
                transition: {
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1]
                }
              }}
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20"
            />
          )}

          <div className="relative z-10">
            <div className="flex justify-between items-start mb-3">
              <div>
                <motion.h4
                  className="text-lg font-medium text-white"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  {strategyData.strategy}
                </motion.h4>
                <motion.p
                  className="text-sm text-slate-400"
                  whileHover={{ scale: 1.01, x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  {strategyData.description}
                </motion.p>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAccept}
                  disabled={status !== null}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status === 'accepted'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  } transition-colors`}
                >
                  {status === 'accepted' ? 'Accepted' : 'Accept'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReject}
                  disabled={status !== null}
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status === 'rejected'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  } transition-colors`}
                >
                  {status === 'rejected' ? 'Rejected' : 'Reject'}
                </motion.button>
              </div>
            </div>

            {/* Updated Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="col-span-2 bg-slate-700/30 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400">ROI Projection</span>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      <span className="text-slate-300 font-medium">{strategy.roi}%</span>
                      <span className="text-slate-400 mx-2">→</span>
                      <span className="text-emerald-400 font-medium">{finalProjectedROI}%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <MiniChart data={monthlyROIData} />
                </div>
                <div className="flex justify-between mt-1 px-1">
                  <span className="text-xs text-slate-400">Month 1</span>
                  <span className="text-xs text-slate-400">Month 12</span>
                </div>
              </motion.div>

              {/* Other metrics remain the same */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <p className="text-slate-400">Cost</p>
                <p className="text-white font-medium">
                  AED {strategyData.cost.toLocaleString()}
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-slate-400">Risk Level</p>
                <p className="text-white font-medium">{strategyData.risk_level}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-slate-400">Timeframe</p>
                <p className="text-white font-medium">{strategyData.timeframe}</p>
              </motion.div>
            </div>

            <AnimatePresence>
              {showMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      duration: 0.4,
                      ease: [0.4, 0, 0.2, 1]
                    }
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                    scale: 0.95,
                    transition: {
                      duration: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }
                  }}
                  className="mt-4 text-center"
                >
                  <p className="text-sm text-slate-400">
                    We'll adapt future advice based on this decision
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StrategyCard;
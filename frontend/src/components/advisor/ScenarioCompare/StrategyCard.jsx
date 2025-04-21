import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const StrategyCard = ({ strategy, onDecision, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [status, setStatus] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  
  // Ensure unit_id is available
  useEffect(() => {
    if (strategy && !strategy.unit_id && onDecision) {
      console.warn("Strategy card missing unit_id");
    }
  }, [strategy]);

  const handleAccept = async () => {
    setStatus('accepted');
    setShowMessage(true);
    
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

  return (
    <AnimatePresence mode="popLayout">
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

          {status === 'rejected' && (
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

            {/* Comparison Metrics with subtle animations */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'ROI', value: `${strategyData.roi}%` },
                { label: 'Cost', value: `AED ${strategyData.cost.toLocaleString()}` },
                { label: 'Risk Level', value: strategyData.risk_level },
                { label: 'Timeframe', value: strategyData.timeframe }
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { delay: 0.1 * index }
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    x: 2,
                    transition: { duration: 0.2 }
                  }}
                >
                  <p className="text-slate-400">{metric.label}</p>
                  <p className="text-white font-medium">{metric.value}</p>
                </motion.div>
              ))}
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
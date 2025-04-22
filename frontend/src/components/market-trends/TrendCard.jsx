import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const TrendCard = ({ title, value, change, isPositive }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 15
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.3 }
      }}
      className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 shadow-lg border border-slate-700/50 relative overflow-hidden"
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
      
      {/* Color indicator based on trend */}
      {isPositive && (
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
          className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10"
        />
      )}
      {!isPositive && (
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
          className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10"
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-medium text-white">{title}</h3>
          <div className={`flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            <span className="font-semibold text-sm">{change}%</span>
          </div>
        </div>
        <div className="mt-2">
          <span className="text-lg font-bold text-white">{value}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TrendCard; 
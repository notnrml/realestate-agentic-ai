import { motion } from 'framer-motion';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const TrendCard = ({ title, value, change, isPositive }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow"
    >
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
    </motion.div>
  );
};

export default TrendCard; 
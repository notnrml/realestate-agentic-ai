import { motion } from 'framer-motion';
import { FaNewspaper } from 'react-icons/fa';

const DailyDigest = ({ updates }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-6 shadow-lg"
    >
      <div className="flex items-center mb-4">
        <FaNewspaper className="text-accent-400 mr-2" />
        <h3 className="text-lg font-semibold text-white">Daily Market Digest</h3>
      </div>
      <div className="space-y-4">
        {updates.map((update, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border-l-2 border-accent-400 pl-4"
          >
            <p className="text-white text-sm">{update.content}</p>
            <span className="text-gray-400 text-xs">{update.timestamp}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default DailyDigest; 
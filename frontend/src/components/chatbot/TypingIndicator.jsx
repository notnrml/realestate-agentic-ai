import { motion } from 'framer-motion';

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-700/30 rounded-lg p-3 max-w-[85%] inline-flex"
    >
      <span className="flex space-x-1 items-center">
        <motion.span
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
          className="w-2 h-2 bg-primary-400 rounded-full"
        />
        <motion.span
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
          className="w-2 h-2 bg-primary-400 rounded-full"
        />
        <motion.span
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
          className="w-2 h-2 bg-primary-400 rounded-full"
        />
      </span>
    </motion.div>
  );
}

export default TypingIndicator;

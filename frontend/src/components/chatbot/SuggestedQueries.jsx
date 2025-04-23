import { motion } from 'framer-motion';
import { useChat } from './ChatContext';

function SuggestedQueries() {
  const { sendMessage } = useChat();

  const suggestions = [
    "What are the best areas to invest in Dubai right now?",
    "How has the real estate market changed in 2023?",
    "What's the average ROI for apartments in Dubai Marina?",
    "Which property types offer the best rental yields?"
  ];

  return (
    <div className="mb-6">
      <p className="text-sm text-slate-400 mb-3">Try asking about:</p>
      <div className="grid grid-cols-1 gap-2">
        {suggestions.map((suggestion, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(96, 165, 250, 0.1)' }}
            className="text-left p-3 rounded-lg bg-slate-700/20 text-white hover:bg-primary-500/10 transition-colors text-sm"
            onClick={() => sendMessage(suggestion)}
          >
            {suggestion}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default SuggestedQueries;

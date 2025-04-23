import { useState } from 'react';
import { motion } from 'framer-motion';
import { useChat } from './ChatContext';

export function ChatInput() {
  const [input, setInput] = useState('');
  const { sendMessage } = useChat();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700/50">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What insights would you like to explore?"
          className="w-full bg-slate-700/30 text-white placeholder-slate-400 rounded-lg pl-4 pr-14 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-primary-400 hover:text-primary-300 hover:bg-slate-700/30 rounded-full transition-colors"
        >
          <svg className="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </motion.button>
      </div>
    </form>
  );
}

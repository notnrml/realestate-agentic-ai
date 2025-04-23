import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

function ChatMessage({ message, isUser }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-lg p-3 ${
          isUser
            ? 'bg-primary-500/20 text-white'
            : 'bg-slate-700/30 text-white'
        }`}
      >
        {message.isStreaming ? (
          <span>{message.content || '...'}</span>
        ) : (
          <ReactMarkdown
            className="prose prose-invert prose-sm max-w-none"
            components={{
              // Override default link and make it open in new tab
              a: ({ node, ...props }) => (
                <a target="_blank" rel="noopener noreferrer" {...props} />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  );
}

export default ChatMessage;

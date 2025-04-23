import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import SuggestedQueries from './SuggestedQueries';
import { useChat } from './ChatContext';
import TypingIndicator from './TypingIndicator';

export function ChatWindow() {
  const { messages, isTyping } = useChat();
  const messagesEndRef = useRef(null);
  const [error, setError] = useState(null);

  const scrollToBottom = () => {
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  };

  useEffect(() => {
    try {
      scrollToBottom();
    } catch (err) {
      console.error('Error in useEffect:', err);
      setError('Failed to scroll to bottom');
    }
  }, [messages]);

  // Error fallback to prevent entire app from crashing
  if (error) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-red-500/20 p-4 rounded-lg">
          <p className="text-white">Something went wrong with the chat window.</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 px-3 py-1 bg-slate-700 rounded-md text-white text-sm hover:bg-slate-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Safely render messages with error boundaries
  const renderMessage = (message, index) => {
    try {
      return (
        <ChatMessage
          key={message.id || index}
          message={message}
          isUser={message.sender === 'user'}
        />
      );
    } catch (err) {
      console.error('Error rendering message:', err);
      return (
        <div key={message.id || index} className="p-2 bg-red-500/20 rounded text-white text-sm">
          Error displaying message
        </div>
      );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="space-y-4">
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SuggestedQueries />
          </motion.div>
        )}

        {messages.map((message, index) => renderMessage(message, index))}

        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

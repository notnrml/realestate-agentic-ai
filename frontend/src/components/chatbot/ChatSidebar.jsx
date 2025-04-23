import { motion, AnimatePresence } from 'framer-motion';
import { ChatWindow } from './ChatWindow';
import { ChatInput } from './ChatInput';
import { useChat } from './ChatContext';
import { useState, useEffect } from 'react';

function ChatSidebar() {
  const { isOllamaAvailable, setIsChatOpen, checkOllamaStatus, startingOllama } = useChat();
  const [renderError, setRenderError] = useState(false);

  // Check Ollama status when the chat sidebar opens
  useEffect(() => {
    checkOllamaStatus();
  }, [checkOllamaStatus]);

  // Handle escape key to close chat
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  const handleClose = () => {
    setIsChatOpen(false);
  };

  const handleStartOllama = () => {
    // Trigger Ollama startup
    checkOllamaStatus(true);
  };

  // Prevent clicks inside the chat from closing it
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end" onClick={handleClose}>
      <motion.div
        onClick={handleContentClick}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="h-full w-96 bg-slate-800 shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
            <div>
              <h2 className="text-white font-medium">Remmi AI</h2>
              <p className="text-xs text-slate-400">Your real estate investment advisor</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-white"
            aria-label="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ollama Warning/Status */}
        {!isOllamaAvailable && (
          <div className="p-4 bg-amber-500/20 text-amber-200 text-sm">
            <div className="flex flex-col gap-2">
              <p>{startingOllama
                ? "Starting Ollama service... This may take a moment."
                : "Ollama service not detected. Please start Ollama to enable AI chat."}</p>

              {!startingOllama && (
                <button
                  onClick={handleStartOllama}
                  className="mt-1 px-3 py-1.5 bg-amber-600/30 hover:bg-amber-600/50 text-amber-100 rounded-md text-xs font-medium transition-colors"
                >
                  Start Ollama Service
                </button>
              )}

              {startingOllama && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
                  <span className="text-xs">Starting service...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {renderError ? (
            <div className="m-4 p-4 bg-red-500/20 rounded-lg text-white">
              <p>Something went wrong with the chat. Please try again.</p>
              <button
                onClick={() => setRenderError(false)}
                className="mt-2 px-3 py-1 bg-slate-700 rounded-md hover:bg-slate-600"
              >
                Retry
              </button>
            </div>
          ) : (
            <ChatWindow onError={() => setRenderError(true)} />
          )}
        </div>

        {/* Input */}
        <ChatInput />
      </motion.div>
    </div>
  );
}

export default ChatSidebar;

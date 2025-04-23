import { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react';
import ollamaService from '../../services/ollamaService';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  // Chat message state
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "I'm your proactive AI assistant for Dubai real estate. I can help with:\n• Market trend analysis\n• Portfolio optimization\n• Investment opportunities\n• ROI calculations\n\nHow can I assist with your real estate investments today?",
      sender: 'assistant',
      timestamp: new Date().toISOString(),
    }
  ]);

  // Simple boolean state for chat visibility
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOllamaAvailable, setIsOllamaAvailable] = useState(false);
  const [startingOllama, setStartingOllama] = useState(false);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const statusCheckInterval = useRef(null);
  const streamingMessageId = useRef(null);

  // Property context - would ideally come from your backend
  const propertyContext = {
    propertyCount: 12,
    totalValue: 22500000, // AED
    portfolioAreas: ['Dubai Marina', 'JVC', 'Business Bay'],
    averageROI: 8.2,
    marketTrend: 'positive growth in premium areas, with Dubai Marina seeing 12% increases',
    preferredInvestmentType: 'residential'
  };

  // Check Ollama availability status
  const checkOllamaStatus = useCallback(async (startIfUnavailable = false) => {
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mistral',
          prompt: 'Hello',
          stream: false
        }),
        // Short timeout for status check
        signal: AbortSignal.timeout(3000)
      });

      const isAvailable = response.ok;
      setIsOllamaAvailable(isAvailable);

      if (!isAvailable && startIfUnavailable) {
        startOllamaService();
      } else if (isAvailable && startingOllama) {
        // If we were in starting state and now it's available, reset the state
        setStartingOllama(false);
        clearInterval(statusCheckInterval.current);
      }

      return isAvailable;
    } catch (error) {
      console.log('Ollama status check failed:', error);
      setIsOllamaAvailable(false);

      if (startIfUnavailable) {
        startOllamaService();
      }

      return false;
    }
  }, [startingOllama]);

  // Start Ollama service
  const startOllamaService = useCallback(() => {
    if (startingOllama) return; // Already starting

    setStartingOllama(true);
    setCheckAttempts(0);

    // Function to start the service
    const startService = async () => {
      try {
        // Here we'd call our backend endpoint to start Ollama
        // For now, let's simulate it with a fetch call
        const response = await fetch('/api/start-ollama', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          console.log('Ollama start command sent successfully');
          // We still need to check status to confirm it's running
          beginStatusCheck();
        } else {
          console.error('Failed to start Ollama');
          setStartingOllama(false);
        }
      } catch (error) {
        console.error('Error starting Ollama:', error);

        // Fallback: show instructions to manually start
        setStartingOllama(false);
      }
    };

    // Check status periodically after start attempt
    const beginStatusCheck = () => {
      // Clear any existing interval
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }

      // Check status immediately
      checkOllamaStatus();

      // Then check every 3 seconds
      statusCheckInterval.current = setInterval(() => {
        setCheckAttempts(prev => {
          const newAttempts = prev + 1;
          console.log(`Checking Ollama status (attempt ${newAttempts})`);

          // Stop checking after 20 attempts (60 seconds)
          if (newAttempts >= 20) {
            clearInterval(statusCheckInterval.current);
            setStartingOllama(false);
            return newAttempts;
          }

          // Check the status
          checkOllamaStatus();
          return newAttempts;
        });
      }, 3000);
    };

    // Start the service
    startService();
  }, [startingOllama, checkOllamaStatus]);

  // Initial status check when component mounts
  useEffect(() => {
    checkOllamaStatus();

    // Clean up interval on unmount
    return () => {
      if (statusCheckInterval.current) {
        clearInterval(statusCheckInterval.current);
      }
    };
  }, [checkOllamaStatus]);

  // Check status when chat is opened
  useEffect(() => {
    if (isChatOpen) {
      checkOllamaStatus();
    }
  }, [isChatOpen, checkOllamaStatus]);

  // Simple method to send a message
  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Create a placeholder for the assistant's response
    const assistantMessageId = Date.now() + 1;
    streamingMessageId.current = assistantMessageId;

    setMessages(prev => [
      ...prev,
      {
        id: assistantMessageId,
        content: '',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        isStreaming: true
      }
    ]);

    try {
      if (!isOllamaAvailable) {
        throw new Error('Ollama service not available');
      }

      // Use streaming for a more interactive experience
      await ollamaService.streamResponse(
        content,
        propertyContext,
        (chunk) => {
          // Update the message content as chunks come in
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + chunk }
              : msg
          ));
        }
      );

      // Mark streaming as complete
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error) {
      console.error('Error sending message:', error);

      // Update the placeholder with an error message
      setMessages(prev => prev.map(msg =>
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: "I'm sorry, I'm having trouble connecting to my knowledge base. Please ensure Ollama is running on your computer with a mistral model, or try again in a moment.",
              isStreaming: false
            }
          : msg
      ));
    } finally {
      setIsTyping(false);
    }
  }, [isOllamaAvailable]);

  // Context value
  const value = {
    messages,
    isChatOpen,
    isTyping,
    isOllamaAvailable,
    startingOllama,
    setIsChatOpen,
    sendMessage,
    checkOllamaStatus,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

// Custom hook to use the chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

/**
 * Service for interacting with locally hosted Ollama models
 */
const ollamaService = {
  /**
   * Generate a response from the Mistral model
   *
   * @param {string} prompt - User message
   * @param {object} context - Real estate context information
   * @returns {Promise<string>} - AI response
   */
  generateResponse: async (prompt, context = {}) => {
    try {
      // Create a system prompt with real estate context
      const systemPrompt = `You are Remmi, an AI real estate assistant specializing in Dubai properties.
      You provide concise, helpful information about the Dubai real estate market, investment opportunities, and portfolio management.

      Real estate context:
      - Current market trends in Dubai show ${context.marketTrend || 'varied growth across neighborhoods'}.
      - Popular investment areas include Dubai Marina, JVC, Palm Jumeirah, and Dubai Hills.
      - The user has ${context.propertyCount || 'several'} properties in their portfolio.
      - Average ROI in Dubai currently ranges from 5-9% depending on location.

      Keep responses related to real estate, focused on Dubai market, and be specific with data when possible.
      Be friendly but professional, and limit responses to 2-3 short paragraphs maximum.`;

      // Format the prompt with context
      const formattedPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mistral',
          prompt: formattedPrompt,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || "I'm sorry, I couldn't generate a response. Please try again.";
    } catch (error) {
      console.error('Error calling Ollama:', error);

      let errorMessage = "I'm having trouble connecting to my knowledge base.";

      if (error.name === 'AbortError') {
        errorMessage += " The request timed out. Please ensure Ollama is running with the mistral model.";
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += " Please ensure Ollama is running and accessible.";
      }

      return errorMessage + " Please try again in a moment.";
    }
  },

  /**
   * Stream a response from the Mistral model
   *
   * @param {string} prompt - User message
   * @param {object} context - Real estate context information
   * @param {function} onChunk - Callback for each chunk of response
   * @returns {Promise<void>}
   */
  streamResponse: async (prompt, context = {}, onChunk) => {
    let responseStarted = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      // Create a system prompt with real estate context
      const systemPrompt = `You are Remmi, an AI real estate assistant specializing in Dubai properties.
      You provide concise, helpful information about the Dubai real estate market, investment opportunities, and portfolio management.

      Real estate context:
      - Current market trends in Dubai show ${context.marketTrend || 'varied growth across neighborhoods'}.
      - Popular investment areas include Dubai Marina, JVC, Palm Jumeirah, and Dubai Hills.
      - The user has ${context.propertyCount || 'several'} properties in their portfolio.
      - Average ROI in Dubai currently ranges from 5-9% depending on location.

      Keep responses related to real estate, focused on Dubai market, and be specific with data when possible.
      Be friendly but professional, and limit responses to 2-3 short paragraphs maximum.`;

      // Format the prompt with context
      const formattedPrompt = `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant:`;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mistral',
          prompt: formattedPrompt,
          stream: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      responseStarted = true;
      const reader = response.body.getReader();
      let decoder = new TextDecoder();
      let done = false;
      let emptyChunksCount = 0;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (done) break;

        const chunk = decoder.decode(value);
        try {
          // Each line is a separate JSON object
          const lines = chunk.split('\n').filter(line => line.trim() !== '');

          if (lines.length === 0) {
            emptyChunksCount++;
            // If we get too many empty chunks, abort
            if (emptyChunksCount > 10) {
              throw new Error('Too many empty chunks received');
            }
            continue;
          }

          emptyChunksCount = 0; // Reset counter when we get actual data

          for (const line of lines) {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              onChunk(parsed.response);
            }
          }
        } catch (e) {
          console.error('Error parsing streaming response:', e);
          // Don't throw here, just log and continue
        }
      }
    } catch (error) {
      console.error('Error streaming from Ollama:', error);

      let errorMessage = "I'm having trouble connecting to my knowledge base.";

      if (error.name === 'AbortError') {
        errorMessage += " The request timed out. Please ensure Ollama is running with the mistral model.";
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += " Please ensure Ollama is running and accessible.";
      } else if (!responseStarted) {
        errorMessage += " Could not establish connection to Ollama.";
      }

      onChunk(errorMessage + " Please try again in a moment.");
    }
  }
};

export default ollamaService;

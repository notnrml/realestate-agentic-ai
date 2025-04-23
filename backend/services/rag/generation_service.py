from typing import List, Dict, Any
import logging
from config.model_config import OLLAMA_API_URL, MODEL_NAME
import httpx
import json

logger = logging.getLogger(__name__)

class GenerationService:
    def __init__(self, model_name: str = MODEL_NAME):
        self.model_name = model_name
        
    async def generate_response(
        self,
        query: str,
        context: List[Dict[str, Any]],
        max_tokens: int = 500
    ) -> str:
        """Generate response using context"""
        try:
            # Prepare context string
            context_str = "\n\n".join(
                f"Source {i+1}:\n{doc['text']}"
                for i, doc in enumerate(context)
            )
            
            # Prepare prompt
            prompt = f"""Based on the following context, answer the question. 
            If you cannot find the answer in the context, say so.
            
            Context:
            {context_str}
            
            Question: {query}
            
            Answer:"""
            
            # Call Ollama
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{OLLAMA_API_URL}/generate",
                    json={
                        "model": self.model_name,
                        "prompt": prompt,
                        "max_tokens": max_tokens,
                        "temperature": 0.7
                    }
                )
                
                if response.status_code != 200:
                    raise Exception(f"Ollama error: {response.text}")
                
                result = response.json()
                return result["response"]
                
        except Exception as e:
            logger.error(f"Failed to generate response: {e}")
            return "I apologize, but I encountered an error generating a response." 
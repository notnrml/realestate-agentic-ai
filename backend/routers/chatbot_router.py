from fastapi import APIRouter, HTTPException
import httpx
import asyncio
import logging
from pydantic import BaseModel
from typing import List, Optional
from backend.config.model_config import MODEL_NAME, OLLAMA_API_URL

# Setup logging
logger = logging.getLogger("chatbot_router")
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    system_prompt: Optional[str] = "You are an AI assistant specializing in real estate investment analysis. Help users analyze market trends, property values, ROI, and investment strategies. Provide clear, concise responses."

class ChatResponse(BaseModel):
    response: str
    model: str
    processing_time: float

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """
    Chat with the AI assistant using Ollama's Mistral model
    """
    start_time = asyncio.get_event_loop().time()
    logger.info(f"Received chat request with {len(request.messages)} messages")

    # Format messages for Ollama API
    formatted_messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

    payload = {
        "model": MODEL_NAME,
        "messages": formatted_messages,
        "stream": False
    }

    if request.system_prompt:
        payload["system"] = request.system_prompt

    try:
        logger.info(f"Sending request to Ollama API at {OLLAMA_API_URL}/chat with payload: {payload}")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(f"{OLLAMA_API_URL}/chat", json=payload)
            logger.info(f"Received response status: {response.status_code}")

            if response.status_code != 200:
                error_text = response.text
                logger.error(f"Ollama returned status {response.status_code}: {error_text}")
                raise HTTPException(status_code=500, detail=f"Ollama error: {error_text}")

            try:
                result = response.json()
                logger.info(f"Received response from Ollama API: {result}")
            except Exception as e:
                logger.error(f"Failed to parse JSON response: {e}. Response text: {response.text}")
                raise HTTPException(status_code=500, detail=f"Failed to parse Ollama response: {str(e)}")

            end_time = asyncio.get_event_loop().time()
            processing_time = end_time - start_time

            # Try different response formats based on the Ollama version
            assistant_message = ""

            # First try the standard format for newer Ollama versions
            if "message" in result and isinstance(result["message"], dict) and "content" in result["message"]:
                assistant_message = result["message"]["content"]
                logger.info("Using message.content format")

            # Try alternative format for older versions
            elif "response" in result:
                assistant_message = result["response"]
                logger.info("Using response format")

            # Other possible formats
            elif "choices" in result and len(result["choices"]) > 0:
                if "message" in result["choices"][0]:
                    assistant_message = result["choices"][0]["message"].get("content", "")
                    logger.info("Using choices[0].message.content format")
                elif "text" in result["choices"][0]:
                    assistant_message = result["choices"][0]["text"]
                    logger.info("Using choices[0].text format")

            # Last resort - just take any text field we can find
            else:
                for key, value in result.items():
                    if isinstance(value, str) and value.strip():
                        assistant_message = value
                        logger.info(f"Using fallback format with key: {key}")
                        break

            if not assistant_message:
                logger.warning("No response content in Ollama result")
                assistant_message = "I'm sorry, I couldn't process your request. The AI model didn't return a valid response."

            return ChatResponse(
                response=assistant_message,
                model=MODEL_NAME,
                processing_time=processing_time
            )

    except httpx.HTTPError as e:
        logger.error(f"HTTP error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error communicating with Ollama: {str(e)}")

    except Exception as e:
        logger.error(f"Unexpected error occurred: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/create-health")
async def health_create_chatbot():
    return {"status": "Create endpoint is healthy"}

@router.get("/read-health")
async def health_read_chatbot():
    return {"status": "Read endpoint is healthy"}

@router.put("/update-health")
async def health_update_chatbot():
    return {"status": "Update endpoint is healthy"}

@router.delete("/delete-health")
async def health_delete_chatbot():
    return {"status": "Delete endpoint is healthy"}

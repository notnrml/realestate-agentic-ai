from fastapi import APIRouter, HTTPException
import httpx
import asyncio
import logging
from pydantic import BaseModel
from typing import List, Optional
from config.model_config import OLLAMA_API_URL, MODEL_NAME, select_best_available_model

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
    system_prompt: Optional[str] = """You are a real estate investment advisor specializing in Dubai properties. Analyze market trends, property values, and ROI calculations efficiently.

Key Areas: Dubai Marina, Downtown Dubai, Palm Jumeirah, JVC, Business Bay
Key Metrics: Price/sqft, rental yields, appreciation rates, occupancy rates
ROI Factors: Purchase price, rental income, maintenance costs, financing

Respond concisely with data-driven insights."""

class ChatResponse(BaseModel):
    response: str
    model: str
    processing_time: float

async def test_ollama_connection():
    """Test if Ollama is accessible"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_API_URL}/tags")
            if response.status_code == 200:
                return True
            return False
    except Exception:
        return False

def simplify_message_if_needed(message_content, max_length=500):
    """Simplify a message if it's too long to reduce processing time"""
    if len(message_content) > max_length:
        logger.info(f"Message length ({len(message_content)}) exceeds {max_length} chars, simplifying")
        # Just keep the first part and add a note about truncation
        return message_content[:max_length] + " [Note: Your query was summarized for faster processing]"
    return message_content

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(request: ChatRequest):
    """
    Chat with the AI assistant using Ollama's model
    """
    start_time = asyncio.get_event_loop().time()
    logger.info(f"Received chat request with {len(request.messages)} messages")

    # Check if Ollama is running
    is_connected = await test_ollama_connection()
    if not is_connected:
        raise HTTPException(
            status_code=503,
            detail="Could not connect to Ollama. Please make sure the Ollama service is running."
        )

    try:
        # Try to select the best available model
        model_name = await select_best_available_model()
        logger.info(f"Using model: {model_name}")
    except Exception as e:
        # If model selection fails, use the default Mistral model
        model_name = "mistral:7b-instruct"
        logger.warning(f"Model selection failed, falling back to {model_name}: {str(e)}")

    # Format messages for Ollama API, simplifying long messages
    formatted_messages = []
    for msg in request.messages:
        # Simplify long messages to prevent timeouts
        simplified_content = simplify_message_if_needed(msg.content)
        formatted_messages.append({"role": msg.role, "content": simplified_content})

    payload = {
        "model": model_name,
        "messages": formatted_messages,
        "stream": False,
        # Add parameters to make responses faster and more concise
        "temperature": 0.7,
        "top_p": 0.9,
        "max_tokens": 500  # Limit response length to avoid timeouts
    }

    if request.system_prompt:
        payload["system"] = request.system_prompt

    try:
        logger.info(f"Sending request to Ollama API at {OLLAMA_API_URL}/chat with payload: {payload}")
        # Increase the timeout to ensure we don't timeout for complex queries
        async with httpx.AsyncClient(timeout=300.0) as client:
            # Add a clear header to avoid any encoding issues
            headers = {
                "Content-Type": "application/json",
            }

            try:
                logger.info(f"Sending request to model: {model_name}")
                response = await client.post(
                    f"{OLLAMA_API_URL}/chat",
                    json=payload,
                    headers=headers
                )
                logger.info(f"Received response status: {response.status_code}")

                # If we get an error with the selected model, try falling back to mistral:7b-instruct
                if response.status_code != 200 and model_name != "mistral:7b-instruct":
                    logger.warning(f"Failed with model {model_name}, trying mistral:7b-instruct instead")
                    payload["model"] = "mistral:7b-instruct"
                    model_name = "mistral:7b-instruct"

                    response = await client.post(
                        f"{OLLAMA_API_URL}/chat",
                        json=payload,
                        headers=headers
                    )
                    logger.info(f"Fallback response status: {response.status_code}")

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
            except httpx.TimeoutException as e:
                logger.error(f"Request to Ollama timed out: {str(e)}")
                raise HTTPException(
                    status_code=504,
                    detail="The request to the AI model timed out. Try again with a simpler query or try later."
                )
            except httpx.ConnectError as e:
                logger.error(f"Failed to connect to Ollama: {str(e)}")
                raise HTTPException(
                    status_code=503,
                    detail="Could not connect to the AI model service. Please check if Ollama is running."
                )

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
                model=model_name,
                processing_time=processing_time
            )

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

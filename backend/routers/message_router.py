import json
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import asyncio
from typing import Optional
from backend.config.model_config import MODEL_NAME, OLLAMA_API_URL

# Setup logging
logger = logging.getLogger("model_router")
logger.setLevel(logging.INFO)
# You can set a handler if you want logs in a file or customize the format
ch = logging.StreamHandler()  # Output to console
ch.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

# Create router
router = APIRouter(prefix="/model", tags=["Model"])

# Simple request/response models
class MessageRequest(BaseModel):
    message: str
    system_prompt: Optional[str] = None

class MessageResponse(BaseModel):
    response: str
    model: str
    processing_time: float

@router.post("/send", response_model=MessageResponse)
async def send_message(request: MessageRequest):
    """
    Simple endpoint to send a message to the model and get a response.
    """
    start_time = asyncio.get_event_loop().time()
    logger.info(f"Received request to send message: {request.message}")
    
    payload = {
        "model": MODEL_NAME,
        "prompt": request.message,
        "stream": False  # Set to False for non-streaming response so that it waits for the whole response from the model to reply, instead of word by word
    }
   
    if request.system_prompt:
        payload["system"] = request.system_prompt
        logger.info(f"Using system prompt: {request.system_prompt}")
   
    try:
        logger.info(f"Sending request to Ollama API with payload: {payload}")
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{OLLAMA_API_URL}/generate", json=payload)
            if response.status_code != 200:
                logger.error(f"Ollama returned status {response.status_code}: {response.text}")
                raise HTTPException(status_code=500, detail=f"Ollama error: {response.text}")
            
            result = response.json()

            if response.status_code != 200:
                logger.error(f"Ollama returned status {response.status_code}: {response.text}")
                raise HTTPException(status_code=500, detail=f"Ollama error: {response.text}")

            
            # Handle the response appropriately
            result = await response.json()

            logger.info(f"Received response from Ollama API: {result}")
            
            end_time = asyncio.get_event_loop().time()
            processing_time = end_time - start_time
            logger.info(f"Processed request in {processing_time:.2f} seconds.")
            
            return MessageResponse(
                response=result["response"],
                model=MODEL_NAME,
                processing_time=processing_time
            )
    except httpx.HTTPError as e:
        if hasattr(e, "response") and e.response is not None:
            logger.error(f"HTTP error occurred: {e.response.status_code} - {e.response.text}")
        else:
            logger.error(f"HTTP error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error communicating with Ollama: {str(e)}")

    except httpx.HTTPError as e:
        logger.error(f"HTTP error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error communicating with Ollama: {str(e)}")
    
    except json.JSONDecodeError as e:
        logger.error(f"Error parsing response from Ollama: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error parsing response from Ollama: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error occurred: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

    
@router.get("/health")
async def health_check_for_model():
    """
    Check if the model service is available
    """
    try:
        logger.info("Checking health of the model service...")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OLLAMA_API_URL}/tags")
            response.raise_for_status()
            logger.info("Model service is available")
            return {"status": "ok", "model_service": "available"}
    except httpx.HTTPError:
        logger.error("Model service is unavailable")
        raise HTTPException(status_code=503, detail="Model service unavailable")

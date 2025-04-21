"""
Simple router for direct Ollama model interaction
"""
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import asyncio
from typing import Optional
from backend.config.model_config import MODEL_NAME, OLLAMA_API_URL

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
   
    payload = {
        "model": MODEL_NAME,
        "prompt": request.message,
        "stream": False  # Set to False for non-streaming response so that it waits for the whole response from the model to reply, instead of word by word
    }
   
    if request.system_prompt:
        payload["system"] = request.system_prompt
   
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(f"{OLLAMA_API_URL}/generate", json=payload)
            response.raise_for_status()
            
            # Handle the response appropriately
            result = response.json()
           
            end_time = asyncio.get_event_loop().time()
            return MessageResponse(
                response=result["response"],
                model=MODEL_NAME,
                processing_time=end_time - start_time
            )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with Ollama: {str(e)}")
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Error parsing response from Ollama: {str(e)}")
    
@router.get("/health")
async def health_check_for_model():
    """
    Check if the model service is available
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{OLLAMA_API_URL}/tags")
            response.raise_for_status()
            return {"status": "ok", "model_service": "available"}
    except httpx.HTTPError:
        raise HTTPException(status_code=503, detail="Model service unavailable")
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
import logging
import requests
from datetime import datetime

router = APIRouter(
    prefix="/advisor",
    tags=["Advisor Agent"]
)
logger = logging.getLogger(__name__)

# Ollama API endpoint
OLLAMA_API_URL = "http://localhost:11434/api/generate"

class MessageRequest(BaseModel):
    property_type: str
    location: str
    price: float
    roi: float
    risk_level: str

@router.post("/create-health")
async def health_create_advisor():
    return {"status": "Create endpoint is healthy"}

@router.get("/read-health")
async def health_read_advisor():
    return {"status": "Read endpoint is healthy"}

@router.put("/update-health")
async def health_update_advisor():
    return {"status": "Update endpoint is healthy"}

@router.delete("/delete-health")
async def health_delete_advisor():
    return {"status": "Delete endpoint is healthy"}

@router.post("/generate-message")
async def generate_message(request: MessageRequest):
    try:
        # Create a prompt for Ollama
        prompt = f"""Generate a concise, professional message expressing interest in a real estate investment opportunity.
        Property Type: {request.property_type}
        Location: {request.location}
        Price: AED {request.price:,.0f}
        ROI: {request.roi}%
        Risk Level: {request.risk_level}

        The message should:
        1. Be direct and professional
        2. Focus on the key metrics (ROI and risk level)
        3. Express interest in discussing details
        4. Be no more than 2-3 sentences
        5. Sound natural and human-like
        """

        # Get response from Ollama
        response = requests.post(
            OLLAMA_API_URL,
            json={
                "model": "mistral",
                "prompt": prompt,
                "stream": False
            }
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to generate message with Ollama")
        
        return {"message": response.json()["response"].strip()}

    except Exception as e:
        logger.error(f"Error generating message: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

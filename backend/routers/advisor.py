from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import json
import os
import datetime
from mistralai.client import MistralClient

router = APIRouter()

# In-memory storage for feedback
user_memory = {}

# Initialize Mistral client
mistral_client = MistralClient(api_key=os.getenv("MISTRAL_API_KEY"))

class FeedbackRequest(BaseModel):
    unit_id: str
    strategy: str
    decision: str

class MessageRequest(BaseModel):
    property_type: str
    location: str
    price: float
    roi: float
    risk_level: str

@router.post("/feedback")
async def save_feedback(feedback: FeedbackRequest):
    try:
        # Create feedback directory if it doesn't exist
        os.makedirs("feedback", exist_ok=True)
        
        # Load existing feedback if any
        feedback_file = "feedback/user_feedback.json"
        if os.path.exists(feedback_file):
            with open(feedback_file, "r") as f:
                user_memory = json.load(f)
        
        # Update feedback
        if feedback.unit_id not in user_memory:
            user_memory[feedback.unit_id] = []
        
        user_memory[feedback.unit_id].append({
            "strategy": feedback.strategy,
            "decision": feedback.decision,
            "timestamp": datetime.datetime.now().isoformat()
        })
        
        # Save to file
        with open(feedback_file, "w") as f:
            json.dump(user_memory, f, indent=2)
        
        return {
            "status": "success",
            "message": "Feedback saved successfully",
            "memory": user_memory[feedback.unit_id]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/feedback/{unit_id}")
async def get_feedback(unit_id: str):
    try:
        feedback_file = "feedback/user_feedback.json"
        if os.path.exists(feedback_file):
            with open(feedback_file, "r") as f:
                user_memory = json.load(f)
                return user_memory.get(unit_id, [])
        return []
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

""" @router.post("/generate-message")
async def generate_message(request: MessageRequest):
    try:
        # Create a prompt for Mistral
        prompt = f"Generate a concise, professional message expressing interest in a real estate investment opportunity.
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
        6. Not mention AI or technology
        "

        # Get response from Mistral
        response = mistral_client.chat(
            model="mistral-medium",
            messages=[
                ChatMessage(role="system", content="You are a professional real estate investor. Write concise, direct messages."),
                ChatMessage(role="user", content=prompt)
            ],
            temperature=0.7,
            max_tokens=100
        )

        return {"message": response.choices[0].message.content.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  
        """
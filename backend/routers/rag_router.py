from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from services.rag_service import RAGService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/rag",
    tags=["RAG"]
)

# Initialize RAG service
rag_service = RAGService()
is_initialized = False

@router.on_event("startup")
async def startup_event():
    """Initialize RAG service on startup"""
    global is_initialized
    try:
        # Process and index data
        success = await rag_service.process_and_index_data()
        if not success:
            logger.error("Failed to initialize RAG service")
        else:
            is_initialized = True
            logger.info("RAG service initialized successfully")
    except Exception as e:
        logger.error(f"Error during RAG service initialization: {e}")

class QueryRequest(BaseModel):
    query: str
    max_results: int = 5

@router.post("/query")
async def query_knowledge_base(request: QueryRequest):
    """Query the knowledge base using RAG"""
    global is_initialized
    
    if not is_initialized:
        raise HTTPException(
            status_code=503,
            detail="RAG service is not initialized yet. Please try again in a few moments."
        )
    
    try:
        result = await rag_service.query(
            query=request.query,
            limit=request.max_results
        )
        
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error querying knowledge base: {e}")
        raise HTTPException(status_code=500, detail=str(e))
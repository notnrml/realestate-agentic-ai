from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
import os
import shutil
from typing import Optional
import uuid
from ..services.csv_analysis_service import CSVAnalysisService

router = APIRouter(prefix="/csv-analysis", tags=["CSV Analysis"])

# Create a directory for temporary file storage if it doesn't exist
UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize the CSV analysis service
csv_service = CSVAnalysisService()

@router.post("/analyze")
async def analyze_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    analysis_type: Optional[str] = Form("general")
):
    """
    Upload and analyze a CSV file.
    
    Args:
        file: The CSV file to analyze
        analysis_type: Type of analysis to perform (default: "general")
        
    Returns:
        Analysis results
    """
    # Validate file extension
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    # Generate a unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    try:
        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Analyze the CSV file
        result = await csv_service.analyze_csv(file_path, analysis_type)
        
        # Schedule file deletion
        background_tasks.add_task(os.remove, file_path)
        
        if not result["success"]:
            raise HTTPException(status_code=500, detail=result["error"])
        
        return JSONResponse(content=result)
        
    except Exception as e:
        # Clean up the file in case of error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis-types")
async def get_analysis_types():
    """
    Get available analysis types.
    
    Returns:
        List of available analysis types
    """
    return {
        "analysis_types": [
            {
                "id": "general",
                "name": "General Analysis",
                "description": "Basic analysis of the data with key insights and patterns"
            },
            {
                "id": "market_trends",
                "name": "Market Trends Analysis",
                "description": "Detailed analysis of market trends, price movements, and area popularity"
            },
            {
                "id": "price_analysis",
                "name": "Price Analysis",
                "description": "In-depth analysis of pricing trends and value for money"
            }
        ]
    } 
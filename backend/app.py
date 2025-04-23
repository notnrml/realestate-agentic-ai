<<<<<<< HEAD
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routers.market_trends_router import router as market_trends_router
from routers.advisor_router import router as advisor_router
from routers.message_router import router as message_router
import uvicorn
from dotenv import load_dotenv
import os
from pathlib import Path
from typing import List, Dict, Any
import pandas as pd
=======
from typing import List
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

import pandas as pd
from backend.routers.market_trends_router import router as market_router
from backend.routers.my_portfolio_router import router as portfolio_router
from backend.routers.chatbot_router import router as chatbot_router
from backend.routers.advisor_router import router as advisor_router
from backend.routers.message_router import router as model_router
from backend.routers import advisor

from backend.config.db_config import init_sqlite_db
>>>>>>> origin/main

# Load environment variables
load_dotenv()

<<<<<<< HEAD
# Create FastAPI app
app = FastAPI(
    title="Remmi Real Estate AI",
    description="Agentic AI system for real estate investment and management",
    version="1.0.0"
)

# Configure CORS
=======
init_sqlite_db()

# Allow frontend to call backend
>>>>>>> origin/main
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

<<<<<<< HEAD
# Include routers
app.include_router(market_trends_router)
app.include_router(advisor_router)
app.include_router(message_router)

# Configuration
UPLOAD_FOLDER = Path('uploads')  # Updated path
=======
# Configuration
UPLOAD_FOLDER = Path('backend/uploads')  # Updated path
>>>>>>> origin/main
ALLOWED_EXTENSIONS = {'csv', 'xlsx', 'xls', 'txt'}

# Create upload directory if it doesn't exist
UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)

def allowed_file(filename: str) -> bool:
    if not filename:
        return False
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

<<<<<<< HEAD
def analyze_property(property_data: Dict[str, Any]) -> List[Dict[str, str]]:
=======
def analyze_property(property_data: dict) -> List[dict]:
>>>>>>> origin/main
    """Generate AI insights for a single property"""
    insights = []
    
    # ROI Analysis
    if property_data['roi'] < 5:
        insights.append({
            'type': 'warning',
            'message': f"Low ROI detected for {property_data['name']}",
            'suggestion': 'Consider reviewing rental rates or property value'
        })
    elif property_data['roi'] > 10:
        insights.append({
            'type': 'positive',
            'message': f"Excellent ROI for {property_data['name']}",
            'suggestion': 'This property is performing above market average'
        })

    # Occupancy Analysis
    if property_data['occupancyRate'] < 80:
        insights.append({
            'type': 'warning',
            'message': f"Low occupancy rate for {property_data['name']}",
            'suggestion': 'Review marketing strategy and pricing'
        })

    # Risk Analysis
    if property_data['riskLevel'] == 'High':
        insights.append({
            'type': 'negative',
            'message': f"High risk property: {property_data['name']}",
            'suggestion': 'Consider diversifying your portfolio'
        })

    return insights

<<<<<<< HEAD
async def process_portfolio(file_path: str) -> Dict[str, Any]:
=======
async def process_portfolio(file_path: str) -> dict:
>>>>>>> origin/main
    """Process uploaded portfolio file and generate insights"""
    try:
        # Read the file based on extension
        if file_path.endswith('.txt'):
            # Read text file and convert to DataFrame
            with open(file_path, 'r') as f:
                lines = f.readlines()
            # Assuming tab or comma separated values
            data = []
            headers = lines[0].strip().replace('\t', ',').split(',')
            for line in lines[1:]:
                values = line.strip().replace('\t', ',').split(',')
                if len(values) == len(headers):
                    data.append(dict(zip(headers, values)))
            df = pd.DataFrame(data)
        elif file_path.endswith('.csv'):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        # Convert DataFrame to list of properties
        properties = []
        for _, row in df.iterrows():
            property_data = {
                'id': len(properties) + 1,
                'name': row.get('name', 'Unnamed Property'),
                'location': row.get('location', 'Unknown Location'),
                'purchasePrice': float(row.get('purchasePrice', 0)),
                'currentValue': float(row.get('currentValue', 0)),
                'monthlyRent': float(row.get('monthlyRent', 0)),
                'occupancyRate': float(row.get('occupancyRate', 0)),
                'roi': float(row.get('roi', 0)),
                'riskLevel': row.get('riskLevel', 'Medium'),
                'image': row.get('image', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')
            }
            properties.append(property_data)

        # Generate insights for each property
        all_insights = []
        for property_data in properties:
            property_insights = analyze_property(property_data)
            all_insights.extend(property_insights)

        # Add portfolio-level insights
        total_value = sum(p['currentValue'] for p in properties)
        avg_roi = sum(p['roi'] for p in properties) / len(properties)
        
        if total_value > 10000000:  # 10M AED
            all_insights.append({
                'type': 'positive',
                'message': 'Large portfolio value detected',
                'suggestion': 'Consider diversifying across different property types'
            })

        if avg_roi < 5:
            all_insights.append({
                'type': 'warning',
                'message': 'Portfolio ROI below market average',
                'suggestion': 'Review underperforming properties'
            })

        return {
            'properties': properties,
            'insights': all_insights
        }

    except Exception as e:
        print(f"Error processing file: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        if not file or not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
            
        if not allowed_file(file.filename):
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type. Allowed types are: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Save the uploaded file
        file_path = UPLOAD_FOLDER / file.filename
        
        # Ensure the directory exists
        UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)
        
        # Save file
        try:
            contents = await file.read()
            with open(file_path, "wb") as f:
                f.write(contents)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save file: {str(e)}"
            )
            
        # Process the file
        try:
            result = await process_portfolio(str(file_path))
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process file: {str(e)}"
            )
        finally:
            # Clean up
            if file_path.exists():
                file_path.unlink()
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )

@app.get("/")
<<<<<<< HEAD
async def root():
    """
    Root endpoint to verify the API is working.
    """
    return {
        "status": "success",
        "message": "Remmi Real Estate AI API is running",
        "version": "1.0.0"
    }

if __name__ == '__main__':
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
=======
def read_root():
    return {"message": "Backend is working!"}

# Include all routers
app.include_router(model_router)
app.include_router(market_router)
app.include_router(portfolio_router)
app.include_router(chatbot_router)
app.include_router(advisor_router, prefix="/api/advisor", tags=["advisor"])
#app.include_router(advisor.router, prefix="/api/advisor", tags=["advisor"])

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
>>>>>>> origin/main

"""
SAMPLE APP STRUCTURE

from fastapi import FastAPI
from pydantic import BaseModel
from agents.core_agent import run_agent

app = FastAPI()

class Query(BaseModel):
    message: str

@app.post("/analyze")
def analyze(query: Query):
    response = run_agent(query.message)
    return {"response": response}

"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import csv_analysis_router

app = FastAPI(title="Real Estate AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(csv_analysis_router.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Real Estate AI API"} 
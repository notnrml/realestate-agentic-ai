from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, List, Dict, Optional
from backend.services.market_trends_service import market_trends_service
import logging
from backend.services.bayut_web_scraper import fetch_from_bayut

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/market-trends",
    tags=["Market Trends"]
)

# Health Check Endpoints
@router.post("/create-health")
async def health_create_market():
    return {"status": "Create endpoint is healthy"}

@router.get("/read-health")
async def health_read_market():
    return {"status": "Read endpoint is healthy"}

@router.put("/update-health")
async def health_update_market():
    return {"status": "Update endpoint is healthy"}

@router.delete("/delete-health")
async def health_delete_market():
    return {"status": "Delete endpoint is healthy"}

# Models for Data Transfer
class TrendCard(BaseModel):
    area: str
    trend: str  # "↑" or "↓"
    description: Optional[str] = None

class TrendSummary(BaseModel):
    daily_digest: List[str]
    area_trends: List[TrendCard]

class TransactionHistory(BaseModel):
    property_id: int
    transaction_date: str
    previous_price: float
    current_price: float
    price_change: float

class TrendAnalysis(BaseModel):
    trend_id: int
    area: str
    trend_type: str  # "growth", "decline", etc.
    forecast: str  # "positive", "negative", "neutral"
    risk_factor: float
    new_opportunities: Optional[List[str]] = []

class ChartData(BaseModel):
    labels: List[str]
    values: List[float]

# API Endpoints for Market Trends

# Endpoint to get current market trends for Dubai
@router.get("/current-trends", response_model=TrendSummary)
async def get_current_market_trends():
    try:
        logger.info("Fetching current market trends")
        area_trends = market_trends_service.get_area_trends()
        daily_digest = market_trends_service.get_daily_digest()
        
        logger.info(f"Successfully fetched trends. Found {len(area_trends)} area trends and {len(daily_digest)} digest items")
        
        return {
            "daily_digest": daily_digest,
            "area_trends": area_trends
        }
    except Exception as e:
        logger.error(f"Error in get_current_market_trends: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch market trends: {str(e)}"
        )

# Endpoint to analyze transaction history (price shifts, insights)
@router.get("/transaction-history/{property_id}", response_model=TransactionHistory)
async def get_transaction_history(property_id: int):
    # Example: Fetch transaction data for the specific property
    transaction_data = {
        "property_id": property_id,
        "transaction_date": "2025-04-22",
        "previous_price": 100000,
        "current_price": 105000,
        "price_change": 5000
    }
    return transaction_data

# Modified endpoint to crawl property listings from external sources
@router.get("/crawl-data", response_model=Dict[str, Any])
async def crawl_property_listings(max_pages: int = 2):
    """
    Crawl property listings from Bayut.
    
    Args:
        max_pages: Maximum number of pages to scrape (default: 2)
    
    Returns:
        JSON response containing scraped property data and status info
    """
    try:
        logger.info(f"Starting Bayut property data crawl for {max_pages} pages")
        
        # Call the fetch_from_bayut function
        df = fetch_from_bayut(max_pages=max_pages)
        
        if df.empty:
            logger.warning("No data was scraped from Bayut")
            return {
                "status": "completed",
                "source": "Bayut",
                "message": "No data was found or could be scraped",
                "properties": []
            }
        
        # Convert DataFrame to list of dictionaries (JSON serializable)
        properties_data = df.to_dict(orient='records')
        
        logger.info(f"Successfully scraped {len(properties_data)} property listings")
        
        return {
            "status": "completed",
            "source": "Bayut",
            "message": f"Successfully scraped {len(properties_data)} properties",
            "count": len(properties_data),
            "properties": properties_data
        }
        
    except Exception as e:
        logger.error(f"Error in crawl_property_listings: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to crawl property data: {str(e)}"
        )

# Endpoint to spot emerging trends (e.g., new hotspots or market oversaturation)
@router.get("/trend-spotter", response_model=List[TrendCard])
async def get_emerging_trends():
    # Example: Use AI to identify emerging hotspots or oversaturation
    emerging_trends = [
        {"area": "Dubai Silicon Oasis", "trend": "↑", "description": "Emerging tech hub with growing demand"},
        {"area": "Jumeirah Lakes Towers", "trend": "↓", "description": "Oversaturated market with reduced ROI"}
    ]
    return emerging_trends

# Endpoint to monitor for tenant agents and market oversaturation
@router.get("/tenant-agents-oversaturation", response_model=Dict[str, str])
async def check_tenant_agents_oversaturation():
    # Example: Monitor market for oversaturation and aggressive pricing
    return {"status": "Oversaturation in Business Bay detected. Avoid investment."}

@router.get("/rental-trends-chart", response_model=ChartData)
async def get_rental_trends_chart():
    try:
        logger.info("Fetching rental trends chart data")
        chart_data = market_trends_service.get_rental_trends_chart()
        logger.info(f"Successfully fetched chart data with {len(chart_data['labels'])} data points")
        return chart_data
    except Exception as e:
        logger.error(f"Error in get_rental_trends_chart: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch rental trends chart: {str(e)}"
        )

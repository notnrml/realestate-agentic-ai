from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, List, Dict, Optional
from backend.services.market_trends_service import market_trends_service
import logging
from backend.services.bayut_web_scraper import fetch_from_bayut
from datetime import datetime, timedelta
import random

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

class DigestItem(BaseModel):
    location: str
    change: float
    is_increase: bool
    text: str

class TrendSummary(BaseModel):
    daily_digest: List[DigestItem]
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

class AIInsight(BaseModel):
    insight_id: int
    title: str
    description: str
    impact: str  # "high", "medium", "low"
    confidence: float
    source: str
    timestamp: str

class Transaction(BaseModel):
    id: int
    property_type: str
    location: str
    bedrooms: int
    bathrooms: int
    size_sqft: int
    transaction_date: str
    previous_price: float
    current_price: float
    price_change: float
    price_change_percent: float
    agent_name: str
    notes: Optional[str] = None

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

# Endpoint to get AI insights analysis
@router.get("/ai-insights", response_model=List[AIInsight])
async def get_ai_insights():
    """Get AI-generated insights about the real estate market"""
    try:
        logger.info("Generating AI insights")
        
        # Generate mock AI insights
        insights = [
            {
                "insight_id": 1,
                "title": "Downtown Dubai Price Correction",
                "description": "Downtown Dubai is experiencing a 5% price correction due to oversupply of luxury apartments. This presents a buying opportunity for long-term investors.",
                "impact": "high",
                "confidence": 0.87,
                "source": "Market Analysis AI",
                "timestamp": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d")
            },
            {
                "insight_id": 2,
                "title": "JVC Rental Demand Surge",
                "description": "Jumeirah Village Circle is seeing a 12% increase in rental demand due to new corporate offices opening in the area. Rental yields are expected to improve by 2.5% in the next 6 months.",
                "impact": "medium",
                "confidence": 0.92,
                "source": "Rental Market AI",
                "timestamp": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            },
            {
                "insight_id": 3,
                "title": "Palm Jumeirah Luxury Segment Growth",
                "description": "The luxury segment in Palm Jumeirah is showing resilience with a 3% price increase despite market challenges. High-net-worth individuals are still investing in premium properties.",
                "impact": "medium",
                "confidence": 0.78,
                "source": "Luxury Market AI",
                "timestamp": datetime.now().strftime("%Y-%m-%d")
            },
            {
                "insight_id": 4,
                "title": "Business Bay Oversaturation Risk",
                "description": "Business Bay is showing signs of oversaturation with a 7% increase in vacant properties. Rental prices are expected to decrease by 5% in the next quarter.",
                "impact": "high",
                "confidence": 0.85,
                "source": "Risk Analysis AI",
                "timestamp": (datetime.now() - timedelta(days=3)).strftime("%Y-%m-%d")
            },
            {
                "insight_id": 5,
                "title": "Dubai Silicon Oasis Tech Boom",
                "description": "Dubai Silicon Oasis is emerging as a tech hub with 15 new companies relocating to the area. Property values are expected to increase by 8% in the next year.",
                "impact": "high",
                "confidence": 0.91,
                "source": "Economic Forecast AI",
                "timestamp": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            }
        ]
        
        return insights
    except Exception as e:
        logger.error(f"Error in get_ai_insights: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate AI insights: {str(e)}"
        )

# Endpoint to get transaction history
@router.get("/transactions", response_model=List[Transaction])
async def get_transactions():
    """Get recent property transactions with detailed information"""
    try:
        logger.info("Generating transaction history")
        
        # Generate mock transaction data
        locations = ["Dubai Marina", "Downtown Dubai", "Business Bay", "Jumeirah Village Circle", "Palm Jumeirah", "Dubai Silicon Oasis"]
        property_types = ["Apartment", "Villa", "Townhouse", "Penthouse"]
        agent_names = ["Ali Khan", "Sarah Ahmed", "Mohammed Al Maktoum", "Fatima Al Hashemi", "James Wilson"]
        
        transactions = []
        for i in range(1, 11):
            # Generate random property details
            property_type = random.choice(property_types)
            location = random.choice(locations)
            bedrooms = random.randint(0, 5)
            bathrooms = random.randint(1, 4)
            size_sqft = random.randint(500, 3000)
            
            # Generate transaction details
            previous_price = random.randint(500000, 3000000)
            price_change_percent = random.uniform(-10, 15)
            price_change = previous_price * (price_change_percent / 100)
            current_price = previous_price + price_change
            
            # Generate transaction date (within the last 30 days)
            days_ago = random.randint(1, 30)
            transaction_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
            
            # Generate agent name
            agent_name = random.choice(agent_names)
            
            # Generate notes based on price change
            if price_change_percent > 5:
                notes = f"Strong appreciation in {location}. High demand area."
            elif price_change_percent < -5:
                notes = f"Price correction in {location}. Potential buying opportunity."
            else:
                notes = f"Stable market conditions in {location}."
            
            transactions.append({
                "id": i,
                "property_type": property_type,
                "location": location,
                "bedrooms": bedrooms,
                "bathrooms": bathrooms,
                "size_sqft": size_sqft,
                "transaction_date": transaction_date,
                "previous_price": round(previous_price, 2),
                "current_price": round(current_price, 2),
                "price_change": round(price_change, 2),
                "price_change_percent": round(price_change_percent, 2),
                "agent_name": agent_name,
                "notes": notes
            })
        
        return transactions
    except Exception as e:
        logger.error(f"Error in get_transactions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate transaction history: {str(e)}"
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
    """Get emerging market trends and hotspots"""
    try:
        logger.info("Generating emerging trends")
        
        # Generate mock emerging trends
        emerging_trends = [
            {
                "area": "Dubai Silicon Oasis",
                "trend": "↑",
                "description": "Emerging tech hub with growing demand. Rental prices increased by 12% in the last quarter."
            },
            {
                "area": "Jumeirah Lakes Towers",
                "trend": "↓",
                "description": "Oversaturated market with reduced ROI. Rental prices decreased by 8% due to high supply."
            },
            {
                "area": "Dubai Hills",
                "trend": "↑",
                "description": "Family-friendly community with increasing demand. Property values up by 15% year-over-year."
            },
            {
                "area": "Business Bay",
                "trend": "↓",
                "description": "Market correction in progress. Oversupply of office spaces affecting residential demand."
            },
            {
                "area": "Palm Jumeirah",
                "trend": "↑",
                "description": "Luxury segment showing resilience. Premium properties maintaining value despite market challenges."
            },
            {
                "area": "Dubai Marina",
                "trend": "→",
                "description": "Stable market with consistent demand. Rental yields remain attractive at 7-8%."
            }
        ]
        
        return emerging_trends
    except Exception as e:
        logger.error(f"Error in get_emerging_trends: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate emerging trends: {str(e)}"
        )

# Endpoint to monitor for tenant agents and market oversaturation
@router.get("/tenant-agents-oversaturation", response_model=Dict[str, str])
async def check_tenant_agents_oversaturation():
    """Get market oversaturation analysis"""
    try:
        logger.info("Generating market oversaturation analysis")
        
        # Generate mock oversaturation analysis
        oversaturation_analysis = {
            "status": "Oversaturation in Business Bay detected. Avoid investment in the short term. Consider Dubai Silicon Oasis for better ROI."
        }
        
        return oversaturation_analysis
    except Exception as e:
        logger.error(f"Error in check_tenant_agents_oversaturation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate market oversaturation analysis: {str(e)}"
        )

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

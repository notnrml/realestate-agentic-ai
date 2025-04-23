from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, List, Dict, Optional
<<<<<<< HEAD
from services.market_trends_service import market_trends_service
import logging
from services.bayut_web_scraper import fetch_from_bayut
=======
from backend.services.market_trends_service import market_trends_service
import logging
from backend.services.bayut_web_scraper import fetch_from_bayut
>>>>>>> origin/main
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

<<<<<<< HEAD
=======
class MarketOversaturation(BaseModel):
    id: int
    area: str
    riskLevel: str
    description: str
    recommendation: str

class TrendScannerResult(BaseModel):
    id: int
    pattern: str
    description: str
    impact: str
    affectedAreas: List[str]

>>>>>>> origin/main
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
<<<<<<< HEAD
@router.get("/trend-spotter", response_model=List[Dict[str, Any]])
=======
@router.get("/trend-spotter", response_model=List[TrendCard])
>>>>>>> origin/main
async def get_emerging_trends():
    """Get emerging market trends and hotspots"""
    try:
        logger.info("Generating emerging trends")
        
<<<<<<< HEAD
        # Generate mock emerging trends with more detailed data
        emerging_trends = [
            {
                "id": 1,
                "area": "Dubai Silicon Oasis",
                "trend": "↑",
                "description": "Emerging tech hub with growing demand. Rental prices increased by 12% in the last quarter.",
                "metrics": {
                    "price_change": 12.0,
                    "demand_change": 15.0,
                    "supply_change": 5.0,
                    "occupancy_rate": 92
                },
                "analysis": "Strong growth potential due to tech company relocations and new developments",
                "impact": "Positive",
                "confidence": 0.85,
                "affectedAreas": ["Dubai Silicon Oasis", "Dubai Internet City"],
                "source": "Market Analysis AI"
            },
            {
                "id": 2,
                "area": "Jumeirah Lakes Towers",
                "trend": "↓",
                "description": "Oversaturated market with reduced ROI. Rental prices decreased by 8% due to high supply.",
                "metrics": {
                    "price_change": -8.0,
                    "demand_change": -5.0,
                    "supply_change": 12.0,
                    "occupancy_rate": 78
                },
                "analysis": "Market correction in progress, consider waiting for better opportunities",
                "impact": "Negative",
                "confidence": 0.75,
                "affectedAreas": ["JLT", "Dubai Marina"],
                "source": "Market Analysis AI"
            },
            {
                "id": 3,
                "area": "Dubai Hills",
                "trend": "↑",
                "description": "Family-friendly community with increasing demand. Property values up by 15% year-over-year.",
                "metrics": {
                    "price_change": 15.0,
                    "demand_change": 20.0,
                    "supply_change": 8.0,
                    "occupancy_rate": 95
                },
                "analysis": "Excellent long-term investment potential with strong community growth",
                "impact": "Positive",
                "confidence": 0.90,
                "affectedAreas": ["Dubai Hills", "Dubai Sports City"],
                "source": "Market Analysis AI"
            },
            {
                "id": 4,
                "area": "Business Bay",
                "trend": "↓",
                "description": "Market correction in progress. Oversupply of office spaces affecting residential demand.",
                "metrics": {
                    "price_change": -5.0,
                    "demand_change": -3.0,
                    "supply_change": 10.0,
                    "occupancy_rate": 82
                },
                "analysis": "Short-term challenges but remains a key business district",
                "impact": "Negative",
                "confidence": 0.80,
                "affectedAreas": ["Business Bay", "Downtown Dubai"],
                "source": "Market Analysis AI"
            },
            {
                "id": 5,
                "area": "Palm Jumeirah",
                "trend": "↑",
                "description": "Luxury segment showing resilience. Premium properties maintaining value despite market challenges.",
                "metrics": {
                    "price_change": 7.0,
                    "demand_change": 10.0,
                    "supply_change": 3.0,
                    "occupancy_rate": 88
                },
                "analysis": "Strong luxury market with stable high-end demand",
                "impact": "Positive",
                "confidence": 0.85,
                "affectedAreas": ["Palm Jumeirah", "Dubai Marina"],
                "source": "Market Analysis AI"
            },
            {
                "id": 6,
                "area": "Dubai Marina",
                "trend": "→",
                "description": "Stable market with consistent demand. Rental yields remain attractive at 7-8%.",
                "metrics": {
                    "price_change": 2.0,
                    "demand_change": 5.0,
                    "supply_change": 4.0,
                    "occupancy_rate": 90
                },
                "analysis": "Mature market with reliable returns and steady growth",
                "impact": "Neutral",
                "confidence": 0.95,
                "affectedAreas": ["Dubai Marina", "JLT"],
                "source": "Market Analysis AI"
=======
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
>>>>>>> origin/main
            }
        ]
        
        return emerging_trends
    except Exception as e:
        logger.error(f"Error in get_emerging_trends: {str(e)}")
<<<<<<< HEAD
        # Return a safe fallback response instead of raising an error
        return [
            {
                "id": 1,
                "area": "Dubai Marina",
                "trend": "→",
                "description": "Stable market with consistent demand",
                "metrics": {
                    "price_change": 2.0,
                    "demand_change": 5.0,
                    "supply_change": 4.0,
                    "occupancy_rate": 90
                },
                "analysis": "Mature market with reliable returns",
                "impact": "Neutral",
                "confidence": 0.95,
                "affectedAreas": ["Dubai Marina"],
                "source": "Market Analysis AI"
            }
        ]
=======
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate emerging trends: {str(e)}"
        )
>>>>>>> origin/main

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

<<<<<<< HEAD
@router.get("/market-oversaturation", response_model=List[Dict[str, Any]])
async def get_market_oversaturation():
    """Get market oversaturation analysis for different areas"""
    try:
        logger.info("Generating market oversaturation analysis")
        
        # Generate mock oversaturation data
        areas = ['Business Bay', 'Dubai Marina', 'Downtown Dubai', 'JVC']
        oversaturation_data = []
        
        for area in areas:
            saturation_level = random.randint(0, 100)
            risk_level = "High" if saturation_level > 70 else "Medium" if saturation_level > 40 else "Low"
            
            oversaturation_data.append({
                "area": area,
                "saturation_level": saturation_level,
                "risk_level": risk_level,
                "description": f"{area} shows {'high' if saturation_level > 70 else 'moderate' if saturation_level > 40 else 'low'} market saturation",
                "recommendation": "Consider alternative areas" if saturation_level > 70 else "Monitor market conditions" if saturation_level > 40 else "Good investment opportunity"
            })
=======
# Endpoint to get market oversaturation data
@router.get("/market-oversaturation", response_model=List[MarketOversaturation])
async def get_market_oversaturation():
    """Get market oversaturation alerts for different areas"""
    try:
        logger.info("Generating market oversaturation data")
        
        # Generate mock market oversaturation data
        oversaturation_data = [
            {
                "id": 1,
                "area": "Jumeirah Lakes Towers",
                "riskLevel": "High",
                "description": "Market is oversaturated with rental properties. High competition is driving prices down.",
                "recommendation": "Consider selling or holding properties until market conditions improve."
            },
            {
                "id": 2,
                "area": "Business Bay",
                "riskLevel": "Medium",
                "description": "Growing number of new listings indicate potential oversaturation in the next 6 months.",
                "recommendation": "Monitor market closely and consider diversifying portfolio."
            }
        ]
>>>>>>> origin/main
        
        return oversaturation_data
    except Exception as e:
        logger.error(f"Error in get_market_oversaturation: {str(e)}")
        raise HTTPException(
            status_code=500,
<<<<<<< HEAD
            detail=f"Failed to generate market oversaturation analysis: {str(e)}"
        )

@router.get("/trend-scanner", response_model=List[Dict[str, Any]])
async def get_trend_scanner():
    """Get detailed trend analysis for different areas"""
    try:
        logger.info("Generating trend scanner analysis")
        
        # Generate mock trend scanner data
        areas = ['Dubai Marina', 'Downtown Dubai', 'Business Bay', 'JVC']
        trend_data = []
        
        for area in areas:
            price_change = random.uniform(-10, 15)
            demand_change = random.uniform(-5, 20)
            supply_change = random.uniform(-15, 10)
            
            trend_data.append({
                "area": area,
                "price_trend": "up" if price_change > 0 else "down",
                "price_change_percent": round(price_change, 1),
                "demand_trend": "up" if demand_change > 0 else "down",
                "demand_change_percent": round(demand_change, 1),
                "supply_trend": "up" if supply_change > 0 else "down",
                "supply_change_percent": round(supply_change, 1),
                "analysis": f"{area} shows {'positive' if price_change > 0 else 'negative'} price trends with {'increasing' if demand_change > 0 else 'decreasing'} demand"
            })
        
        return trend_data
    except Exception as e:
        logger.error(f"Error in get_trend_scanner: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate trend scanner analysis: {str(e)}"
        )

@router.get("/overlays", response_model=Dict[str, Any])
async def get_market_overlays():
    """Get market overlay data for different areas in GeoJSON format"""
    try:
        logger.info("Generating market overlay data")
        
        # Dubai area coordinates with their market data
        area_data = [
            {
                "name": "Dubai Marina",
                "coordinates": [55.1371, 25.0806],
                "metrics": {
                    "price_change": 5.2,
                    "demand": "high",
                    "risk_level": "low"
                }
            },
            {
                "name": "Downtown Dubai",
                "coordinates": [55.2744, 25.1972],
                "metrics": {
                    "price_change": -3.1,
                    "demand": "medium",
                    "risk_level": "medium"
                }
            },
            {
                "name": "Business Bay",
                "coordinates": [55.2667, 25.1872],
                "metrics": {
                    "price_change": -7.5,
                    "demand": "low",
                    "risk_level": "high"
                }
            },
            {
                "name": "Palm Jumeirah",
                "coordinates": [55.1376, 25.1124],
                "metrics": {
                    "price_change": 8.3,
                    "demand": "very high",
                    "risk_level": "low"
                }
            },
            {
                "name": "Jumeirah Village Circle",
                "coordinates": [55.2193, 25.0549],
                "metrics": {
                    "price_change": 12.5,
                    "demand": "high",
                    "risk_level": "low"
                }
            }
        ]
        
        # Convert to GeoJSON format
        features = []
        for idx, area in enumerate(area_data):
            # Determine icon and color based on metrics
            if area["metrics"]["risk_level"] == "high":
                icon = "exclamation-triangle"
                color = "#EF4444"  # red
            elif area["metrics"]["price_change"] > 0:
                icon = "arrow-up"
                color = "#10B981"  # green
            else:
                icon = "arrow-down"
                color = "#F59E0B"  # yellow
                
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": area["coordinates"]
                },
                "properties": {
                    "name": area["name"],
                    "icon": icon,
                    "color": color,
                    "alertIndex": idx,
                    "metrics": area["metrics"]
                }
            })
        
        geojson = {
            "type": "FeatureCollection",
            "features": features
        }
        
        return geojson
    except Exception as e:
        logger.error(f"Error in get_market_overlays: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate market overlay data: {str(e)}"
        )
=======
            detail=f"Failed to generate market oversaturation data: {str(e)}"
        )

# Endpoint to get trend scanner results
@router.get("/trend-scanner", response_model=List[TrendScannerResult])
async def get_trend_scanner_results():
    """Get trend scanner analysis results"""
    try:
        logger.info("Generating trend scanner results")
        
        # Generate mock trend scanner data
        trend_scanner_data = [
            {
                "id": 1,
                "pattern": "Increasing demand for waterfront properties",
                "description": "Our TrendSpotter has detected a 25% increase in searches for waterfront properties in the last 30 days.",
                "impact": "Positive",
                "affectedAreas": ["Dubai Marina", "Palm Jumeirah", "JBR"]
            },
            {
                "id": 2,
                "pattern": "Shift towards larger living spaces",
                "description": "TrendSpotter shows a 15% increase in searches for 3+ bedroom properties compared to smaller units.",
                "impact": "Positive",
                "affectedAreas": ["Dubai Hills", "Dubai Silicon Oasis", "Dubai Land"]
            },
            {
                "id": 3,
                "pattern": "Decreasing interest in studio apartments",
                "description": "Our analysis shows a 10% decrease in searches for studio apartments in the last quarter.",
                "impact": "Negative",
                "affectedAreas": ["Downtown Dubai", "Business Bay", "Dubai Marina"]
            }
        ]
        
        return trend_scanner_data
    except Exception as e:
        logger.error(f"Error in get_trend_scanner_results: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate trend scanner results: {str(e)}"
        )

@router.get("/overlays")
async def get_overlays():
    """Get combined TrendSpotter alert overlays"""
    # Static mock data for AI insights
    ai_insights = [
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
    # Static mock data for market oversaturation
    oversaturation_data = [
        {
            "id": 1,
            "area": "Jumeirah Lakes Towers",
            "riskLevel": "High",
            "description": "Market is oversaturated with rental properties. High competition is driving prices down.",
            "recommendation": "Consider selling or holding properties until market conditions improve."
        },
        {
            "id": 2,
            "area": "Business Bay",
            "riskLevel": "Medium",
            "description": "Growing number of new listings indicate potential oversaturation in the next 6 months.",
            "recommendation": "Monitor market closely and consider diversifying portfolio."
        }
    ]
    # Static mock data for trend scanner results
    trend_scanner_data = [
        {
            "id": 1,
            "pattern": "Increasing demand for waterfront properties",
            "description": "Our TrendSpotter has detected a 25% increase in searches for waterfront properties in the last 30 days.",
            "impact": "Positive",
            "affectedAreas": ["Dubai Marina", "Palm Jumeirah", "JBR"]
        },
        {
            "id": 2,
            "pattern": "Shift towards larger living spaces",
            "description": "TrendSpotter shows a 15% increase in searches for 3+ bedroom properties compared to smaller units.",
            "impact": "Positive",
            "affectedAreas": ["Dubai Hills", "Dubai Silicon Oasis", "Dubai Land"]
        },
        {
            "id": 3,
            "pattern": "Decreasing interest in studio apartments",
            "description": "Our analysis shows a 10% decrease in searches for studio apartments in the last quarter.",
            "impact": "Negative",
            "affectedAreas": ["Downtown Dubai", "Business Bay", "Dubai Marina"]
        }
    ]
    # Coordinate mapping for mock locations
    coord_map = {
        "Dubai Marina": [55.1384, 25.0785],
        "Downtown Dubai": [55.2760, 25.1972],
        "Business Bay": [55.2723, 25.1940],
        "Jumeirah Lakes Towers": [55.1744, 25.0783],
        "Palm Jumeirah": [55.1373, 25.1180],
        "Dubai Hills": [55.2141, 25.0575],
        "Dubai Silicon Oasis": [55.3895, 25.1314],
        "Jumeirah Village Circle": [55.2096, 25.0589],
        "JBR": [55.1400, 25.0800],
        "Dubai Land": [55.2000, 25.1000]
    }
    # Icon mapping by alert type
    icon_map = {"oversaturation": "exclamation-triangle", "ai-insight": "robot", "trend": "chart-line"}
    # Combine and sort alerts by priority: oversaturation, ai-insight, trend
    combined = []
    for o in oversaturation_data:
        combined.append({**o, "type": "oversaturation"})
    for ai in ai_insights:
        combined.append({**ai, "type": "ai-insight"})
    for t in trend_scanner_data:
        combined.append({**t, "type": "trend"})
    type_priority = {"oversaturation": 0, "ai-insight": 1, "trend": 2}
    combined.sort(key=lambda x: type_priority[x["type"]])
    # Build GeoJSON features
    features = []
    for idx, alert in enumerate(combined):
        # Determine coordinates
        if alert["type"] == "oversaturation":
            coords = coord_map.get(alert["area"])
        elif alert["type"] == "trend":
            coords = coord_map.get(alert["affectedAreas"][0])
        else:
            # Try to extract area from title for ai-insight
            matched = next((area for area in coord_map if area in alert.get("title", "")), None)
            coords = coord_map.get(matched)
        # Fallback to center if needed
        if not coords:
            coords = [55.2708, 25.2048]
        # Add small random jitter to avoid overlap of markers at same location
        coords = [
            coords[0] + random.uniform(-0.005, 0.005),
            coords[1] + random.uniform(-0.005, 0.005)
        ]
        # Determine color
        if alert["type"] == "oversaturation":
            color = "red" if alert["riskLevel"] == "High" else "orange"
        elif alert["type"] == "trend":
            color = "green" if alert["impact"] == "Positive" else ("red" if alert["impact"] == "Negative" else "yellow")
        else:
            color = "blue"
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": coords},
            "properties": {
                "id": alert.get("id") or alert.get("insight_id"),
                "type": alert["type"],
                "title": alert.get("title") or alert.get("pattern"),
                "description": alert.get("description"),
                "icon": icon_map[alert["type"]],
                "color": color,
                "alertIndex": idx
            }
        })
    return {"type": "FeatureCollection", "features": features}
>>>>>>> origin/main

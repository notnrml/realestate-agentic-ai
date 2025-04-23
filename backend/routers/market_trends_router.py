import re
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any, List, Dict, Optional
from backend.services.market_trends_service import market_trends_service
import logging
from backend.services.bayut_web_scraper import fetch_from_bayut
from datetime import datetime, timedelta
import random
import os
import pandas as pd
import json
import httpx
from backend.config.model_config import MODEL_NAME, OLLAMA_API_URL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS
import time

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

# Endpoint to expose all CSV data
@router.get("/csv-data", response_model=Dict[str, List[Dict[str, Any]]])
async def get_all_csv_data():
    """Expose all CSV data from the data directory"""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(os.path.dirname(os.path.dirname(current_dir)), 'backend', 'data')
        csv_files = [f for f in os.listdir(data_dir) if f.lower().endswith('.csv')]
        data = {}
        for filename in csv_files:
            file_path = os.path.join(data_dir, filename)
            df = pd.read_csv(file_path)
            data[filename] = df.to_dict(orient='records')
        logger.info(f"Exposed data for files: {csv_files}")
        return data
    except Exception as e:
        logger.error(f"Error in get_all_csv_data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load CSV data: {str(e)}"
        )

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
    
class AIInsight(BaseModel):
    insight_id: Optional[int] = None
    title: str
    description: str

class OversaturationAlert(BaseModel):
    saturation_id: int
    area: str
    riskLevel: str
    description: str
    recommendation: Optional[str] = None

class TrendAlert(BaseModel):
    trend_id: int
    pattern: str
    description: str
    impact: Optional[str] = None
    affectedAreas: Optional[List[str]] = None

class MarketTrendsResponse(BaseModel):
    ai_insights: List[AIInsight]
    oversaturation_alerts: List[OversaturationAlert]
    trend_alerts: List[TrendAlert]

# Endpoint to get current market trends for Dubai
@router.get("/current-trends", response_model=TrendSummary)
async def get_current_market_trends():
    try:
        logger.info("Fetching current market trends")
        area_trends = market_trends_service.get_area_trends()

        system_prompt = (
            "You are a JSON generator and real estate expert for Dubai's rental market trends. "
            "Return a JSON object with two keys: `daily_digest` and `area_trends`. "
            "`daily_digest` should be a list of 10 items. Each item must include: "
            "`location` (string), `change` (float), `is_increase` (boolean), and `text` (string describing the price change). "
            "`area_trends` should be a list of 4 items. Each item must include: "
            "`area` (string), `trend` (string using ↑ or ↓), and `description` (string describing the average rent trend). "
            "Only output a raw JSON object. Do not add any other explanation, formatting, or markdown. Do not include any explanations, markdown, or extra text—only return valid JSON in the specified format. Do not include any text other than the JSON object."
        )

        json_string = """
        {
        "daily_digest": [
            {
            "location": "Jumeirah Village Circle (JVC), Dubai",
            "change": 9.1,
            "is_increase": true,
            "text": "Jumeirah Village Circle (JVC), Dubai sees 9.1% increase in rental prices"
            },
            {
            "location": "Bur Dubai, Dubai",
            "change": 8.9,
            "is_increase": true,
            "text": "Bur Dubai, Dubai sees 8.9% increase in rental prices"
            }
        ],
        "area_trends": [
            {
            "area": "Downtown Dubai",
            "trend": "↑",
            "description": "Average rent increased by 9.1%"
            },
            {
            "area": "Business Bay",
            "trend": "↑",
            "description": "Average rent increased by 7.1%"
            }
        ]
        }
        """


        payload = {
            "model": MODEL_NAME,
            "system": system_prompt,
            "prompt": f"This is the JSON format to follow: {json_string}",
            "stream": False
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{OLLAMA_API_URL}/generate", json=payload)
        wrapper = resp.json()
        logger.info(f"Full AI response wrapper: {wrapper}")


        try:
            raw_response = wrapper.get("response", "{}")
            json_match = re.search(r'\{.*\}', raw_response, re.DOTALL)
            print(json_match)
            if json_match:
                headlines_data = json.loads(json_match.group())
                daily_digest = headlines_data.get("daily_digest", [])
                area_trends = headlines_data.get("area_trends", area_trends)
            else:
                raise json.JSONDecodeError("No valid JSON object found", raw_response, 0)
        except json.JSONDecodeError:
            logger.warning("AI response could not be decoded as JSON.")
            daily_digest = market_trends_service.get_daily_digest()

        logger.info(f"Generated {len(daily_digest)} daily digest headlines via AI model")
        return {"daily_digest": daily_digest, "area_trends": area_trends}

    except Exception as e:
        logger.error(f"Error in get_current_market_trends: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch market trends: {str(e)}"
        )


@router.get("/alerts", response_model=MarketTrendsResponse)
async def get_trend_spotter_alerts():
    """Use Ollama LLM to generate AI insights, market oversaturation alerts, and trend alerts based on sample listings"""
    try:
        logger.info("Starting AI insights generation via Ollama")
        # Check Ollama model service health
        health_url = f"{OLLAMA_API_URL}/tags"
        logger.info(f"Checking model health at {health_url}")
        try:
            async with httpx.AsyncClient() as client:
                health_resp = await client.get(health_url)
            logger.info(f"Model health status: {health_resp.status_code}")
            if health_resp.status_code != 200:
                logger.error(f"Model service unhealthy, status {health_resp.status_code}")
                raise HTTPException(status_code=503, detail="Model service unavailable")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Health check failed: {repr(e)}")
            raise HTTPException(status_code=503, detail="Model service unavailable")

        # Load enriched listings and select only key columns to keep prompt small
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(os.path.dirname(os.path.dirname(current_dir)), 'backend', 'data')
        enriched_path = os.path.join(data_dir, 'bayut_listings_enriched.csv')
        df_full = pd.read_csv(enriched_path)
        columns = ['location', 'current_rent', 'previous_rent', 'trend_percentage', 'price_vs_average_percent']
        df_small = df_full[columns].dropna()
        # Sample a few rows for prompt brevity
        df_sample = df_small.sample(n=min(5, len(df_small)))
        sample_data = df_sample.to_dict(orient='records')
        logger.info(f"Sample rows for AI prompt: {json.dumps(sample_data, indent=2)}")

        # Build system and user prompts enforcing JSON schema
        system_prompt = (
            "You are a real estate data analyst and JSON generator. Output strictly and only a JSON object with the following exact structure. "
            "All fields shown are required. Do not include any extra fields, markdown, or explanations. Here is the required format:\n\n"
            "{\n"
            "  \"ai_insights\": [\n"
            "    {\n"
            "      \"insight_id\": 1,\n"
            "      \"title\": \"Downtown Dubai Price Correction\",\n"
            "      \"description\": \"Downtown Dubai is experiencing a 5% price correction due to oversupply of luxury apartments. This presents a buying opportunity for long-term investors.\"\n"
            "    },\n"
            "    {\n"
            "      \"insight_id\": 2,\n"
            "      \"title\": \"Business Bay Slowing Surge\",\n"
            "      \"description\": \"Business Bay shows signs of cooling after rapid growth. Prices have stabilized over the past 2 weeks.\"\n"
            "    }\n"
            "  ],\n"
            "  \"oversaturation_alerts\": [\n"
            "    {\n"
            "      \"saturation_id\": 1,\n"
            "      \"area\": \"Jumeirah Lakes Towers\",\n"
            "      \"riskLevel\": \"High\",\n"
            "      \"description\": \"Market is oversaturated with rental properties. High competition is driving prices down.\",\n"
            "      \"recommendation\": \"Consider selling or holding properties until market conditions improve.\"\n"
            "    },\n"
            "    {\n"
            "      \"saturation_id\": 2,\n"
            "      \"area\": \"Dubai Silicon Oasis\",\n"
            "      \"riskLevel\": \"Moderate\",\n"
            "      \"description\": \"An increase in vacant listings suggests oversaturation is approaching.\",\n"
            "      \"recommendation\": \"Evaluate rental pricing strategy or diversify into other areas.\"\n"
            "    }\n"
            "  ],\n"
            "  \"trend_alerts\": [\n"
            "    {\n"
            "      \"trend_id\": 1,\n"
            "      \"pattern\": \"Rising interest in waterfront properties\",\n"
            "      \"description\": \"There's been a 25% increase in searches for waterfront properties in the last 30 days.\",\n"
            "      \"impact\": \"Positive\",\n"
            "      \"affectedAreas\": [\"Dubai Marina\", \"Palm Jumeirah\", \"JBR\"]\n"
            "    },\n"
            "    {\n"
            "      \"trend_id\": 2,\n"
            "      \"pattern\": \"Increased demand for villas\",\n"
            "      \"description\": \"Searches for 4+ bedroom villas rose by 18% month-on-month, especially in Arabian Ranches.\",\n"
            "      \"impact\": \"Positive\",\n"
            "      \"affectedAreas\": [\"Arabian Ranches\", \"Mirdif\"]\n"
            "    }\n"
            "  ]\n"
            "}\n\n"
            "Every item must include the ID field (`insight_id`, `saturation_id`, `trend_id`). Keep each list non-empty. "
            "Use concise, meaningful insights. Do not generate arrays with zero items. Do not include any boilerplate, markdown, or comments.Provide some sort of notification in each one based on the data. Do not leave any of the arrays empty. Keep the insights short and concise, like notifications. Include figures if relevant, such as percentages or numbers. Always include the location at the start of the array. If there is no relevant information for an alert, generate one in the same format as specified above. Do not include text such as Fully Furnished | Ready to Move | Canal View or Ready To Move In - One Bedroom - With One Covered ParkingLakeside, or anything else in that format with | in between, unless it is a location."
        )


        user_prompt = (
            "Here is sample listing data. Please output a JSON object with exactly three keys: 'ai_insights', 'oversaturation_alerts', and 'trend_alerts'."
            "Each key should map to an array of strings. Do not include any other text or formatting. Make sure to include all the fields in each key. Do not leave any blank. Generate 5 items for each alert type."
            f"\n\nSample Data:\n{json.dumps(sample_data, indent=2)}"
        )

        # Prepare payload with system and user prompts
        payload = {
            "model": MODEL_NAME,
            "system": system_prompt,
            "prompt": user_prompt,
            "stream": False
        }
        logger.info(f"Ollama payload prepared: {{'model': MODEL_NAME, 'stream': False}}")
        # Use a 60-second timeout for the AI call and track response time
        async with httpx.AsyncClient(timeout=60.0) as client:
            model_start = time.monotonic()
            try:
                resp = await client.post(f"{OLLAMA_API_URL}/generate", json=payload)
            except httpx.ReadTimeout as e:
                model_duration = time.monotonic() - model_start
                logger.info(f"Model timed out after {model_duration:.2f} seconds")
                logger.error(f"Read timeout when calling Ollama: {repr(e)}")
                raise HTTPException(status_code=503, detail="Model service timed out")
            model_duration = time.monotonic() - model_start
            logger.info(f"Model responded in {model_duration:.2f} seconds")
            logger.info(f"Ollama response status: {resp.status_code}")
            raw = resp.text
            # Log full raw response from the model
            logger.info(f"Full model response: {raw}")
            logger.debug(f"Ollama raw response body: {raw}")
            if resp.status_code != 200:
                logger.error(f"Ollama error {resp.status_code}: {raw}")
                raise HTTPException(status_code=500, detail=f"Ollama error: {raw}")
            # The Ollama API returns a JSON wrapper; extract the 'response' string first
            try:
                wrapper = resp.json()
            except Exception as e:
                logger.error(f"Error parsing wrapper JSON from Ollama: {repr(e)}")
                raise HTTPException(status_code=500, detail="Invalid JSON wrapper from model")
            inner_json_str = wrapper.get("response", "")
            logger.info(f"Model 'response' field: {inner_json_str}")
            # Now parse the inner JSON, with fallback to bullet parsing
            try:
                model_output = json.loads(inner_json_str)
                # Parse and filter model output
                raw_ai = model_output.get("ai_insights", [])
                raw_os = model_output.get("oversaturation_alerts", [])
                raw_tr = model_output.get("trend_alerts", [])
                ai_insights = [
                    i for i in raw_ai
                    if i.get("insight_id") is not None
                    and (
                        (i.get("description") and i["description"].strip())
                        or (i.get("title") and i["title"].strip())
                    )
                ]
                oversaturation_alerts = [
                    o for o in raw_os
                    if o.get("saturation_id") is not None
                    and (
                        (o.get("description") and o["description"].strip())
                        or (o.get("area") and o["area"].strip())
                    )
                ]
                trend_alerts = [
                    t for t in raw_tr
                    if t.get("trend_id") is not None
                    and (
                        (t.get("description") and t["description"].strip())
                        or (t.get("pattern") and t["pattern"].strip())
                    )
                ]
                return {
                    "ai_insights": ai_insights,
                    "oversaturation_alerts": oversaturation_alerts,
                    "trend_alerts": trend_alerts
                }
            except json.JSONDecodeError:
                logger.warning("Failed to parse model output JSON. Returning empty alert lists.")
                return {
                    "ai_insights": [],
                    "oversaturation_alerts": [],
                    "trend_alerts": []
                }
    except Exception as e:
        logger.error(f"Error in get_ai_insights: {repr(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate AI-driven insights: {str(e)}"
        )

# Endpoint to get a random sample of transactions
@router.get("/transactions", response_model=List[Dict[str, Any]])
async def get_transactions(chunk_size: int = 50):
    """Get a random sample of transactions from Transactions.csv"""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(os.path.dirname(os.path.dirname(current_dir)), 'backend', 'data')
        transactions_path = os.path.join(data_dir, 'Transactions.csv')
        df = pd.read_csv(transactions_path)
        sample_df = df.sample(n=min(chunk_size, len(df)))
        logger.info(f"Loaded {len(sample_df)} random transactions from {transactions_path}")
        return sample_df.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error in get_transactions: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load transactions: {str(e)}"
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

# Endpoint to get a random sample of entries from dubai_properties.csv
@router.get("/dubai-properties", response_model=List[Dict[str, Any]])
async def get_dubai_properties_sample(sample_size: int = 50):
    """Get a random sample of entries from dubai_properties.csv"""
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        data_dir = os.path.join(os.path.dirname(os.path.dirname(current_dir)), 'backend', 'data')
        dubai_path = os.path.join(data_dir, 'dubai_properties.csv')
        df = pd.read_csv(dubai_path)
        sample_df = df.sample(n=min(sample_size, len(df)))
        logger.info(f"Loaded {len(sample_df)} random dubai properties from {dubai_path}")
        return sample_df.to_dict(orient='records')
    except Exception as e:
        logger.error(f"Error in get_dubai_properties_sample: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to load dubai properties: {str(e)}"
        )

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

@router.get("/rental-trends-chart", response_model=ChartData)
async def get_rental_trends_chart():
    try:
        logger.info("Fetching rental trends chart data")
        chart_data = market_trends_service.get_rental_trends_chart()
        logger.info(f"Successfully fetched chart data with {len(chart_data['labels'])} data points")
        # Use fixed price range between AED 20,000 and AED 10,000,000 for chart data
        min_val, max_val = 20000, 10000000
        random_values = [round(random.uniform(min_val, max_val)) for _ in chart_data['labels']]
        chart_data['values'] = random_values
        return chart_data
    except Exception as e:
        logger.error(f"Error in get_rental_trends_chart: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch rental trends chart: {str(e)}"
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

# Endpoint to get overview data for the overview page (randomized each refresh)
@router.get("/overview-data", response_model=Dict[str, Any])
async def get_overview_data():
    """Return randomized area trends, rental chart data, and neighborhood shifts"""
    try:
        # Rental trends chart data: use labels from service but randomize values
        base_chart = market_trends_service.get_rental_trends_chart()
        labels = base_chart.get("labels", [])
        # Use fixed price range between AED 20,000 and AED 10,000,000 for chart data
        min_val, max_val = 20000, 10000000
        random_values = [round(random.uniform(min_val, max_val)) for _ in labels]
        chart_data = {"labels": labels, "values": random_values}
        # Generate random neighborhood shifts
        possible_areas = [
            "Dubai Marina", "Downtown Dubai", "Business Bay",
            "Jumeirah Lakes Towers", "Dubai Silicon Oasis", "Dubai Hills", "Palm Jumeirah"
        ]
        shifts = []
        for _ in range(5):
            src, dst = random.sample(possible_areas, 2)
            pct = round(random.uniform(1, 15), 1)
            shifts.append({
                "from": src,
                "to": dst,
                "percentage": pct,
                "description": f"{src} to {dst} shift of {pct}%"
            })
        # Generate random area trend cards: half up, half down
        up_areas = random.sample(possible_areas, 3)
        down_areas = random.sample([a for a in possible_areas if a not in up_areas], 3)
        area_trends = []
        for area in up_areas:
            change = round(random.uniform(1, 15), 1)
            area_trends.append({
                "area": area,
                "trend": "↑",
                "description": f"Average rent increased by {change}%"
            })
        for area in down_areas:
            change = round(random.uniform(1, 15), 1)
            area_trends.append({
                "area": area,
                "trend": "↓",
                "description": f"Average rent decreased by {change}%"
            })
        random.shuffle(area_trends)
        return {
            "rental_trends_chart": chart_data,
            "neighborhood_shifts": shifts,
            "area_trends": area_trends
        }
    except Exception as e:
        logger.error(f"Error in get_overview_data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch overview data: {str(e)}"
        )
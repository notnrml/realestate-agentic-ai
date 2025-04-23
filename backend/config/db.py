from datetime import datetime
from typing import Dict, List, Optional
import uuid
from pydantic import BaseModel
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship
from backend.config.db_config import Base


# SQL ALECHEMY CLASSES TO CONNECT WITH DB
class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True)
    source = Column(String)  # e.g. 'Zillow', 'CSV'
    external_id = Column(String)
    address = Column(String)
    city = Column(String)
    state = Column(String)
    zip_code = Column(String)
    bedrooms = Column(Integer)
    bathrooms = Column(Integer)
    sqft = Column(Integer)
    rent = Column(Integer)
    date_listed = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class TrendAnalysis(Base):
    __tablename__ = "trend_analysis"

    id = Column(Integer, primary_key=True)
    run_at = Column(DateTime, default=datetime.utcnow)
    rising_zips = Column(Text)  # Store as JSON string
    falling_zips = Column(Text)
    growth_percentiles = Column(Text)


class ROIForecast(Base):
    __tablename__ = "roi_forecasts"

    id = Column(Integer, primary_key=True)
    run_at = Column(DateTime, default=datetime.utcnow)
    predicted_roi = Column(Float)
    best_zips = Column(Text)  # JSON string
    additional_data = Column(Text)


class AgentInteraction(Base):
    __tablename__ = "agent_interactions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    query = Column(Text)
    tools_used = Column(Text)  # JSON list: ["calculate_roi"]
    final_response = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class PropertySuggestion(Base):
    __tablename__ = "property_suggestions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer)
    property_info = Column(Text)  # JSON dict
    suggested_rent = Column(Integer)
    renovation_tips = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class DataIngest(Base):
    __tablename__ = "data_ingests"

    id = Column(Integer, primary_key=True)
    source = Column(String)  # API name, 'CSV Upload'
    ingest_type = Column(String)  # e.g. 'initial', 'update'
    file_name = Column(String, nullable=True)
    ingested_at = Column(DateTime, default=datetime.utcnow)

class PropertyListing(Base):
    """Model for storing property rental listings"""
    __tablename__ = "property_listings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Property details
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    property_type = Column(String(50), nullable=False)  # Apartment, Villa, Townhouse, etc.
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    size_sqft = Column(Float, nullable=True)
    
    # Location details
    area = Column(String(100), nullable=False, index=True)  # Main area like Dubai Marina, Downtown, etc.
    sub_area = Column(String(100), nullable=True)  # Sub-location if available
    location_details = Column(String(255), nullable=True)  # Additional location info
    
    # Price details
    price = Column(Float, nullable=False, index=True)  # Annual rent in AED
    price_per_sqft = Column(Float, nullable=True)
    price_period = Column(String(20), default="yearly")  # yearly, monthly, etc.
    
    # Source information
    source = Column(String(50), nullable=False)  # PropertyFinder, PropertyMonitor, etc.
    source_id = Column(String(100), nullable=True, index=True)  # ID from the source website
    source_url = Column(String(512), nullable=True)  # URL of the listing
    
    # Status information
    available = Column(Boolean, default=True)
    featured = Column(Boolean, default=False)
    
    # Agent information
    agent_name = Column(String(100), nullable=True)
    agent_company = Column(String(100), nullable=True)
    agent_contact = Column(String(100), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    listed_date = Column(DateTime, nullable=True)  # When the property was first listed
    
    # Amenities and features (stored as JSON)
    amenities = Column(JSON, nullable=True)  # Swimming pool, gym, etc.
    
    # Relationships
    price_history = relationship("PriceHistory", back_populates="property", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<PropertyListing(id={self.id}, area='{self.area}', price={self.price}, bedrooms={self.bedrooms})>"


class PriceHistory(Base):
    """Model for storing historical price changes for properties"""
    __tablename__ = "price_history"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    property_id = Column(Integer, ForeignKey("property_listings.id"), nullable=False, index=True)
    
    # Price information
    price = Column(Float, nullable=False)  # Price at this point in time
    previous_price = Column(Float, nullable=True)  # Previous price if available
    price_change = Column(Float, nullable=True)  # Change in price (positive or negative)
    price_change_percentage = Column(Float, nullable=True)  # Percentage change
    
    # Timestamps
    recorded_date = Column(DateTime, default=datetime.utcnow)  # When this price was recorded
    effective_date = Column(DateTime, nullable=True)  # When this price became effective
    
    # Source information
    source = Column(String(50), nullable=False)  # Source of this price information
    
    # Additional notes
    notes = Column(Text, nullable=True)  # Any additional context about the price change
    
    # Relationships
    property = relationship("PropertyListing", back_populates="price_history")
    
    def __repr__(self):
        return f"<PriceHistory(id={self.id}, property_id={self.property_id}, price={self.price})>"


class AreaTrend(Base):
    """Model for storing market trends by area"""
    __tablename__ = "area_trends"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Area information
    area = Column(String(100), nullable=False, index=True)
    sub_area = Column(String(100), nullable=True)
    
    # Time period
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    period_type = Column(String(20), nullable=False)  # daily, weekly, monthly, quarterly, yearly
    
    # Key metrics
    avg_price = Column(Float, nullable=False)  # Average price for this area and period
    median_price = Column(Float, nullable=True)
    min_price = Column(Float, nullable=True)
    max_price = Column(Float, nullable=True)
    
    price_per_sqft = Column(Float, nullable=True)  # Average price per sqft
    
    listing_count = Column(Integer, nullable=False)  # Number of listings in this period
    
    # Trend indicators
    price_change = Column(Float, nullable=True)  # Change in average price vs. previous period
    price_change_percentage = Column(Float, nullable=True)  # Percentage change
    
    # Trend direction (up, down, stable)
    trend_direction = Column(String(10), nullable=True)
    
    # Property type distribution (stored as JSON)
    property_type_distribution = Column(JSON, nullable=True)
    
    # Bedroom distribution (stored as JSON)
    bedroom_distribution = Column(JSON, nullable=True)
    
    # Saturation metrics
    market_saturation_index = Column(Float, nullable=True)  # 0-100 index of market saturation
    agent_competition_level = Column(String(20), nullable=True)  # low, medium, high
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<AreaTrend(id={self.id}, area='{self.area}', period='{self.period_type}', avg_price={self.avg_price})>"


# Additional utility model to track scraping jobs
class ScrapingJob(Base):
    """Model for tracking scraping jobs"""
    __tablename__ = "scraping_jobs"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Job information
    area = Column(String(100), nullable=False)
    page_limit = Column(Integer, nullable=False, default=5)
    job_type = Column(String(50), nullable=False)  # full_scan, update, daily_digest, etc.
    
    # Status information
    status = Column(String(20), nullable=False, default="pending")  # pending, in_progress, completed, failed
    listings_found = Column(Integer, nullable=True)
    
    # Error information
    error_message = Column(Text, nullable=True)
    
    # Timestamps
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    def __repr__(self):
        return f"<ScrapingJob(id={self.id}, area='{self.area}', status='{self.status}')>"

# PYDANTIC MODELS FOR VALIDATION

class ListingBase(BaseModel):
    source: Optional[str]
    external_id: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    zip_code: str
    bedrooms: int
    bathrooms: int
    sqft: int
    rent: int
    date_listed: Optional[datetime]

class ListingCreate(ListingBase):
    pass

class ListingResponse(ListingBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class TrendAnalysisCreate(BaseModel):
    rising_zips: List[str]
    falling_zips: List[str]
    growth_percentiles: Dict[str, float]

class TrendAnalysisResponse(BaseModel):
    id: int
    run_at: datetime
    rising_zips: List[str]
    falling_zips: List[str]
    growth_percentiles: Dict[str, float]

    class Config:
        orm_mode = True


class ROIForecastCreate(BaseModel):
    predicted_roi: float
    best_zips: List[str]
    additional_data: Optional[Dict[str, float]] = None

class ROIForecastResponse(ROIForecastCreate):
    id: int
    run_at: datetime

    class Config:
        orm_mode = True

class AgentInteractionCreate(BaseModel):
    user_id: int
    query: str
    tools_used: Optional[List[str]] = []
    final_response: str

class AgentInteractionResponse(AgentInteractionCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class PropertySuggestionCreate(BaseModel):
    user_id: int
    property_info: Dict[str, str | int]
    suggested_rent: int
    renovation_tips: Optional[str] = None

class PropertySuggestionResponse(PropertySuggestionCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

class DataIngestCreate(BaseModel):
    source: str
    ingest_type: str
    file_name: Optional[str] = None

class DataIngestResponse(DataIngestCreate):
    id: int
    ingested_at: datetime

    class Config:
        orm_mode = True

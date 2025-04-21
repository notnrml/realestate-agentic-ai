from datetime import datetime
from typing import Dict, List, Optional
import uuid
from pydantic import BaseModel
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import relationship
from db_config import Base


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
    user_id = Column(Integer, ForeignKey("users.id"))
    query = Column(Text)
    tools_used = Column(Text)  # JSON list: ["calculate_roi"]
    final_response = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class PropertySuggestion(Base):
    __tablename__ = "property_suggestions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
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

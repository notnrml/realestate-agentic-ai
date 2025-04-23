import pandas as pd
from typing import List, Dict, Any
from datetime import datetime, timedelta
import os
import logging
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketTrendsService:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
        self.bayut_data = None
        self.load_data()
    
    def load_data(self):
        """Load data from CSV files"""
        try:
            # Load Bayut listings
            bayut_path = os.path.join(self.data_dir, 'bayut_listings_enriched.csv')
            if os.path.exists(bayut_path):
                self.bayut_data = pd.read_csv(bayut_path)
                logger.info(f"Loaded {len(self.bayut_data)} listings from bayut_listings.csv")
                logger.info(f"Columns in bayut_data: {list(self.bayut_data.columns)}")
                logger.info(f"Sample of bayut_data:\n{self.bayut_data.head()}")
            else:
                logger.warning(f"Bayut listings file not found at {bayut_path}")
                self.bayut_data = pd.DataFrame()
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            self.bayut_data = pd.DataFrame()
    
    def get_area_trends(self) -> List[Dict[str, Any]]:
        """Get current area trends"""
        try:
            if self.bayut_data.empty:
                return []
            
            # Group by location and calculate trends
            area_trends = []
            for location, group in self.bayut_data.groupby('location'):
                avg_price = group['current_rent'].mean()
                prev_price = group['previous_rent'].mean()
                trend = "↑" if avg_price > prev_price else "↓"
                change = abs(avg_price - prev_price) / prev_price * 100
                
                area_trends.append({
                    "area": location,
                    "trend": trend,
                    "description": f"Average rent {trend} by {change:.1f}%"
                })
            
            return area_trends
        except Exception as e:
            logger.error(f"Error getting area trends: {e}")
            return []
    
    def get_daily_digest(self) -> List[Dict[str, Any]]:
        """Get daily market digest"""
        try:
            if self.bayut_data.empty:
                return []
            
            # Get latest listings
            latest_listings = self.bayut_data.sort_values('listing_date', ascending=False).head(5)
            
            digest = []
            for _, listing in latest_listings.iterrows():
                digest.append({
                    "location": listing['location'],
                    "change": listing['price_vs_average_percent'],
                    "is_increase": listing['price_vs_average_percent'] > 0,
                    "text": f"New listing in {listing['location']} at AED {listing['current_rent']:,.0f}"
                })
            
            return digest
        except Exception as e:
            logger.error(f"Error getting daily digest: {e}")
            return []
    
    def get_rental_trends_chart(self) -> Dict[str, Any]:
        """Get rental trends chart data"""
        try:
            if self.bayut_data.empty:
                return {"labels": [], "values": []}
            
            # Group by month and calculate average rent
            self.bayut_data['month'] = pd.to_datetime(self.bayut_data['listing_date']).dt.strftime('%Y-%m')
            monthly_avg = self.bayut_data.groupby('month')['current_rent'].mean()
            
            return {
                "labels": monthly_avg.index.tolist(),
                "values": monthly_avg.values.tolist()
            }
        except Exception as e:
            logger.error(f"Error getting rental trends chart: {e}")
            return {"labels": [], "values": []}

# Create a singleton instance
market_trends_service = MarketTrendsService() 
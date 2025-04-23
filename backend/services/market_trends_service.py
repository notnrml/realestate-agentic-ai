import pandas as pd
from typing import List, Dict, Any
from datetime import datetime, timedelta
import os
import logging
import re
from pathlib import Path
import random

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketTrendsService:
    def __init__(self):
        self.data_dir = Path('data')  # Changed from 'backend/data' to 'data'
        self.bayut_data = None
        self.dubai_properties = None
        self._load_data()

    def _load_data(self):
        """Load data from CSV files"""
        try:
            logger.info(f"Attempting to read CSV files from: {self.data_dir}")
            
            # Load Bayut listings
            bayut_path = self.data_dir / 'bayut_listings.csv'
            logger.info(f"Bayut listings path: {bayut_path}")
            if bayut_path.exists():
                self.bayut_data = pd.read_csv(bayut_path)
                logger.info(f"Loaded {len(self.bayut_data)} listings from bayut_listings.csv")
            else:
                logger.warning("Bayut listings file not found, using mock data")
                self.bayut_data = self._generate_mock_bayut_data()
            
            # Load Dubai properties
            dubai_path = self.data_dir / 'dubai_properties.csv'
            logger.info(f"Dubai properties path: {dubai_path}")
            if dubai_path.exists():
                self.dubai_properties = pd.read_csv(dubai_path)
                logger.info(f"Successfully loaded dubai_properties.csv")
            else:
                logger.warning("Dubai properties file not found, using mock data")
                self.dubai_properties = self._generate_mock_dubai_data()
            
        except Exception as e:
            logger.error(f"Error loading data: {str(e)}")
            # Generate mock data if loading fails
            self.bayut_data = self._generate_mock_bayut_data()
            self.dubai_properties = self._generate_mock_dubai_data()

    def _generate_mock_bayut_data(self) -> pd.DataFrame:
        """Generate mock Bayut data for testing"""
        areas = ['Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Jumeirah Village Circle']
        data = []
        for _ in range(50):
            area = random.choice(areas)
            current_rent = random.randint(50000, 200000)
            previous_rent = current_rent * random.uniform(0.9, 1.1)
            data.append({
                'location': area,
                'current_rent': current_rent,
                'previous_rent': previous_rent
            })
        return pd.DataFrame(data)

    def _generate_mock_dubai_data(self) -> pd.DataFrame:
        """Generate mock Dubai properties data for testing"""
        areas = ['Dubai Marina', 'Downtown Dubai', 'Business Bay', 'Jumeirah Village Circle']
        data = []
        for _ in range(30):
            area = random.choice(areas)
            price = random.randint(500000, 3000000)
            data.append({
                'Location': area,
                'Rent': price,
                'Posted_date': (datetime.now() - timedelta(days=random.randint(1, 30))).strftime('%Y-%m-%d')
            })
        return pd.DataFrame(data)

    def _clean_location_name(self, location: str) -> str:
        """Extract neighborhood name from location string"""
        try:
            # Split by common separators
            parts = re.split(r'[,|]', location)
            # Get the last two non-empty parts (area and Dubai)
            parts = [part.strip() for part in parts if part.strip()]
            if len(parts) >= 2:
                # Take the second-to-last part (area) and last part (Dubai)
                area = parts[-2]
                city = parts[-1]
                # Remove any remaining property details from the area
                area = re.sub(r'\s*\|\s*.*$', '', area)
                return f"{area}, {city}"
            return location
        except Exception as e:
            logger.error(f"Error cleaning location name '{location}': {str(e)}")
            return location

    def get_area_trends(self) -> List[Dict]:
        """Calculate rental trends for different areas"""
        try:
            if self.bayut_data is None:
                self.bayut_data = self._generate_mock_bayut_data()
            
            # Group by location and calculate average rent changes
            area_trends = self.bayut_data.groupby('location').agg({
                'current_rent': 'mean',
                'previous_rent': 'mean'
            }).reset_index()
            
            # Calculate percentage change, handling zero values
            def calculate_change(row):
                if row['previous_rent'] == 0:
                    return 100 if row['current_rent'] > 0 else 0
                return ((row['current_rent'] - row['previous_rent']) / row['previous_rent'] * 100)
            
            area_trends['change_percent'] = area_trends.apply(calculate_change, axis=1).round(1)
            
            # Format the trends data
            trends = []
            for _, row in area_trends.iterrows():
                if row['previous_rent'] == 0:
                    description = "New listing" if row['current_rent'] > 0 else "No previous data"
                else:
                    description = f"Average rent {'increased' if row['change_percent'] > 0 else 'decreased'} by {abs(row['change_percent'])}%"
                
                trends.append({
                    "area": row['location'],
                    "trend": "↑" if row['change_percent'] > 0 else "↓",
                    "description": description
                })
            
            # Sort by absolute change percentage and take top 4
            trends.sort(key=lambda x: abs(float(x['description'].split()[-1].strip('%'))), reverse=True)
            return trends[:4]  # Return top 4 areas
            
        except Exception as e:
            logger.error(f"Error in get_area_trends: {str(e)}")
            # Return mock data if there's an error
            return [
                {
                    "area": "Dubai Marina",
                    "trend": "↑",
                    "description": "Average rent increased by 5.2%"
                },
                {
                    "area": "Downtown Dubai",
                    "trend": "↑",
                    "description": "Average rent increased by 3.8%"
                },
                {
                    "area": "Business Bay",
                    "trend": "↓",
                    "description": "Average rent decreased by 2.1%"
                },
                {
                    "area": "JVC",
                    "trend": "↑",
                    "description": "Average rent increased by 1.5%"
                }
            ]
    
    def get_daily_digest(self) -> List[Dict]:
        """Generate daily market digest from recent data"""
        try:
            # Get area trends
            area_trends = self.get_area_trends()
            
            # Create digest items from area trends
            digest = []
            for trend in area_trends:
                # Extract the percentage change from the description
                change_text = trend['description'].split()[-1].strip('%')
                try:
                    change = float(change_text)
                except ValueError:
                    change = 0
                
                digest.append({
                    "location": trend['area'],
                    "change": abs(change),
                    "is_increase": trend['trend'] == "↑",
                    "text": trend['description']
                })
            
            return digest
            
        except Exception as e:
            logger.error(f"Error in get_daily_digest: {str(e)}")
            # Return mock data if there's an error
            return [
                {
                    "location": "Dubai Marina",
                    "change": 5.2,
                    "is_increase": True,
                    "text": "Dubai Marina sees 5.2% increase in rental prices"
                },
                {
                    "location": "Downtown Dubai",
                    "change": 3.8,
                    "is_increase": True,
                    "text": "Downtown Dubai sees 3.8% increase in rental prices"
                },
                {
                    "location": "Business Bay",
                    "change": 2.1,
                    "is_increase": False,
                    "text": "Business Bay sees 2.1% decrease in rental prices"
                }
            ]
    
    def get_rental_trends_chart(self) -> Dict[str, Any]:
        """Get rental trends chart data"""
        try:
            if self.bayut_data is None:
                self.bayut_data = self._generate_mock_bayut_data()
            
            # Group by area and calculate average rent
            area_stats = self.bayut_data.groupby('location')['current_rent'].mean().reset_index()
            
            return {
                'labels': area_stats['location'].tolist(),
                'values': area_stats['current_rent'].tolist()
            }
        except Exception as e:
            logger.error(f"Error in get_rental_trends_chart: {str(e)}")
            # Return mock data if there's an error
            return {
                'labels': ['Dubai Marina', 'Downtown Dubai', 'Business Bay', 'JVC'],
                'values': [150000, 180000, 120000, 90000]
            }

# Create a singleton instance
market_trends_service = MarketTrendsService() 
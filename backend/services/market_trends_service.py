import pandas as pd
from typing import List, Dict
from datetime import datetime, timedelta
import os
import logging
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketTrendsService:
    def __init__(self):
        try:
            # Get the absolute path to the data directory
            current_dir = os.path.dirname(os.path.abspath(__file__))
            data_dir = os.path.join(os.path.dirname(os.path.dirname(current_dir)), 'backend', 'data')
            
            # Construct full paths to CSV files
            bayut_path = os.path.join(data_dir, 'bayut_listings.csv')
            dubai_path = os.path.join(data_dir, 'dubai_properties.csv')
            
            logger.info(f"Attempting to read CSV files from: {data_dir}")
            logger.info(f"Bayut listings path: {bayut_path}")
            logger.info(f"Dubai properties path: {dubai_path}")
            
            # Check if files exist
            if not os.path.exists(bayut_path):
                raise FileNotFoundError(f"Bayut listings file not found at: {bayut_path}")
            
            # Read CSV files
            self.bayut_data = pd.read_csv(bayut_path)
            
            # Try to read dubai_properties.csv and log its structure
            try:
                self.dubai_properties = pd.read_csv(dubai_path)
                logger.info(f"Successfully loaded dubai_properties.csv")
                logger.info(f"Columns in dubai_properties.csv: {self.dubai_properties.columns.tolist()}")
                logger.info(f"Shape of dubai_properties.csv: {self.dubai_properties.shape}")
                
                # Map the correct column names
                self.dubai_properties['clean_location'] = self.dubai_properties['Location']
                
                # Convert Posted_date to datetime
                self.dubai_properties['scraped_date'] = pd.to_datetime(self.dubai_properties['Posted_date'])
                
                # Use Rent column for current_rent
                self.dubai_properties['current_rent'] = self.dubai_properties['Rent']
                
                # Clean up the data
                self.dubai_properties = self.dubai_properties[
                    ['scraped_date', 'current_rent', 'clean_location']
                ].copy()
                
                logger.info(f"Successfully processed dubai_properties.csv data")
                
            except Exception as e:
                logger.error(f"Error reading dubai_properties.csv: {str(e)}")
                self.dubai_properties = None
            
            # Clean location names for bayut data
            self.bayut_data['clean_location'] = self.bayut_data['location'].apply(self._clean_location_name)
            
            # Convert dates to datetime
            self.bayut_data['scraped_date'] = pd.to_datetime(self.bayut_data['scraped_date'])
            
            logger.info(f"Successfully loaded CSV file. Bayut data shape: {self.bayut_data.shape}")
            
        except Exception as e:
            logger.error(f"Error initializing MarketTrendsService: {str(e)}")
            raise

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
            # Group by clean location and calculate average rent changes
            area_trends = self.bayut_data.groupby('clean_location').agg({
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
                    "area": row['clean_location'],
                    "trend": "↑" if row['change_percent'] > 0 else "↓",
                    "description": description
                })
            
            # Sort by absolute change percentage and take top 4
            trends.sort(key=lambda x: abs(float(x['description'].split()[-1].strip('%'))), reverse=True)
            return trends[:4]  # Return top 4 areas
            
        except Exception as e:
            logger.error(f"Error in get_area_trends: {str(e)}")
            raise
    
    def get_daily_digest(self) -> List[str]:
        """Generate daily market digest from recent data"""
        try:
            # Get the most recent listings
            recent_listings = self.bayut_data.sort_values('scraped_date', ascending=False).head(5)
            
            digest = []
            for _, listing in recent_listings.iterrows():
                if listing['previous_rent'] == 0:
                    change = 100 if listing['current_rent'] > 0 else 0
                else:
                    change = ((listing['current_rent'] - listing['previous_rent']) / listing['previous_rent'] * 100)
                change = round(change, 1)  # Use Python's built-in round() function
                digest.append(
                    f"{listing['clean_location']} sees {abs(change)}% {'increase' if change > 0 else 'decrease'} in rental prices"
                )
            
            return digest
            
        except Exception as e:
            logger.error(f"Error in get_daily_digest: {str(e)}")
            raise
    
    def get_rental_trends_chart(self) -> Dict:
        """Generate data for the rental trends chart"""
        try:
            # Start with bayut data
            combined_data = self.bayut_data[['scraped_date', 'current_rent', 'clean_location']].copy()
            
            # Add dubai properties data if available
            if self.dubai_properties is not None:
                dubai_data = self.dubai_properties[['scraped_date', 'current_rent', 'clean_location']].copy()
                combined_data = pd.concat([combined_data, dubai_data])
            
            # Extract month and year
            combined_data['month'] = combined_data['scraped_date'].dt.to_period('M')
            
            # Group by month and calculate average rent
            monthly_trends = combined_data.groupby('month').agg({
                'current_rent': 'mean'
            }).reset_index()
            
            # Convert month to string format for frontend
            monthly_trends['month'] = monthly_trends['month'].astype(str)
            
            # Sort by month
            monthly_trends = monthly_trends.sort_values('month')
            
            # Log the data we're sending
            logger.info(f"Chart data points: {len(monthly_trends)}")
            logger.info(f"Month range: {monthly_trends['month'].min()} to {monthly_trends['month'].max()}")
            logger.info(f"Rent range: {monthly_trends['current_rent'].min():.0f} to {monthly_trends['current_rent'].max():.0f}")
            
            return {
                "labels": monthly_trends['month'].tolist(),
                "values": monthly_trends['current_rent'].round(0).tolist()
            }
            
        except Exception as e:
            logger.error(f"Error in get_rental_trends_chart: {str(e)}")
            raise

# Create a singleton instance
market_trends_service = MarketTrendsService() 
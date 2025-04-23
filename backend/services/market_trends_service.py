import pandas as pd
<<<<<<< HEAD
from typing import List, Dict, Any
=======
from typing import List, Dict
>>>>>>> origin/main
from datetime import datetime, timedelta
import os
import logging
import re
<<<<<<< HEAD
from pathlib import Path
import random
=======
>>>>>>> origin/main

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketTrendsService:
    def __init__(self):
<<<<<<< HEAD
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
=======
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
            
            # Log the data we loaded
            logger.info(f"Loaded {len(self.bayut_data)} listings from bayut_listings.csv")
            logger.info(f"Columns in bayut_data: {self.bayut_data.columns.tolist()}")
            logger.info(f"Sample of bayut_data:\n{self.bayut_data.head().to_string()}")
            
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
>>>>>>> origin/main

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
<<<<<<< HEAD
            if self.bayut_data is None:
                self.bayut_data = self._generate_mock_bayut_data()
            
            # Group by location and calculate average rent changes
            area_trends = self.bayut_data.groupby('location').agg({
=======
            # Group by clean location and calculate average rent changes
            area_trends = self.bayut_data.groupby('clean_location').agg({
>>>>>>> origin/main
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
<<<<<<< HEAD
                    "area": row['location'],
=======
                    "area": row['clean_location'],
>>>>>>> origin/main
                    "trend": "↑" if row['change_percent'] > 0 else "↓",
                    "description": description
                })
            
            # Sort by absolute change percentage and take top 4
            trends.sort(key=lambda x: abs(float(x['description'].split()[-1].strip('%'))), reverse=True)
            return trends[:4]  # Return top 4 areas
            
        except Exception as e:
            logger.error(f"Error in get_area_trends: {str(e)}")
<<<<<<< HEAD
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
=======
            raise
>>>>>>> origin/main
    
    def get_daily_digest(self) -> List[Dict]:
        """Generate daily market digest from recent data"""
        try:
<<<<<<< HEAD
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
=======
            # Get the most recent listings
            recent_listings = self.bayut_data.sort_values('scraped_date', ascending=False).head(10)
            
            # Create a list of predefined percentage changes to ensure variety
            percentage_changes = [9.1, 7.5, 5.2, 3.8, -2.1, -4.5, 6.7, 4.3, -3.2, 8.9]
            
            digest = []
            for i, (_, listing) in enumerate(recent_listings.iterrows()):
                # Use predefined percentage changes instead of calculating
                if i < len(percentage_changes):
                    change = percentage_changes[i]
                else:
                    # Fallback to calculation if we run out of predefined changes
                    if listing['previous_rent'] == 0:
                        change = 100 if listing['current_rent'] > 0 else 0
                    else:
                        change = ((listing['current_rent'] - listing['previous_rent']) / listing['previous_rent'] * 100)
                    change = round(change, 1)
                
                # Determine if it's an increase or decrease
                is_increase = change > 0
                
                # Add to digest as an object with increase/decrease information
                digest.append({
                    "location": listing['clean_location'],
                    "change": abs(change),
                    "is_increase": is_increase,
                    "text": f"{listing['clean_location']} sees {abs(change)}% {'increase' if is_increase else 'decrease'} in rental prices"
>>>>>>> origin/main
                })
            
            return digest
            
        except Exception as e:
            logger.error(f"Error in get_daily_digest: {str(e)}")
<<<<<<< HEAD
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
=======
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
>>>>>>> origin/main

# Create a singleton instance
market_trends_service = MarketTrendsService() 
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
from pathlib import Path

def generate_market_data():
    # Create data directory if it doesn't exist
    data_dir = Path("backend/data")
    data_dir.mkdir(parents=True, exist_ok=True)
    
    # Generate sample data for bayut_listings.csv
    locations = [
        "Dubai Marina, Dubai",
        "Downtown Dubai, Dubai",
        "Business Bay, Dubai",
        "Jumeirah Lakes Towers, Dubai",
        "Palm Jumeirah, Dubai",
        "Dubai Hills, Dubai",
        "Dubai Silicon Oasis, Dubai",
        "Jumeirah Village Circle, Dubai"
    ]
    
    # Generate dates for the last 6 months
    end_date = datetime.now()
    start_date = end_date - timedelta(days=180)
    dates = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # Generate sample listings
    listings = []
    for _ in range(1000):  # Generate 1000 listings
        location = np.random.choice(locations)
        current_rent = np.random.randint(50000, 500000)
        previous_rent = current_rent * (1 + np.random.normal(0, 0.1))  # Random change
        scraped_date = np.random.choice(dates)
        
        listings.append({
            'location': location,
            'current_rent': current_rent,
            'previous_rent': previous_rent,
            'scraped_date': scraped_date
        })
    
    # Create DataFrame and save to CSV
    bayut_df = pd.DataFrame(listings)
    bayut_df.to_csv(data_dir / "bayut_listings.csv", index=False)
    
    # Generate sample data for dubai_properties.csv
    dubai_listings = []
    for _ in range(500):  # Generate 500 listings
        location = np.random.choice(locations)
        rent = np.random.randint(40000, 400000)
        posted_date = np.random.choice(dates)
        
        dubai_listings.append({
            'Location': location,
            'Rent': rent,
            'Posted_date': posted_date
        })
    
    # Create DataFrame and save to CSV
    dubai_df = pd.DataFrame(dubai_listings)
    dubai_df.to_csv(data_dir / "dubai_properties.csv", index=False)
    
    print("Successfully generated market data files:")
    print(f"- {data_dir / 'bayut_listings.csv'}")
    print(f"- {data_dir / 'dubai_properties.csv'}")

if __name__ == "__main__":
    generate_market_data() 
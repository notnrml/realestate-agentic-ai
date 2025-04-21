import requests
import pandas as pd
from datetime import datetime

#sample code for if we can find api to get the data we need
#this uses rentcast, we can probably find one for dubizzle or something

API_KEY = "your_api_key_here"  # optional for commercial APIs

def fetch_rentcast_data(zip_codes):
    listings = []

    for zip_code in zip_codes:
        response = requests.get(
            f"https://api.rentcast.io/v1/listings?zip={zip_code}",
            headers={"Authorization": f"Bearer {API_KEY}"}
        )
        data = response.json()

        for item in data.get("listings", []):
            listings.append({
                "zip": zip_code,
                "address": item.get("address"),
                "bedrooms": item.get("bedrooms"),
                "current_rent": item.get("rent"),
                "previous_rent": item.get("previous_rent", item.get("rent") * 0.95),  # fallback
                "purchase_price": item.get("price"),
                "expenses": item.get("expenses", 5000),  # fallback
                "annual_rent": item.get("rent", 0) * 12
            })

    df = pd.DataFrame(listings)
    df.to_csv("data/recent_listings.csv", index=False)
    print(f"[{datetime.now()}] Updated rental listings.")

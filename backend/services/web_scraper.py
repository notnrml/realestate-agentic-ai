import requests
from bs4 import BeautifulSoup
import pandas as pd
from datetime import datetime

#sample code for if we want to use beautifulsoup to scrape the sites for the data we need
#this uses craigslist, we'd create multiple methods for dubai sites obvs, like bayut, property finder, etc.

def fetch_from_craigslist(city="newyork", max_pages=3):
    base_url = f"https://newyork.craigslist.org/search/apa"
    listings = []

    for page in range(0, max_pages * 120, 120):
        response = requests.get(f"{base_url}?s={page}")
        soup = BeautifulSoup(response.text, "html.parser")

        for listing in soup.select(".result-info"):
            title = listing.select_one(".result-title").text
            price = listing.select_one(".result-price")
            price = int(price.text.replace("$", "")) if price else None

            listings.append({
                "title": title,
                "current_rent": price,
                "previous_rent": price * 0.95 if price else None,
                "zip": "10001",  # mocked
                "purchase_price": 400000,
                "expenses": 5000,
                "annual_rent": price * 12 if price else None
            })

    df = pd.DataFrame(listings)
    df.to_csv("data/recent_listings.csv", index=False)
    print(f"[{datetime.now()}] Scraped Craigslist and updated listings.")

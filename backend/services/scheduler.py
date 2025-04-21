# Optional: cron-style updater for trends
import time
from data_fetcher import fetch_rentcast_data
# or from craigslist_scraper import fetch_from_craigslist


def run_auto_updater(interval_hours=6):
    while True:
        print("[Updater] Fetching data...")
        fetch_rentcast_data(zip_codes=["78704", "94110", "10001"])
        # fetch_from_craigslist()  # Alternative
        time.sleep(interval_hours * 3600)

# Can be run in background or with Celery/RQ
# or as a fastapi bg task with @app.on_event("startup")

from tools.trend_tool import analyze_trends
from tools.roi_tool import forecast_roi

# After fetch, if we want it to automatically analyse the data and output results constantly.
trends = analyze_trends("data/recent_listings.csv")
roi = forecast_roi("data/recent_listings.csv")
# Save to DB or cache

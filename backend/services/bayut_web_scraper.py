import time
import re
from datetime import datetime
import random
import os
import requests
from bs4 import BeautifulSoup
import pandas as pd
import logging
import json
from urllib.parse import urljoin
from fake_useragent import UserAgent
from requests.exceptions import RequestException, ConnectionError, Timeout
from typing import Dict, List, Optional, Union, Any

# Set up logging with more detailed format
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def extract_number(text):
    """Extract numeric value from string"""
    if not text:
        return 0
    
    # Extract digits and decimals
    numbers = re.findall(r'[\d,]+\.?\d*', text)
    if numbers:
        # Take the first match and remove commas
        return float(numbers[0].replace(',', ''))
    return 0

def extract_neighborhood(location):
    """Extract neighborhood/community from location string"""
    if not location:
        return "N/A"
    
    # Split location by commas and take the second part if available
    parts = location.split(',')
    if len(parts) >= 2:
        return parts[1].strip()
    return parts[0].strip()

def extract_building_name(title, location):
    """Extract building name from title or location"""
    building = "N/A"
    
    # Try to find "in [Building Name]" pattern in title
    in_match = re.search(r'in\s+([^\d,]+)', title)
    if in_match:
        building = in_match.group(1).strip()
    elif location:
        # Take the first part of location as building name
        building = location.split(',')[0].strip()
    
    return building

def extract_from_card_text(card_text):
    """
    Extract property data from card text using improved regex patterns
    that match the actual format of the Bayut listings.
    """
    # Debug the full text
    print("PROCESSING TEXT:")
    print(card_text[:200] + "..." if len(card_text) > 200 else card_text)
    
    # Determine if this is a rental or sales listing
    is_rental = "Yearly" in card_text
    is_offplan = "Off-Plan" in card_text
    
    # Title extraction with improved handling - make date pattern more generic
    if "on " in card_text and " of " in card_text:
        # Match any date pattern like "on [date] of [month]" followed by content until AED
        title_match = re.search(r"on\s+\d+(?:st|nd|rd|th)\s+of\s+[A-Za-z]+\s+\d{4}(.*?)(?=AED)", card_text, re.DOTALL)
        title = title_match.group(1).strip() if title_match else "N/A"
    else:
        title_match = re.search(r"^(.*?)(?:AED|Off-Plan|onOff-Plan)", card_text.strip(), re.MULTILINE)
        title = title_match.group(1).strip() if title_match else "N/A"
    
    # Clean up the title to extract only area and Dubai
    if title != "N/A":
        # Remove common prefixes
        title = re.sub(r'^\d+\s*BR\s+Apartment\s+for\s+(?:Sale|Rent)\s+in\s+', '', title, flags=re.IGNORECASE)
        
        # Remove duplicate area names (e.g., "Damac Hills 2DAMAC Hills 2")
        title = re.sub(r'([A-Za-z0-9\s]+)\1+', r'\1', title)
        
        # Remove text in parentheses
        title = re.sub(r'\s*\([^)]*\)', '', title)
        
        # Remove any remaining property type indicators
        title = re.sub(r'\s+(?:Apartment|Villa|Studio|Penthouse|Townhouse)\s+', ' ', title, flags=re.IGNORECASE)
        
        # Remove "for Sale" or "for Rent" if present
        title = re.sub(r'\s+for\s+(?:Sale|Rent)', '', title, flags=re.IGNORECASE)
        
        # Remove any remaining "in" if it's at the start
        title = re.sub(r'^in\s+', '', title, flags=re.IGNORECASE)
        
        # Clean up multiple spaces
        title = re.sub(r'\s+', ' ', title).strip()
        
        # If the title doesn't end with "Dubai", add it
        if not title.endswith("Dubai"):
            title = f"{title}, Dubai"
    
    # Price extraction
    price_match = re.search(r"AED\s*([\d,]+)", card_text)
    current_rent = extract_number(price_match.group(1)) if price_match else 0
    
    # Location extraction
    if is_rental:
        # For rental properties, look for pattern after "sqft" or property description
        location_match = re.search(r"(?:sqft|FEES|Equipped Kitchen)(.*?)(?:Agent|Email|Call)", card_text, re.DOTALL)
    else:
        # For sale properties, different pattern
        location_match = re.search(r"(?:sqft|Area:.*?sqft)(.*?)(?:Property authenticity|Handover|Email|Call)", card_text, re.DOTALL)
    
    location = location_match.group(1).strip() if location_match else "N/A"
    
    # Bedrooms & Bathrooms - Updated pattern for different formats
    # First check the "YearlyXY" pattern (most common in rental listings)
    bed_bath_match = re.search(r"Yearly(\d)(\d)", card_text)
    if bed_bath_match:
        bedrooms = int(bed_bath_match.group(1))
        bathrooms = int(bed_bath_match.group(2))
    else:
        # Try to find numbers at the beginning of the description (after price)
        # Example: AED70,000Yearly12866 sqft (where 1 is bedrooms, 2 is bathrooms)
        if is_rental:
            nums_match = re.search(r"AED[\d,]+Yearly(\d)(\d)", card_text)
            if nums_match:
                bedrooms = int(nums_match.group(1))
                bathrooms = int(nums_match.group(2))
            else:
                bedrooms = 0
                bathrooms = 0
        # For off-plan properties, check for pattern like: Off-PlanAED1,050,00022796 sqft
        elif is_offplan:
            nums_match = re.search(r"(?:Off-Plan|onOff-Plan).*?AED[\d,]+(\d)(\d)", card_text)
            if nums_match:
                bedrooms = int(nums_match.group(1))
                bathrooms = int(nums_match.group(2))
            else:
                # Try to find explicit mentions like "2 BR"
                bed_match = re.search(r"(\d+)\s*BR", card_text)
                bedrooms = int(bed_match.group(1)) if bed_match else 0
                bathrooms = 0
        else:
            # Generic fallback
            bed_match = re.search(r"(\d+)\s*BR", card_text)
            bath_match = re.search(r"(\d+)\s*Bath", card_text, re.IGNORECASE)
            
            bedrooms = int(bed_match.group(1)) if bed_match else 0
            bathrooms = int(bath_match.group(1)) if bath_match else 0
    
    # Area extraction - find the area before "sqft"
    # Look for digits followed by commas and digits, then "sqft"
    area_match = re.search(r"(\d+(?:,\d+)?)\s*sqft", card_text)
    if area_match:
        area = extract_number(area_match.group(1))
    else:
        # Try an alternative pattern for "sqft" mentions
        alt_area_match = re.search(r"(\d+(?:,\d+)?)(?:\s+|-)sqft", card_text)
        area = extract_number(alt_area_match.group(1)) if alt_area_match else 0
    
    # Property type detection
    property_type = "apartment"  # default
    property_types = ['apartment', 'villa', 'house', 'studio', 'penthouse', 'townhouse']
    
    # Check explicit mentions in the card text
    for t in property_types:
        if t.lower() in card_text.lower():
            property_type = t
            break
    
    # If location contains villa/townhouse keywords, override the property type
    if location != "N/A":
        for t in ['villa', 'townhouse']:
            if t.lower() in location.lower():
                property_type = t
                break
    
    # Debug what we extracted with area
    print(f"Extracted: Title={title[:30]}..., Location={location[:30]}..., Beds={bedrooms}, Baths={bathrooms}, Area={area} sqft")
    
    return {
        "title": title.strip(),
        "property_type": property_type,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "area_sqft": area,
        "location": location.strip(),
        "current_rent": current_rent
    }

def fetch_with_requests(max_pages=3):
    """
    Scrape property listings from Bayut using requests and BeautifulSoup.
    
    Args:
        max_pages: Maximum number of pages to scrape
    
    Returns:
        List of property data dictionaries
    """
    listings = []
    base_url = "https://www.bayut.com/to-rent/property/dubai/"
    
    # Generate a random user agent
    ua = UserAgent()
    headers = {
        'User-Agent': ua.random,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
    }
    
    logger.info(f"[{datetime.now()}] Starting to scrape Bayut with requests/BeautifulSoup...")
    
    for page in range(1, max_pages + 1):
        try:
            # Format URL correctly
            url = base_url if page == 1 else f"{base_url}page/{page}/"
            logger.info(f"[{datetime.now()}] Scraping page {page}: {url}")
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Create data directory if it doesn't exist
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
            os.makedirs(data_dir, exist_ok=True)
            
            # Save HTML for debugging
            debug_file = os.path.join(data_dir, f'page_{page}_bs4.html')
            with open(debug_file, "w", encoding="utf-8") as f:
                f.write(response.text)
            
            # Try different selectors to find property cards
            property_cards = []
            for selector in ["article", "div.card", "div._357a9937", "div[data-testid*='property-card']"]:
                cards = soup.select(selector)
                if cards:
                    property_cards = cards
                    logger.info(f"Found {len(cards)} property cards using selector: {selector}")
                    break
            
            if not property_cards:
                logger.warning("Could not find property cards using BeautifulSoup.")
                continue
                
            # Process each property card
            for card in property_cards:
                try:
                    card_text = card.text
                    
                    # Use the extraction function
                    extracted_data = extract_from_card_text(card_text)
                    
                    # URL extraction
                    url_elem = card.select_one("a")
                    property_url = urljoin("https://www.bayut.com", url_elem['href']) if url_elem and 'href' in url_elem.attrs else "N/A"
                    
                    # Calculate derived fields
                    current_rent = extracted_data["current_rent"]
                    location = extracted_data["location"]
                    
                    previous_rent = current_rent * 0.95 if current_rent else None
                    annual_rent = current_rent * 12 if current_rent else None
                    neighborhood = extract_neighborhood(location)
                    building = extract_building_name(extracted_data["title"], location)
                    
                    # Create the listing dictionary
                    listing = {
                        "title": extracted_data["title"],
                        "property_type": extracted_data["property_type"],
                        "bedrooms": extracted_data["bedrooms"],
                        "bathrooms": extracted_data["bathrooms"],
                        "area_sqft": extracted_data["area_sqft"],
                        "location": location,
                        "neighborhood": neighborhood,
                        "building": building,
                        "current_rent": current_rent,
                        "previous_rent": previous_rent,
                        "annual_rent": annual_rent,
                        "url": property_url,
                        "scraped_date": datetime.now().strftime("%Y-%m-%d")
                    }
                    
                    listings.append(listing)
                    logger.info(f"Scraped: {extracted_data['title'][:40]}... - {current_rent} AED - {location[:30]}...")
                    
                except Exception as e:
                    logger.error(f"Error extracting data from a property card: {str(e)}")
                    continue
            
            # Add a small delay between pages
            time.sleep(random.uniform(2, 4))
            
        except RequestException as e:
            logger.error(f"Network error scraping page {page}: {str(e)}")
            continue
        except Exception as e:
            logger.error(f"Error scraping page {page}: {str(e)}")
            continue
    
    return listings

def fetch_from_bayut(max_pages=3):
    """
    Main function to scrape Bayut property listings using BeautifulSoup.
    
    Args:
        max_pages: Maximum number of pages to scrape
    
    Returns:
        DataFrame containing property data
    """
    try:
        listings = fetch_with_requests(max_pages)
        
        if not listings:
            logger.error("Could not scrape any listings.")
            return pd.DataFrame()
        
        # Create DataFrame from listings
        df = pd.DataFrame(listings)
        
        # Create data directory if it doesn't exist
        data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        os.makedirs(data_dir, exist_ok=True)
        
        # Save to CSV
        csv_path = os.path.join(data_dir, 'bayut_listings.csv')
        df.to_csv(csv_path, index=False)
        logger.info(f"[{datetime.now()}] Scraped {len(listings)} properties from Bayut and saved to CSV at {csv_path}")
        
        # Display DataFrame preview
        logger.info("\nDataFrame Preview:")
        if not df.empty:
            preview_columns = ['title', 'property_type', 'bedrooms', 'bathrooms', 'area_sqft', 'current_rent', 'neighborhood']
            available_columns = [col for col in preview_columns if col in df.columns]
            logger.info(f"\n{df[available_columns].head()}")
        else:
            logger.warning("No data was scraped.")
        
        return df
        
    except Exception as e:
        logger.error(f"Error in fetch_from_bayut: {str(e)}")
        return pd.DataFrame()

if __name__ == "__main__":
    try:
        df = fetch_from_bayut(max_pages=2)
        
        # Display full DataFrame
        if not df.empty:
            pd.set_option('display.max_columns', None)
            pd.set_option('display.width', 1000)
            logger.info("\nFull DataFrame:")
            logger.info(f"\n{df}")
        else:
            logger.warning("No data was collected.")
            
    except Exception as e:
        logger.error(f"Error in main: {str(e)}")
        exit(1)
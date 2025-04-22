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
        logging.FileHandler('propertyfinder_scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def test_connectivity():
    """
    Test connectivity to PropertyFinder.ae and print raw HTML
    """
    logger.info("Testing connectivity to PropertyFinder.ae...")
    
    test_url = "https://www.propertyfinder.ae/en/rent/properties-for-rent.html"
    
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
    
    try:
        logger.info(f"Sending request to: {test_url}")
        logger.info(f"Using User-Agent: {headers['User-Agent']}")
        
        response = requests.get(test_url, headers=headers, timeout=30)
        
        # Check if request was successful
        if response.status_code == 200:
            logger.info(f"Successfully connected to PropertyFinder! Status code: {response.status_code}")
            
            # Create data directory if it doesn't exist
            data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
            os.makedirs(data_dir, exist_ok=True)
            
            # Save raw HTML for inspection
            html_file = os.path.join(data_dir, 'propertyfinder_raw.html')
            with open(html_file, "w", encoding="utf-8") as f:
                f.write(response.text)
            
            logger.info(f"Raw HTML saved to: {html_file}")
            
            # Print first 1000 chars of HTML to console
            print("\n===== FIRST 1000 CHARACTERS OF RAW HTML =====")
            print(response.text[:1000])
            print("...\n")
            
            # Parse HTML and look for common elements
            soup = BeautifulSoup(response.text, "html.parser")
            
            # Check for title
            title = soup.title.text if soup.title else "No title found"
            logger.info(f"Page title: {title}")
            
            # Check for common selectors that might contain property listings
            selectors_to_try = [
                "div.property-card", 
                "article.property-card", 
                "div.card-list__item",
                "div[data-testid*='property-card']",
                ".card",
                ".property",
                ".listing"
            ]
            
            print("===== TESTING SELECTORS =====")
            for selector in selectors_to_try:
                elements = soup.select(selector)
                print(f"Selector '{selector}': Found {len(elements)} elements")
                
                # If elements found, print a sample of the first element
                if elements:
                    print(f"\nSample of first element with '{selector}':")
                    print(str(elements[0])[:300] + "...\n")
            
            return True
        else:
            logger.error(f"Failed to connect! Status code: {response.status_code}")
            logger.error(f"Response content: {response.text[:500]}...")
            return False
            
    except Exception as e:
        logger.error(f"Error testing connectivity: {str(e)}")
        return False

# Rest of your functions here (extract_number, extract_neighborhood, etc.)

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

def extract_from_property_card(card):
    """
    Extract property data from a PropertyFinder card element
    """
    try:
        # Debug the card structure
        # print(str(card)[:300])
        
        # Extract title - adjust selectors based on actual HTML structure
        title_elem = card.select_one("[data-testid*='property-card-title']")
        title = title_elem.text.strip() if title_elem else "N/A"
        
        # Extract price
        price_elem = card.select_one("[data-testid*='property-card-price']")
        price_text = price_elem.text.strip() if price_elem else "0"
        current_rent = extract_number(price_text)
        
        # Extract location
        location_elem = card.select_one("[data-testid*='property-card-location']")
        location = location_elem.text.strip() if location_elem else "N/A"
        
        # Extract property details (bedrooms, bathrooms, area)
        # Look for property specs elements
        details_elems = card.select("[data-testid*='property-card-spec']")
        
        bedrooms = 0
        bathrooms = 0
        area_sqft = 0
        
        for elem in details_elems:
            text = elem.text.strip().lower()
            if "bed" in text:
                bedrooms = extract_number(text)
            elif "bath" in text:
                bathrooms = extract_number(text)
            elif "sqft" in text or "sq. ft" in text or "sq ft" in text:
                area_sqft = extract_number(text)
        
        # Extract property type
        property_type = "apartment"  # default
        property_type_elem = card.select_one("[data-testid*='property-card-type']") or card.select_one("[data-testid*='property-type']")
        if property_type_elem:
            type_text = property_type_elem.text.strip().lower()
            if "villa" in type_text:
                property_type = "villa"
            elif "townhouse" in type_text:
                property_type = "townhouse"
            elif "apartment" in type_text:
                property_type = "apartment"
            elif "studio" in type_text:
                property_type = "studio"
            elif "penthouse" in type_text:
                property_type = "penthouse"
        
        # Extract URL - look for links inside the card
        url_elem = card.select_one("a[href*='/en/']")
        property_url = urljoin("https://www.propertyfinder.ae", url_elem['href']) if url_elem and 'href' in url_elem.attrs else "N/A"
        
        # Calculate derived fields
        neighborhood = extract_neighborhood(location)
        building = extract_building_name(title, location)
        previous_rent = current_rent * 0.95 if current_rent else None
        annual_rent = current_rent * 12 if current_rent else None
        
        logger.info(f"Extracted: {title[:30]}... - {current_rent} AED - {location[:30]}...")
        
        return {
            "title": title,
            "property_type": property_type,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "area_sqft": area_sqft,
            "location": location,
            "neighborhood": neighborhood,
            "building": building,
            "current_rent": current_rent,
            "previous_rent": previous_rent,
            "annual_rent": annual_rent,
            "url": property_url,
            "scraped_date": datetime.now().strftime("%Y-%m-%d")
        }
        
    except Exception as e:
        logger.error(f"Error extracting data from a property card: {str(e)}")
        return None

def fetch_from_propertyfinder(max_pages=3):
    """
    Scrape property listings from PropertyFinder using requests and BeautifulSoup.
    
    Args:
        max_pages: Maximum number of pages to scrape
    
    Returns:
        DataFrame containing property data
    """
    listings = []
    base_url = "https://www.propertyfinder.ae/en/rent/properties-for-rent.html"
    
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
    
    logger.info(f"[{datetime.now()}] Starting to scrape PropertyFinder with requests/BeautifulSoup...")
    
    try:
        for page in range(1, max_pages + 1):
            try:
                # Format URL correctly for pagination
                url = base_url if page == 1 else f"{base_url}?page={page}"
                logger.info(f"[{datetime.now()}] Scraping page {page}: {url}")
                
                response = requests.get(url, headers=headers, timeout=30)
                response.raise_for_status()
                
                soup = BeautifulSoup(response.text, "html.parser")
                
                # Create data directory if it doesn't exist
                data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
                os.makedirs(data_dir, exist_ok=True)
                
                # Save HTML for debugging
                debug_file = os.path.join(data_dir, f'pf_page_{page}_bs4.html')
                with open(debug_file, "w", encoding="utf-8") as f:
                    f.write(response.text)
                
                # Try different selectors to find property cards
                property_cards = []
                # Use the selector that worked in our test
                property_cards = soup.select("div[data-testid*='property-card']")
                logger.info(f"Found {len(property_cards)} property cards using data-testid selector")
                
                # Debug the first card structure
                if property_cards:
                    # Debug the first card
                    first_card = property_cards[0]
                    logger.info("First card structure:")
                    
                    # Check for common attribute patterns
                    debug_attrs = ["data-testid", "class", "id"]
                    for attr in debug_attrs:
                        elements = first_card.select(f"[{attr}]")
                        logger.info(f"Elements with {attr} attribute in first card: {len(elements)}")
                        for i, elem in enumerate(elements[:5]):  # Show only first 5 elements
                            attr_value = elem.get(attr)
                            text = elem.text.strip()[:50] if elem.text else "No text"
                            logger.info(f"  {i+1}. {elem.name} [{attr}='{attr_value}']: {text}")
                    
                    # Save first card HTML for inspection
                    with open(os.path.join(data_dir, f'pf_first_card_page_{page}.html'), "w", encoding="utf-8") as f:
                        f.write(str(first_card))

                if not property_cards:
                    logger.warning("Could not find property cards using BeautifulSoup.")
                    # Save the HTML to examine structure
                    with open(os.path.join(data_dir, f'pf_page_{page}_not_found.html'), "w", encoding="utf-8") as f:
                        f.write(response.text)
                    continue
                        
                # Process each property card
                for card in property_cards:
                    extracted_data = extract_from_property_card(card)
                    if extracted_data:
                        listings.append(extracted_data)
                
                # Add a small delay between pages
                time.sleep(random.uniform(2, 4))
                
            except RequestException as e:
                logger.error(f"Network error scraping page {page}: {str(e)}")
                continue
            except Exception as e:
                logger.error(f"Error scraping page {page}: {str(e)}")
                continue
        
        # Create DataFrame from listings
        if not listings:
            logger.error("Could not scrape any listings.")
            return pd.DataFrame()
            
        df = pd.DataFrame(listings)
        
        # Save to CSV
        csv_path = os.path.join(data_dir, 'propertyfinder_listings.csv')
        df.to_csv(csv_path, index=False)
        logger.info(f"[{datetime.now()}] Scraped {len(listings)} properties from PropertyFinder and saved to CSV at {csv_path}")
        
        # Display DataFrame preview
        logger.info("\nDataFrame Preview:")
        if not df.empty:
            preview_columns = ['title', 'property_type', 'bedrooms', 'bathrooms', 'area_sqft', 'current_rent', 'neighborhood']
            available_columns = [col for col in preview_columns if col in df.columns]
            logger.info(f"\n{df[available_columns].head()}")
        
        return df
        
    except Exception as e:
        logger.error(f"Error in fetch_from_propertyfinder: {str(e)}")
        return pd.DataFrame()

def test_scrape_and_print():
    """
    Test function to scrape property data and print it to console in a readable format
    """
    logger.info("Testing property scraping and printing...")
    
    # Read the saved HTML file
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    html_file = os.path.join(data_dir, 'propertyfinder_raw.html')
    
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Parse HTML
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Find all property cards
        property_cards = soup.select("[data-testid*='property-card']")
        
        if not property_cards:
            logger.warning("No property cards found with the primary selector. Trying alternative selectors...")
            # Try alternative selectors
            property_cards = soup.select("div.card-list__item") or \
                           soup.select("article.property-card") or \
                           soup.select(".property-card")
        
        logger.info(f"Found {len(property_cards)} property cards")
        
        # Process each property card
        for i, card in enumerate(property_cards, 1):
            property_data = extract_from_property_card(card)
            
            if property_data:
                print("\n" + "="*80)
                print(f"PROPERTY #{i}")
                print("="*80)
                print(f"Title: {property_data['title']}")
                print(f"Type: {property_data['property_type'].title()}")
                print(f"Price: {property_data['current_rent']:,.0f} AED/year")
                print(f"Bedrooms: {property_data['bedrooms']}")
                print(f"Bathrooms: {property_data['bathrooms']}")
                print(f"Area: {property_data['area_sqft']:,.0f} sq ft")
                print(f"Location: {property_data['location']}")
                print(f"Neighborhood: {property_data['neighborhood']}")
                print(f"Building: {property_data['building']}")
                print(f"URL: {property_data['url']}")
                print("-"*80)
        
        return True
        
    except Exception as e:
        logger.error(f"Error in test_scrape_and_print: {str(e)}")
        return False

if __name__ == "__main__":
    # Test connectivity and save HTML
    if test_connectivity():
        # Test scraping and printing
        test_scrape_and_print()
    else:
        logger.error("Failed to test connectivity. Cannot proceed with scraping test.")